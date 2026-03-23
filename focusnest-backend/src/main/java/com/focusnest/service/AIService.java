package com.focusnest.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;

@Service
public class AIService {

    @Value("${anthropic.api-key:}")
    private String apiKey;

    private final HttpClient  http   = HttpClient.newHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    public String chat(String systemPrompt, List<Map<String,String>> messages) throws Exception {
        Map<String, Object> body = new HashMap<>();
        body.put("model",      "claude-sonnet-4-20250514");
        body.put("max_tokens", 1024);
        body.put("system",     systemPrompt);
        body.put("messages",   messages);

        String json = mapper.writeValueAsString(body);

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("https://api.anthropic.com/v1/messages"))
            .header("Content-Type",      "application/json")
            .header("x-api-key",         apiKey)
            .header("anthropic-version", "2023-06-01")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build();

        HttpResponse<String> response = http.send(request,
            HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Claude API error: " + response.body());
        }

        Map<?, ?> result   = mapper.readValue(response.body(), Map.class);
        List<?>   content  = (List<?>) result.get("content");
        Map<?, ?> first    = (Map<?, ?>) content.get(0);
        return (String) first.get("text");
    }

    public Map<String,String> userMessage(String text) {
        return Map.of("role", "user", "content", text);
    }

    public Map<String,String> assistantMessage(String text) {
        return Map.of("role", "assistant", "content", text);
    }
}
