package com.focusnest.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class AdminUserResponse {
    public Long          id;
    public String        name;
    public String        email;
    public String        role;
    public Boolean       isAdmin;
    public Integer       streakCount;
    public LocalDate     lastStudyDate;
    public LocalDateTime createdAt;
    public Integer       totalSessions;
    public Integer       totalNotes;
    public Integer       totalStudySeconds;

    public AdminUserResponse(Long id, String name, String email, String role,
            Boolean isAdmin, Integer streakCount, LocalDate lastStudyDate,
            LocalDateTime createdAt, Integer totalSessions,
            Integer totalNotes, Integer totalStudySeconds) {
        this.id               = id;
        this.name             = name;
        this.email            = email;
        this.role             = role;
        this.isAdmin          = isAdmin;
        this.streakCount      = streakCount;
        this.lastStudyDate    = lastStudyDate;
        this.createdAt        = createdAt;
        this.totalSessions    = totalSessions;
        this.totalNotes       = totalNotes;
        this.totalStudySeconds= totalStudySeconds;
    }
}
