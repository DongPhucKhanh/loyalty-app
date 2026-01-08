package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.model.Reward;
import com.doan.loyaltyapp.repository.CustomerRepository;
import com.doan.loyaltyapp.repository.RewardRepository;
import com.doan.loyaltyapp.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*") // Cho phép Frontend gọi API từ các domain khác nhau
public class ChatAIController {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private RewardRepository rewardRepository;

    @PostMapping("/ask")
    public String askAI(@RequestParam Long customerId, @RequestBody Map<String, String> payload) {
        // 1. Lấy tin nhắn từ khách hàng
        String userMessage = payload.get("message");
        if (userMessage == null || userMessage.isEmpty()) {
            return "Dạ, em chưa nhận được câu hỏi của Anh/Chị ạ.";
        }
        
        // 2. Lấy thông tin khách hàng để AI biết khách là ai
        Customer customer = customerRepository.findById(customerId).orElse(null);
        
        // 3. Lấy danh sách quà tặng để AI biết có những quà gì để tư vấn
        List<Reward> rewards = rewardRepository.findAll();
        String rewardList = rewards.stream()
                .filter(r -> r.getStockQuantity() > 0)
                .map(r -> String.format("- %s (Cần %d điểm, Loại: %s)", r.getName(), r.getPointCost(), r.getType()))
                .collect(Collectors.joining("\n"));

        // 4. Xây dựng ngữ cảnh (Context) chi tiết cho AI
        StringBuilder contextBuilder = new StringBuilder();
        if (customer != null) {
            contextBuilder.append(String.format("KHÁCH HÀNG: %s, SĐT: %s, ĐIỂM HIỆN TẠI: %d, HẠNG: %s.\n", 
                    customer.getName(), customer.getPhone(), customer.getPointBalance(), customer.getTier()));
        } else {
            contextBuilder.append("KHÁCH HÀNG: Chưa đăng nhập hoặc không tìm thấy thông tin.\n");
        }
        
        contextBuilder.append("DANH SÁCH QUÀ HIỆN CÓ ĐỂ ĐỔI:\n").append(rewardList);

        // 5. Gửi sang GeminiService để nhận phản hồi
        return geminiService.getChatResponse(userMessage, contextBuilder.toString());
    }
}