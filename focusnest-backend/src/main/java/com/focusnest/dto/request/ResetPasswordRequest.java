package com.focusnest.dto.request;
public class ResetPasswordRequest {
    public String token;
    public String newPassword;
    public String getToken()       { return token; }
    public String getNewPassword() { return newPassword; }
}
