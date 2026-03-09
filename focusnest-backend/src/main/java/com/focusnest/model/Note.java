package com.focusnest.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notes")
public class Note {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long skillId;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String content;

    private Boolean isPinned    = false;
    private Boolean isResearch  = false;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist  protected void onCreate() { createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate   protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public Long      getId()         { return id; }
    public Long      getUserId()     { return userId; }
    public Long      getSkillId()    { return skillId; }
    public String    getTitle()      { return title; }
    public String    getContent()    { return content; }
    public Boolean   getIsPinned()   { return isPinned; }
    public Boolean   getIsResearch() { return isResearch; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }

    public void setId(Long v)           { id = v; }
    public void setUserId(Long v)       { userId = v; }
    public void setSkillId(Long v)      { skillId = v; }
    public void setTitle(String v)      { title = v; }
    public void setContent(String v)    { content = v; }
    public void setIsPinned(Boolean v)  { isPinned = v; }
    public void setIsResearch(Boolean v){ isResearch = v; }
    public void setUpdatedAt(LocalDateTime v) { updatedAt = v; }
}
