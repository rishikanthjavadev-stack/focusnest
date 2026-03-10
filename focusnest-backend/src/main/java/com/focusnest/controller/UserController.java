package com.focusnest.controller;

import com.focusnest.dto.request.UpdateProfileRequest;
import com.focusnest.dto.response.UserResponse;
import com.focusnest.model.User;
import com.focusnest.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository  userRepo;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepo, PasswordEncoder passwordEncoder) {
        this.userRepo        = userRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepo.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new UsernameNotFoundException("Not found"));
        return ResponseEntity.ok(toResponse(user));
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(
            @RequestBody UpdateProfileRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepo.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new UsernameNotFoundException("Not found"));

        if (req.getName() != null && !req.getName().isBlank()) {
            user.setName(req.getName());
        }

        if (req.getNewPassword() != null && !req.getNewPassword().isBlank()) {
            if (req.getCurrentPassword() == null ||
                !passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
                return ResponseEntity.badRequest()
                    .body(java.util.Map.of("message", "Current password is incorrect"));
            }
            if (req.getNewPassword().length() < 8) {
                return ResponseEntity.badRequest()
                    .body(java.util.Map.of("message", "Password must be at least 8 characters"));
            }
            user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        }

        userRepo.save(user);
        return ResponseEntity.ok(toResponse(user));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
            user.getId(), user.getName(), user.getEmail(),
            user.getRole() != null ? user.getRole().name() : "STUDENT",
            user.getStreakCount(),
            user.getLastStudyDate(),
            user.getCreatedAt() != null ? user.getCreatedAt().toLocalDate().toString() : null,
            user.getIsAdmin() != null && user.getIsAdmin()
        );
    }
}
