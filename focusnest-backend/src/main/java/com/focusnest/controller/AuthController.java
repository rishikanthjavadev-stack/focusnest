package com.focusnest.controller;

import com.focusnest.dto.request.*;
import com.focusnest.dto.response.AuthResponse;
import com.focusnest.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
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
}
