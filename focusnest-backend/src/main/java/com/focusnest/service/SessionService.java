package com.focusnest.service;

import com.focusnest.dto.request.*;
import com.focusnest.dto.response.*;
import com.focusnest.model.StudySession;
import com.focusnest.model.User;
import com.focusnest.repository.StudySessionRepository;
import com.focusnest.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SessionService {

    private final StudySessionRepository sessionRepo;
    private final UserRepository userRepo;

    public SessionService(StudySessionRepository sessionRepo, UserRepository userRepo) {
        this.sessionRepo = sessionRepo;
        this.userRepo    = userRepo;
    }

    public SessionResponse startSession(String email, StartSessionRequest req) {
        User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        StudySession s = new StudySession();
        s.setUserId(user.getId());
        s.setSkillId(req.getSkillId());
        s.setSessionType(StudySession.SessionType.valueOf(req.getSessionType()));
        s.setStatus(StudySession.SessionStatus.ACTIVE);
        s.setActualStart(LocalDateTime.now());
        sessionRepo.save(s);

        return new SessionResponse(s.getId(), s.getSessionType().name(),
            s.getStatus().name(), s.getActualStart(), 0);
    }

    public SessionResponse completeSession(String email, Long sessionId,
                                           CompleteSessionRequest req) {
        StudySession s = sessionRepo.findById(sessionId)
            .orElseThrow(() -> new RuntimeException("Session not found"));

        s.setStatus(StudySession.SessionStatus.COMPLETED);
        s.setActualEnd(LocalDateTime.now());
        s.setDurationSeconds(req.getDurationSeconds());
        sessionRepo.save(s);

        // Update streak
        User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        updateStreak(user);

        return new SessionResponse(s.getId(), s.getSessionType().name(),
            s.getStatus().name(), s.getActualStart(), s.getDurationSeconds());
    }

    public StatsResponse getStats(String email) {
        User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        LocalDateTime todayStart = LocalDateTime.now().with(LocalTime.MIDNIGHT);
        LocalDateTime todayEnd   = todayStart.plusDays(1);
        LocalDateTime weekStart  = todayStart.minusDays(7);

        Integer todaySeconds  = sessionRepo.getTotalSecondsInRange(user.getId(), todayStart, todayEnd);
        Integer todaySessions = sessionRepo.countCompletedInRange(user.getId(), todayStart, todayEnd);
        Integer weekSeconds   = sessionRepo.getTotalSecondsInRange(user.getId(), weekStart, todayEnd);

        return new StatsResponse(todaySeconds, todaySessions, weekSeconds,
            user.getStreakCount() != null ? user.getStreakCount() : 0);
    }

    public List<SessionResponse> getRecentSessions(String email) {
        User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return sessionRepo.findByUserIdOrderByCreatedAtDesc(user.getId())
            .stream().limit(10)
            .map(s -> new SessionResponse(s.getId(), s.getSessionType().name(),
                s.getStatus().name(), s.getActualStart(), s.getDurationSeconds()))
            .collect(Collectors.toList());
    }

    private void updateStreak(User user) {
        java.time.LocalDate today = java.time.LocalDate.now();
        java.time.LocalDate last  = user.getLastStudyDate();
        if (last == null || last.isBefore(today.minusDays(1))) {
            user.setStreakCount(1);
        } else if (last.isBefore(today)) {
            user.setStreakCount((user.getStreakCount() == null ? 0 : user.getStreakCount()) + 1);
        }
        user.setLastStudyDate(today);
        userRepo.save(user);
    }
}
