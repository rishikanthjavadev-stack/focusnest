package com.focusnest.dto.request;

public class StartSessionRequest {
    public String sessionType = "FOCUS";
    public Long   skillId;
    public String getSessionType() { return sessionType; }
    public Long   getSkillId()     { return skillId; }
}
