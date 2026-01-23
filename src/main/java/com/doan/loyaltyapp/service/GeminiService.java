package com.doan.loyaltyapp.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
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
    String systemInstruction = "Bạn là trợ lý AI của DongPhucKhanh. Quy tắc: 1% doanh thu = điểm. Xưng Em.";
    String fullPrompt = systemInstruction + "\n\n" + customerContext + "\n\nKhách hỏi: " + userPrompt;

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
        // Đảm bảo URL chính xác và Model là gemini-1.5-flash
        String url = apiUrl + "?key=" + apiKey.trim();
        ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
        
        // Bóc tách kết quả
        if (response.getBody() != null && response.getBody().containsKey("candidates")) {
            List candidates = (List) response.getBody().get("candidates");
            Map firstCandidate = (Map) candidates.get(0);
            Map contentNode = (Map) firstCandidate.get("content");
            List parts = (List) contentNode.get("parts");
            return (String) ((Map) parts.get(0)).get("text");
        }
        return "Dạ, em chưa có câu trả lời.";
    } catch (HttpClientErrorException e) {
        // IN LỖI CHI TIẾT RA CONSOLE ĐỂ KIỂM TRA API KEY
        System.out.println("CHI TIẾT LỖI GOOGLE: " + e.getResponseBodyAsString());
        return "Dạ, hệ thống AI đang gặp lỗi: " + e.getStatusCode();
    } catch (Exception e) {
        return "Lỗi kết nối: " + e.getMessage();
    }
}
}