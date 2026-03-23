package com.focusnest.controller;

import com.focusnest.dto.request.ChatRequest;
import com.focusnest.dto.request.PlanRequest;
import com.focusnest.dto.response.ChatResponse;
import com.focusnest.model.User;
import com.focusnest.repository.StudySessionRepository;
import com.focusnest.repository.UserRepository;
import com.focusnest.service.AIService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@RestController
@RequestMapping("/ai")
public class AIController {

    private final AIService              aiService;
    private final UserRepository         userRepo;
    private final StudySessionRepository sessionRepo;

    public AIController(AIService aiService, UserRepository userRepo,
                        StudySessionRepository sessionRepo) {
        this.aiService   = aiService;
        this.userRepo    = userRepo;
        this.sessionRepo = sessionRepo;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(
            @RequestBody ChatRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Not found"));

            // Get user stats for context
            LocalDateTime todayStart = LocalDateTime.now().with(LocalTime.MIDNIGHT);
            LocalDateTime todayEnd   = todayStart.plusDays(1);
            Integer todaySecs    = sessionRepo.getTotalSecondsInRange(user.getId(), todayStart, todayEnd);
            Integer todaySessions= sessionRepo.countCompletedInRange(user.getId(), todayStart, todayEnd);
            if (todaySecs     == null) todaySecs     = 0;
            if (todaySessions == null) todaySessions = 0;

            String systemPrompt = String.format("""
                You are FocusNest AI — a friendly, motivating study coach built into the FocusNest app.
                You help users stay focused, build study habits, and learn effectively.

                Current user context:
                - Name: %s
                - Streak: %d days
                - Today's study time: %d minutes
                - Today's sessions completed: %d

                Keep responses concise (2-4 sentences max unless explaining a concept).
                Be warm, encouraging, and practical. Use emojis sparingly.
                If asked about study techniques, give actionable advice.
                """,
                user.getName(),
                user.getStreakCount() != null ? user.getStreakCount() : 0,
                todaySecs / 60,
                todaySessions
            );

            List<Map<String,String>> messages = new ArrayList<>();
            if (req.getHistory() != null) messages.addAll(req.getHistory());
            messages.add(aiService.userMessage(req.getMessage()));

            String reply = aiService.chat(systemPrompt, messages);
            return ResponseEntity.ok(new ChatResponse(reply));

        } catch (Exception e) {
            return ResponseEntity.ok(new ChatResponse(
                "Sorry, I'm having trouble connecting right now. Please try again! 🪺"));
        }
    }

    @PostMapping("/plan")
    public ResponseEntity<ChatResponse> generatePlan(
            @RequestBody PlanRequest req,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userRepo.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("Not found"));

            String systemPrompt = """
                You are FocusNest AI — a study planner. Generate a structured 7-day study schedule.
                Format your response as clean, readable markdown with day headers.
                Each day should have specific time blocks, topics, and session types (Focus/Break).
                Be specific and realistic. Keep it motivating.
                """;

            String userMsg = String.format("""
                Create a 7-day study plan for %s with these details:
                - Skills to study: %s
                - Daily study goal: %d minutes
                - Available time slots: %s
                - Main goal: %s

                Format each day clearly with time blocks and what to study.
                """,
                user.getName(),
                req.getSkills() != null ? String.join(", ", req.getSkills()) : "General",
                req.getDailyMinutes() != null ? req.getDailyMinutes() : 60,
                req.getAvailableSlots() != null ? String.join(", ", req.getAvailableSlots()) : "Evening",
                req.getGoal() != null ? req.getGoal() : "Build consistent study habits"
            );

            String plan = aiService.chat(systemPrompt, List.of(aiService.userMessage(userMsg)));
            return ResponseEntity.ok(new ChatResponse(plan));

        } catch (Exception e) {
            return ResponseEntity.ok(new ChatResponse(
                "Sorry, couldn't generate plan right now. Please try again! 🪺"));
        }
    }
}
