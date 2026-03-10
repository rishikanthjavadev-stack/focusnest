package com.focusnest.dto.response;

import java.time.LocalDate;

public class UserResponse {
    public Long      id;
    public String    name;
    public String    email;
    public String    role;
    public Integer   streakCount;
    public LocalDate lastStudyDate;
    public String    createdAt;
    public Boolean   isAdmin;

    public UserResponse(Long id, String name, String email, String role,
                        Integer streakCount, LocalDate lastStudyDate, String createdAt,
                        Boolean isAdmin) {
        this.id            = id;
        this.name          = name;
        this.email         = email;
        this.role          = role;
        this.streakCount   = streakCount;
        this.lastStudyDate = lastStudyDate;
        this.createdAt     = createdAt;
        this.isAdmin       = isAdmin;
    }
}
