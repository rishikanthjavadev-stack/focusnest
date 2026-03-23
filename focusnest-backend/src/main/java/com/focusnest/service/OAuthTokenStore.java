package com.focusnest.service;

import org.springframework.stereotype.Component;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

@Component
public class OAuthTokenStore {

    private static final ConcurrentHashMap<String, Map<String, String>> store = new ConcurrentHashMap<>();

    public static String store(String accessToken, String refreshToken) {
        String code = UUID.randomUUID().toString();
        store.put(code, Map.of("accessToken", accessToken, "refreshToken", refreshToken));
        // Auto-expire after 2 minutes
        Executors.newSingleThreadScheduledExecutor()
            .schedule(() -> store.remove(code), 2, TimeUnit.MINUTES);
        return code;
    }

    public static Map<String, String> exchange(String code) {
        return store.remove(code); // one-time use
    }
}
