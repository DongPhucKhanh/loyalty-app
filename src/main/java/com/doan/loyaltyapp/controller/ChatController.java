package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.model.dto.ChatRequest;
import com.doan.loyaltyapp.repository.CustomerRepository;
import com.doan.loyaltyapp.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private GeminiService geminiService;

    @PostMapping("/ask")
    public ResponseEntity<?> chatWithBot(@RequestBody ChatRequest request) {
        try {
            // 1. CHUẨN BỊ DỮ LIỆU MẶC ĐỊNH (Nếu khách chưa đăng nhập)
            String name = "Bạn";
            String tier = "Khách vãng lai";
            int points = 0;

            // 2. LẤY DỮ LIỆU TỪ DATABASE (Để sửa lỗi 0 điểm)
            // Kiểm tra xem Frontend có gửi ID lên không
            if (request.getCustomerId() != null) {
                Customer customer = customerRepository.findById(request.getCustomerId()).orElse(null);
                if (customer != null) {
                    name = customer.getName(); // Lấy tên thật
                    tier = customer.getTier() != null ? customer.getTier() : "Mới"; // Lấy hạng thật
                    points = customer.getPointBalance(); // Lấy điểm thật
                }
            }

            // 3. GỌI GEMINI SERVICE (Phiên bản Thục nữ)
            // Lưu ý: Hàm này giờ nhận 4 tham số riêng biệt như ta đã sửa ở Service
            String botResponse = geminiService.askGemini(name, tier, points, request.getMessage());

            // 4. TRẢ KẾT QUẢ VỀ
            Map<String, String> resp = new HashMap<>();
            resp.put("response", botResponse);
            
            return ResponseEntity.ok(resp);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Lỗi xử lý tin nhắn: " + e.getMessage());
        }
    }
}