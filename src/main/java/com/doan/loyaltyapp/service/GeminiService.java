package com.doan.loyaltyapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.*;

@Service
public class GeminiService {

    @Value("${google.gemini.api-key}")
    private String apiKey;

    @Value("${google.gemini.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public String getChatResponse(String userPrompt, String customerContext) {
        // Chỉ dẫn hệ thống
        String systemInstruction = "Bạn là trợ lý AI của DongPhucKhanh. " +
                "Quy tắc: 10.000đ = 1 điểm. Trả lời thân thiện, xưng Em với khách.";

        String fullPrompt = systemInstruction + "\n\n" + customerContext + "\n\nKhách hỏi: " + userPrompt;

        // Cấu trúc Payload chuẩn
        Map<String, Object> requestBody = new HashMap<>();
        Map<String, Object> content = new HashMap<>();
        Map<String, String> part = new HashMap<>();
        part.put("text", fullPrompt);
        content.put("parts", Collections.singletonList(part));
        requestBody.put("contents", Collections.singletonList(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            // Trim API Key để xóa khoảng trắng ẩn
            String url = apiUrl + "?key=" + apiKey.trim();
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            
            if (response.getBody() != null && response.getBody().containsKey("candidates")) {
                List candidates = (List) response.getBody().get("candidates");
                if (!candidates.isEmpty()) {
                    Map firstCandidate = (Map) candidates.get(0);
                    Map contentNode = (Map) firstCandidate.get("content");
                    List parts = (List) contentNode.get("parts");
                    return (String) ((Map) parts.get(0)).get("text");
                }
            }
            return "Dạ, em chưa tìm thấy câu trả lời phù hợp.";
        } catch (Exception e) {
            return "Lỗi kết nối AI: " + e.getMessage();
        }
    }
}