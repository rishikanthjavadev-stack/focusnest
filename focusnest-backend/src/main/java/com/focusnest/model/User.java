package com.focusnest.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    @Column(nullable = false, unique = true)
    private String email;
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('STUDENT','RESEARCHER','PROFESSIONAL','FREELANCER')")
    private UserRole role = UserRole.STUDENT;

    private Integer dailyGoalMinutes = 60;
    private Boolean pomodoroMode = true;
    private Integer streakCount = 0;
    private LocalDate lastStudyDate;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('LOCAL','GOOGLE','GITHUB')")
    private AuthProvider authProvider = AuthProvider.LOCAL;

    private String providerId;
    private String avatarUrl;
    private Boolean onboardingDone = false;
    private LocalDateTime createdAt;
    private Boolean isAdmin = false;
    private String resetToken;
    private java.time.LocalDateTime resetTokenExpiry;
    private LocalDateTime updatedAt;

    public User() {}

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final User u = new User();
        public Builder name(String v)              { u.name = v; return this; }
        public Builder email(String v)             { u.email = v; return this; }
        public Builder passwordHash(String v)      { u.passwordHash = v; return this; }
        public Builder avatarUrl(String v)         { u.avatarUrl = v; return this; }
        public Builder authProvider(AuthProvider v){ u.authProvider = v; return this; }
        public Builder onboardingDone(Boolean v)   { u.onboardingDone = v; return this; }
        public Builder role(UserRole v)            { u.role = v; return this; }
        public User build() { return u; }
    }

    @PrePersist  protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate   protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public Long getId()                  { return id; }
    public String getName()              { return name; }
    public String getEmail()             { return email; }
    public String getPasswordHash()      { return passwordHash; }
    public UserRole getRole()            { return role; }
    public Integer getDailyGoalMinutes() { return dailyGoalMinutes; }
    public Boolean getPomodoroMode()     { return pomodoroMode; }
    public Integer getStreakCount()      { return streakCount; }
    public LocalDate getLastStudyDate()  { return lastStudyDate; }
    public AuthProvider getAuthProvider(){ return authProvider; }
    public String getProviderId()        { return providerId; }
    public String getAvatarUrl()         { return avatarUrl; }
    public Boolean getOnboardingDone()   { return onboardingDone; }
    public LocalDateTime getCreatedAt()  { return createdAt; }
    public Boolean getIsAdmin()                              { return isAdmin; }
    public void setIsAdmin(Boolean v)                        { isAdmin = v; }
    public String getResetToken()                            { return resetToken; }
    public void setResetToken(String v)                      { resetToken = v; }
    public java.time.LocalDateTime getResetTokenExpiry()     { return resetTokenExpiry; }
    public void setResetTokenExpiry(java.time.LocalDateTime v) { resetTokenExpiry = v; }
    public LocalDateTime getUpdatedAt()  { return updatedAt; }

    public void setId(Long v)                  { id = v; }
    public void setName(String v)              { name = v; }
    public void setEmail(String v)             { email = v; }
    public void setPasswordHash(String v)      { passwordHash = v; }
    public void setRole(UserRole v)            { role = v; }
    public void setDailyGoalMinutes(Integer v) { dailyGoalMinutes = v; }
    public void setPomodoroMode(Boolean v)     { pomodoroMode = v; }
    public void setStreakCount(Integer v)      { streakCount = v; }
    public void setLastStudyDate(LocalDate v)  { lastStudyDate = v; }
    public void setAuthProvider(AuthProvider v){ authProvider = v; }
    public void setProviderId(String v)        { providerId = v; }
    public void setAvatarUrl(String v)         { avatarUrl = v; }
    public void setOnboardingDone(Boolean v)   { onboardingDone = v; }

    public enum UserRole     { STUDENT, RESEARCHER, PROFESSIONAL, FREELANCER }
    public enum AuthProvider { LOCAL, GOOGLE, GITHUB }
}
