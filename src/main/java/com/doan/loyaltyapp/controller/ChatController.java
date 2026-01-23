package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.repository.CustomerRepository;
import com.doan.loyaltyapp.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*") // Đảm bảo Frontend React có thể gọi API
public class ChatController {

    @Autowired private GeminiService geminiService;
    @Autowired private CustomerRepository customerRepository;

   @PostMapping("/ask")
public String askAI(@RequestBody Map<String, Object> payload) { // Đổi sang Object
    try {
        String userMessage = (String) payload.get("message");
        
        // Xử lý lấy ID an toàn bất kể Frontend gửi chuỗi hay số
        Object idObj = payload.get("customerId");
        if (idObj == null) return "Lỗi: Không tìm thấy ID khách hàng.";
        
        Long customerId = Long.parseLong(idObj.toString());

        Customer customer = customerRepository.findById(customerId).orElse(null);
        String context = "Dữ liệu hệ thống: Khách hàng hiện chưa đăng nhập.";
        
        if (customer != null) {
            context = String.format("Dữ liệu hệ thống: Khách hàng %s, hiện có %d điểm, hạng %s.",
                    customer.getName(), customer.getPointBalance(), customer.getTier());
        }

        return geminiService.getChatResponse(userMessage, context);
    } catch (Exception e) {
        return "Lỗi xử lý tại Controller: " + e.getMessage();
    }
}
}