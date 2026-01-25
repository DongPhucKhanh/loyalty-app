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

    public String askGemini(String systemInstruction, String userMessage) {
        // Gemini dùng URL kèm Key luôn
        String finalUrl = apiUrl + "?key=" + apiKey;
        
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Cấu trúc Body của Gemini khác với xAI/ChatGPT
        Map<String, Object> body = new HashMap<>();
        
        // Gộp lời nhắc hệ thống và câu hỏi người dùng thành 1 đoạn văn
        // Vì bản Free của Gemini cấu trúc chat hơi phức tạp, ta dùng cách đơn giản nhất:
        String fullPrompt = systemInstruction + "\n\nUser Question: " + userMessage;
        
        Map<String, Object> parts = new HashMap<>();
        parts.put("text", fullPrompt);
        
        Map<String, Object> contents = new HashMap<>();
        contents.put("parts", Collections.singletonList(parts));
        
        body.put("contents", Collections.singletonList(contents));

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(finalUrl, entity, Map.class);
            Map<String, Object> respBody = response.getBody();
            
            // Phân tích JSON trả về của Google: candidates[0].content.parts[0].text
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) respBody.get("candidates");
            Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
            List<Map<String, Object>> respParts = (List<Map<String, Object>>) content.get("parts");
            
            return (String) respParts.get(0).get("text");

        } catch (Exception e) {
            e.printStackTrace(); 
            // SỬA DÒNG NÀY: Trả về chi tiết lỗi thực sự thay vì câu thông báo chung chung
            return "Lỗi kỹ thuật: " + e.getMessage();
        }
    }
}