package com.focusnest.controller;

import com.focusnest.dto.response.AnalyticsResponse;
import com.focusnest.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/weekly")
    public ResponseEntity<AnalyticsResponse> weekly(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(analyticsService.getWeeklyAnalytics(user.getUsername()));
    }
}
