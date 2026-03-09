package com.focusnest.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "study_sessions")
public class StudySession {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long skillId;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('FOCUS','BREAK','RESEARCH')")
    private SessionType sessionType = SessionType.FOCUS;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "ENUM('SCHEDULED','ACTIVE','COMPLETED','MISSED','SKIPPED')")
    private SessionStatus status = SessionStatus.SCHEDULED;

    private LocalDateTime scheduledStart;
    private LocalDateTime scheduledEnd;
    private LocalDateTime actualStart;
    private LocalDateTime actualEnd;
    private Integer durationSeconds = 0;
    private LocalDateTime createdAt;

    @PrePersist protected void onCreate() { createdAt = LocalDateTime.now(); }

    public enum SessionType   { FOCUS, BREAK, RESEARCH }
    public enum SessionStatus { SCHEDULED, ACTIVE, COMPLETED, MISSED, SKIPPED }

    public Long getId()                     { return id; }
    public Long getUserId()                 { return userId; }
    public Long getSkillId()                { return skillId; }
    public SessionType getSessionType()     { return sessionType; }
    public SessionStatus getStatus()        { return status; }
    public LocalDateTime getScheduledStart(){ return scheduledStart; }
    public LocalDateTime getScheduledEnd()  { return scheduledEnd; }
    public LocalDateTime getActualStart()   { return actualStart; }
    public LocalDateTime getActualEnd()     { return actualEnd; }
    public Integer getDurationSeconds()     { return durationSeconds; }
    public LocalDateTime getCreatedAt()     { return createdAt; }

    public void setId(Long v)                      { id = v; }
    public void setUserId(Long v)                  { userId = v; }
    public void setSkillId(Long v)                 { skillId = v; }
    public void setSessionType(SessionType v)      { sessionType = v; }
    public void setStatus(SessionStatus v)         { status = v; }
    public void setScheduledStart(LocalDateTime v) { scheduledStart = v; }
    public void setScheduledEnd(LocalDateTime v)   { scheduledEnd = v; }
    public void setActualStart(LocalDateTime v)    { actualStart = v; }
    public void setActualEnd(LocalDateTime v)      { actualEnd = v; }
    public void setDurationSeconds(Integer v)      { durationSeconds = v; }
}
