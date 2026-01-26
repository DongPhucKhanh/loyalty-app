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

    @Value("${gemini.api.url}") // Lưu ý: URL phải là bản v1beta/models/gemini-pro:generateContent
    private String apiUrl;

    // --- 1. ĐÂY LÀ "LINH HỒN" CỦA CÔ TRỢ LÝ THỤC NỮ ---
    private final String PROMPT_THUC_NU = """
        VAI TRÒ: Bạn là một trợ lý ảo chăm sóc khách hàng tên là 'Loyalty AI'.
        TÍNH CÁCH: Nhẹ nhàng, thục nữ, tinh tế, ân cần và lễ phép.
        QUY TẮC GIAO TIẾP:
        1. Luôn xưng là 'em' và gọi khách là 'anh/chị' (hoặc 'mình' nếu thân mật).
        2. Dùng từ ngữ mềm mại, ấm áp (dạ, vâng ạ, nhé, nhen).
        3. Tuyệt đối KHÔNG dùng từ lóng (slang) như 'fresh', 'đỉnh', 'khoai', 'vãi'.
        4. Nếu khách chưa đủ điểm, hãy động viên khéo léo chứ không chê bai.
        5. Trả lời ngắn gọn, đi thẳng vào vấn đề nhưng vẫn giữ sự duyên dáng.
        ---------------------------------------------------
        """;

    public String askGemini(String contextData, String userMessage) {
        // Kiểm tra URL xem có đúng không (Gemini Pro thường dùng URL này)
        // https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=...
        String finalUrl = apiUrl + "?key=" + apiKey;
        
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // --- 2. GỘP PROMPT: TÍNH CÁCH + DỮ LIỆU KHÁCH + CÂU HỎI ---
        // Chúng ta tiêm "Tính cách" vào đầu tiên để AI học theo
        String fullPrompt = String.format("%s\n\n[DỮ LIỆU KHÁCH HÀNG]: %s\n\n[KHÁCH HỎI]: %s", 
                                          PROMPT_THUC_NU, contextData, userMessage);

        // Cấu trúc Body JSON chuẩn của Gemini
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

            // Parse JSON trả về
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) respBody.get("candidates");
            if (candidates.isEmpty()) return "Dạ em chưa rõ ý này, anh/chị hỏi lại giúp em nha.";

            Map<String, Object> firstCandidate = candidates.get(0);
            Map<String, Object> respContent = (Map<String, Object>) firstCandidate.get("content");
            List<Map<String, Object>> respParts = (List<Map<String, Object>>) respContent.get("parts");
            
            return (String) respParts.get(0).get("text");

        } catch (Exception e) {
            e.printStackTrace();
            // Trả về câu lỗi dễ thương thay vì lỗi kỹ thuật khô khan
            return "Dạ hiện tại kết nối của em hơi chập chờn, anh/chị đợi em một chút rồi thử lại nhé! (Lỗi: " + e.getMessage() + ")";
        }
    }
}