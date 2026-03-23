package com.focusnest.controller;

import com.focusnest.dto.request.*;
import com.focusnest.dto.response.AuthResponse;
import com.focusnest.service.AuthService;
import com.focusnest.service.OAuthTokenStore;
import com.focusnest.service.PasswordResetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService          authService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService,
                          PasswordResetService passwordResetService) {
        this.authService          = authService;
        this.passwordResetService = passwordResetService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest r) {
        return ResponseEntity.ok(authService.register(r));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest r) {
        return ResponseEntity.ok(authService.login(r));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody RefreshRequest r) {
        return ResponseEntity.ok(authService.refresh(r.getRefreshToken()));
    }

    @PostMapping("/token/exchange")
    public ResponseEntity<?> exchangeCode(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        if (code == null) return ResponseEntity.badRequest().body(Map.of("message", "Missing code"));
        Map<String, String> tokens = OAuthTokenStore.exchange(code);
        if (tokens == null) return ResponseEntity.badRequest().body(Map.of("message", "Invalid or expired code"));
        return ResponseEntity.ok(tokens);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest req) {
        try {
            passwordResetService.sendResetEmail(req.getEmail());
        } catch (Exception e) {
            // Silent fail — don't reveal if email exists
        }
        return ResponseEntity.ok(Map.of("message",
            "If that email is registered, a reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        if (req.getNewPassword() == null || req.getNewPassword().length() < 8) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Password must be at least 8 characters"));
        }
        boolean ok = passwordResetService.resetPassword(req.getToken(), req.getNewPassword());
        if (!ok) return ResponseEntity.badRequest()
            .body(Map.of("message", "Invalid or expired reset token"));
        return ResponseEntity.ok(Map.of("message", "Password reset successful"));
    }
}
