package com.focusnest.service;

import com.focusnest.dto.response.AdminUserResponse;
import com.focusnest.model.User;
import com.focusnest.repository.NoteRepository;
import com.focusnest.repository.StudySessionRepository;
import com.focusnest.repository.UserRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository        userRepo;
    private final StudySessionRepository sessionRepo;
    private final NoteRepository        noteRepo;

    public AdminService(UserRepository userRepo,
                        StudySessionRepository sessionRepo,
                        NoteRepository noteRepo) {
        this.userRepo    = userRepo;
        this.sessionRepo = sessionRepo;
        this.noteRepo    = noteRepo;
    }

    public List<AdminUserResponse> getAllUsers() {
        return userRepo.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public AdminUserResponse getUser(Long id) {
        return userRepo.findById(id).map(this::toResponse)
            .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public void toggleAdmin(Long id) {
        User user = userRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setIsAdmin(user.getIsAdmin() == null || !user.getIsAdmin());
        userRepo.save(user);
    }

    public void deleteUser(Long id) {
        userRepo.deleteById(id);
    }

    private AdminUserResponse toResponse(User u) {
        LocalDateTime from = LocalDateTime.now().minusYears(10);
        LocalDateTime to   = LocalDateTime.now().with(LocalTime.MAX);

        Integer sessions = sessionRepo.countCompletedInRange(u.getId(), from, to);
        Integer notes    = noteRepo.countByUserId(u.getId());
        Integer secs     = sessionRepo.getTotalSecondsInRange(u.getId(), from, to);

        return new AdminUserResponse(
            u.getId(), u.getName(), u.getEmail(),
            u.getRole() != null ? u.getRole().name() : "STUDENT",
            u.getIsAdmin() != null && u.getIsAdmin(),
            u.getStreakCount() != null ? u.getStreakCount() : 0,
            u.getLastStudyDate(),
            u.getCreatedAt(),
            sessions != null ? sessions : 0,
            notes    != null ? notes    : 0,
            secs     != null ? secs     : 0
        );
    }
}
