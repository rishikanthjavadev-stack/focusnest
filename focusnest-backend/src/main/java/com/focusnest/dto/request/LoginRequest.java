package com.focusnest.dto.request;
import jakarta.validation.constraints.*;

public class LoginRequest {
    @Email @NotBlank public String email;
    @NotBlank        public String password;

    public String getEmail()    { return email; }
    public String getPassword() { return password; }
}
