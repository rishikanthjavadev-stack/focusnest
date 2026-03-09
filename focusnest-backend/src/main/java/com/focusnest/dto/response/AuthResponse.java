package com.focusnest.dto.response;

public class AuthResponse {
    public String  accessToken;
    public String  refreshToken;
    public Long    userId;
    public String  name;
    public String  email;
    public Boolean onboardingDone;

    public AuthResponse(String accessToken, String refreshToken,
                        Long userId, String name, String email, Boolean onboardingDone) {
        this.accessToken   = accessToken;
        this.refreshToken  = refreshToken;
        this.userId        = userId;
        this.name          = name;
        this.email         = email;
        this.onboardingDone = onboardingDone;
    }
}
