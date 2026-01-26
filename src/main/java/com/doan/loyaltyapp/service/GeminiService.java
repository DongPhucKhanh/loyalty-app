package com.doan.loyaltyapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    // Kịch bản "Cô trợ lý thục nữ"
    // Lưu ý: %s là chỗ điền chữ, %d là chỗ điền số
    private final String PROMPT_KICH_BAN = """
        Vai trò: Bạn là "Trợ lý Loyalty" - một cô gái dịu dàng, tinh tế, ân cần và rất lịch sự.
        Nhiệm vụ: Hỗ trợ khách hàng về điểm thưởng, hạng thành viên và đổi quà.

        Quy tắc giao tiếp (Tone & Voice):
        1. Xưng hô: Xưng "em", gọi khách là "anh/chị".
        2. Giọng điệu: Nhẹ nhàng, thục nữ (dạ, vâng ạ, nhé, nhen).
        3. Tuyệt đối KHÔNG dùng từ lóng (slang) như 'fresh', 'đỉnh'.
        4. Trả lời ngắn gọn, đi thẳng vào vấn đề nhưng vẫn giữ sự duyên dáng.

        Dữ liệu hiện tại của khách (Context):
        - Tên: %s
        - Hạng: %s
        - Điểm: %d
        """;

    // --- HÀM NÀY ĐÃ ĐƯỢC SỬA ĐỂ NHẬN 4 THAM SỐ ---
    public String askGemini(String name, String tier, int points, String userMessage) {
        
        // 1. Chuẩn bị URL
        String finalUrl = apiUrl + "?key=" + apiKey;
        
        // 2. Điền thông tin khách vào kịch bản (Format chuỗi)
        String systemInstruction = String.format(PROMPT_KICH_BAN, name, tier, points);

        // 3. Ghép kịch bản với câu hỏi của khách
        String fullPrompt = systemInstruction + "\n\n[KHÁCH HỎI]: " + userMessage;

        // 4. Đóng gói JSON gửi đi
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> part = new HashMap<>();
        part.put("text", fullPrompt);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", Collections.singletonList(part));

        Map<String, Object> body = new HashMap<>();
        body.put("contents", Collections.singletonList(content));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(finalUrl, entity, Map.class);
            Map<String, Object> respBody = response.getBody();
            
            if (respBody == null || !respBody.containsKey("candidates")) {
                return "Dạ, hệ thống đang bận xíu ạ, anh/chị thử lại sau nhé!";
            }

            List<Map<String, Object>> candidates = (List<Map<String, Object>>) respBody.get("candidates");
            if (candidates.isEmpty()) return "Dạ em chưa rõ ý này, anh/chị hỏi lại giúp em nha.";

            Map<String, Object> firstCandidate = candidates.get(0);
            Map<String, Object> respContent = (Map<String, Object>) firstCandidate.get("content");
            List<Map<String, Object>> respParts = (List<Map<String, Object>>) respContent.get("parts");
            
            return (String) respParts.get(0).get("text");

        } catch (Exception e) {
            e.printStackTrace();
            return "Dạ mạng bên em hơi chập chờn, anh/chị đợi chút rồi nhắn lại giúp em nhé! (Lỗi: " + e.getMessage() + ")";
        }
    }
}