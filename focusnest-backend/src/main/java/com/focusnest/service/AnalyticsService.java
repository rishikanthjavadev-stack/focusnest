package com.focusnest.service;

import com.focusnest.dto.response.AnalyticsResponse;
import com.focusnest.dto.response.AnalyticsResponse.DayData;
import com.focusnest.model.StudySession;
import com.focusnest.model.User;
import com.focusnest.repository.StudySessionRepository;
import com.focusnest.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final StudySessionRepository sessionRepo;
    private final UserRepository userRepo;

    public AnalyticsService(StudySessionRepository sessionRepo, UserRepository userRepo) {
        this.sessionRepo = sessionRepo;
        this.userRepo    = userRepo;
    }

    public AnalyticsResponse getWeeklyAnalytics(String email) {
        User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Not found"));

        LocalDate today     = LocalDate.now();
        LocalDate weekStart = today.minusDays(6);

        // Build day-by-day data
        List<DayData> weeklyData = new ArrayList<>();
        String bestDay = "";
        int bestDaySeconds = 0;

        for (int i = 6; i >= 0; i--) {
            LocalDate date  = today.minusDays(i);
            LocalDateTime from = date.atStartOfDay();
            LocalDateTime to   = date.atTime(LocalTime.MAX);

            Integer secs     = sessionRepo.getTotalSecondsInRange(user.getId(), from, to);
            Integer sessions = sessionRepo.countCompletedInRange(user.getId(), from, to);
            if (secs == null) secs = 0;
            if (sessions == null) sessions = 0;

            String dayName = date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            String dateStr = date.getMonthValue() + "/" + date.getDayOfMonth();
            weeklyData.add(new DayData(dayName, dateStr, secs, sessions));

            if (secs > bestDaySeconds) { bestDaySeconds = secs; bestDay = dayName; }
        }

        // Week totals
        LocalDateTime weekFrom = weekStart.atStartOfDay();
        LocalDateTime weekTo   = today.atTime(LocalTime.MAX);
        Integer totalWeekSecs  = sessionRepo.getTotalSecondsInRange(user.getId(), weekFrom, weekTo);
        Integer totalWeekSess  = sessionRepo.countCompletedInRange(user.getId(), weekFrom, weekTo);
        if (totalWeekSecs  == null) totalWeekSecs  = 0;
        if (totalWeekSess  == null) totalWeekSess  = 0;

        // Today
        Integer todaySecs = sessionRepo.getTotalSecondsInRange(
            user.getId(), today.atStartOfDay(), today.atTime(LocalTime.MAX));
        if (todaySecs == null) todaySecs = 0;

        // Avg session
        List<StudySession> weekSessions = sessionRepo.findCompletedInRange(
            user.getId(), weekFrom, weekTo);
        double avg = weekSessions.stream()
            .mapToInt(s -> s.getDurationSeconds() != null ? s.getDurationSeconds() : 0)
            .average().orElse(0.0) / 60.0;

        int streak = user.getStreakCount() != null ? user.getStreakCount() : 0;

        return new AnalyticsResponse(weeklyData, totalWeekSecs, totalWeekSess,
            streak, todaySecs, Math.round(avg * 10.0) / 10.0, bestDay, bestDaySeconds);
    }
}
