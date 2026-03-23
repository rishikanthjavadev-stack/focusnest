package com.focusnest.controller;

import com.focusnest.dto.response.AdminUserResponse;
import com.focusnest.model.User;
import com.focusnest.repository.UserRepository;
import com.focusnest.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AdminService   adminService;
    private final UserRepository userRepo;

    public AdminController(AdminService adminService, UserRepository userRepo) {
        this.adminService = adminService;
        this.userRepo     = userRepo;
    }

    // Guard: only admins can call these
    private void requireAdmin(UserDetails userDetails) {
        User user = userRepo.findByEmail(userDetails.getUsername())
            .orElseThrow(() -> new UsernameNotFoundException("Not found"));
        if (user.getIsAdmin() == null || !user.getIsAdmin()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admins only");
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserResponse>> getAllUsers(
            @AuthenticationPrincipal UserDetails u) {
        requireAdmin(u);
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<AdminUserResponse> getUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails u) {
        requireAdmin(u);
        return ResponseEntity.ok(adminService.getUser(id));
    }

    @PutMapping("/users/{id}/toggle-admin")
    public ResponseEntity<Map<String,String>> toggleAdmin(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails u) {
        requireAdmin(u);
        adminService.toggleAdmin(id);
        return ResponseEntity.ok(Map.of("message", "Admin status toggled"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails u) {
        requireAdmin(u);
        adminService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String,Object>> getStats(
            @AuthenticationPrincipal UserDetails u) {
        requireAdmin(u);
        List<AdminUserResponse> users = adminService.getAllUsers();
        long totalUsers    = users.size();
        long totalSessions = users.stream().mapToLong(x -> x.totalSessions).sum();
        long totalNotes    = users.stream().mapToLong(x -> x.totalNotes).sum();
        long totalHours    = users.stream().mapToLong(x -> x.totalStudySeconds).sum() / 3600;
        long adminCount    = users.stream().filter(x -> Boolean.TRUE.equals(x.isAdmin)).count();
        return ResponseEntity.ok(Map.of(
            "totalUsers",    totalUsers,
            "totalSessions", totalSessions,
            "totalNotes",    totalNotes,
            "totalHours",    totalHours,
            "adminCount",    adminCount
        ));
    }
}
