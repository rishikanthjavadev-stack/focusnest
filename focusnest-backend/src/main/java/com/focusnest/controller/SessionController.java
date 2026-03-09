package com.focusnest.controller;

import com.focusnest.dto.request.*;
import com.focusnest.dto.response.*;
import com.focusnest.service.SessionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/sessions")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
    }

    @PostMapping("/start")
    public ResponseEntity<SessionResponse> start(
            @RequestBody StartSessionRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(sessionService.startSession(user.getUsername(), req));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<SessionResponse> complete(
            @PathVariable Long id,
            @RequestBody CompleteSessionRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(sessionService.completeSession(user.getUsername(), id, req));
    }

    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> stats(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(sessionService.getStats(user.getUsername()));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<SessionResponse>> recent(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(sessionService.getRecentSessions(user.getUsername()));
    }
}
