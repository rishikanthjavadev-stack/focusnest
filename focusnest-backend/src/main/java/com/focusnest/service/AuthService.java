package com.focusnest.service;

import com.focusnest.dto.request.*;
import com.focusnest.dto.response.AuthResponse;
import com.focusnest.model.User;
import com.focusnest.repository.UserRepository;
import com.focusnest.security.JwtTokenProvider;
import org.springframework.security.authentication.*;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider jwt;
    private final AuthenticationManager authManager;

    public AuthService(UserRepository userRepo, PasswordEncoder encoder,
                       JwtTokenProvider jwt, AuthenticationManager authManager) {
        this.userRepo     = userRepo;
        this.encoder      = encoder;
        this.jwt          = jwt;
        this.authManager  = authManager;
    }

    public AuthResponse register(RegisterRequest r) {
        if (userRepo.existsByEmail(r.getEmail()))
            throw new RuntimeException("Email already registered");

        User u = User.builder()
            .name(r.getName()).email(r.getEmail())
            .passwordHash(encoder.encode(r.getPassword()))
            .authProvider(User.AuthProvider.LOCAL)
            .onboardingDone(false).build();
        userRepo.save(u);

        return new AuthResponse(
            jwt.generateAccessToken(u.getEmail()),
            jwt.generateRefreshToken(u.getEmail()),
            u.getId(), u.getName(), u.getEmail(), false);
    }

    public AuthResponse login(LoginRequest r) {
        authManager.authenticate(
            new UsernamePasswordAuthenticationToken(r.getEmail(), r.getPassword()));

        User u = userRepo.findByEmail(r.getEmail())
            .orElseThrow(() -> new UsernameNotFoundException("Not found"));

        return new AuthResponse(
            jwt.generateAccessToken(u.getEmail()),
            jwt.generateRefreshToken(u.getEmail()),
            u.getId(), u.getName(), u.getEmail(), u.getOnboardingDone());
    }

    public AuthResponse refresh(String refreshToken) {
        if (!jwt.validate(refreshToken))
            throw new RuntimeException("Invalid refresh token");

        String email = jwt.getEmail(refreshToken);
        User u = userRepo.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Not found"));

        return new AuthResponse(
            jwt.generateAccessToken(email), refreshToken,
            u.getId(), u.getName(), u.getEmail(), u.getOnboardingDone());
    }
}
