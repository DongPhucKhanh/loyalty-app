package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.model.dto.ChatRequest;
import com.doan.loyaltyapp.repository.CustomerRepository;
import com.doan.loyaltyapp.service.GeminiService; // Nhớ import Service Gemini
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
    private GeminiService geminiService; // Sử dụng Gemini Service

    @PostMapping("/ask")
    public ResponseEntity<?> chatWithBot(@RequestBody ChatRequest request) {
        try {
            // 1. LẤY THÔNG TIN KHÁCH HÀNG (Xử lý an toàn tránh lỗi Null)
            Customer customer = null;
            // Chỉ tìm trong DB nếu frontend gửi lên ID (tức là đã đăng nhập)
            if (request.getCustomerId() != null) {
                customer = customerRepository.findById(request.getCustomerId()).orElse(null);
            }

            // 2. CHUẨN BỊ DỮ LIỆU NGỮ CẢNH (CONTEXT) CHO AI
            String customerName = "bạn";
            String pointBalance = "0";
            String tier = "Khách mới";

            if (customer != null) {
                customerName = customer.getName();
                pointBalance = String.valueOf(customer.getPointBalance());
                tier = customer.getTier() != null ? customer.getTier() : "Thành viên";
            }

            // 3. TẠO "SYSTEM PROMPT" (Kịch bản dạy AI)
            // Đây là phần quan trọng nhất để AI trả lời đúng trọng tâm
            String systemInstruction = String.format(
                "Bạn là Trợ lý ảo AI của ứng dụng Loyalty (Tích điểm đổi quà). " +
                "Hãy trả lời ngắn gọn, thân thiện, hài hước bằng Tiếng Việt. " +
                "Tuyệt đối không bịa đặt thông tin. " +
                "--- THÔNG TIN KHÁCH HÀNG ĐANG CHAT --- " +
                "Tên: %s. " +
                "Điểm hiện tại: %s điểm. " +
                "Hạng thành viên: %s. " +
                "--- QUY TẮC TRẢ LỜI --- " +
                "1. Nếu khách hỏi về điểm số, hãy trả lời chính xác số điểm ở trên. " +
                "2. Nếu khách hỏi đổi quà, hãy gợi ý: 'Cứ 1000 điểm sẽ đổi được Voucher 100k'. " +
                "3. Nếu điểm khách thấp (<100), hãy động viên họ mua hàng thêm để tích điểm. " +
                "4. Nếu khách hỏi hạng, hãy trả lời hạng hiện tại và cách để lên hạng (Vàng cần 5000 điểm).",
                customerName, pointBalance, tier
            );

            // 4. GỌI GEMINI API
            // Gửi kịch bản + câu hỏi của khách sang Google xử lý
            String botResponse = geminiService.askGemini(systemInstruction, request.getMessage());

            // 5. TRẢ KẾT QUẢ VỀ FRONTEND
            Map<String, String> resp = new HashMap<>();
            resp.put("response", botResponse);
            
            return ResponseEntity.ok(resp);

        } catch (Exception e) {
            e.printStackTrace(); // In lỗi ra console để debug nếu cần
            return ResponseEntity.badRequest().body("Lỗi xử lý tin nhắn: " + e.getMessage());
        }
    }
}