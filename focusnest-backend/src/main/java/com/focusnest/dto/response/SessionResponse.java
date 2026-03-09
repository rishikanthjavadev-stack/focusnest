package com.focusnest.dto.response;

import java.time.LocalDateTime;

public class SessionResponse {
    public Long          id;
    public String        sessionType;
    public String        status;
    public LocalDateTime actualStart;
    public Integer       durationSeconds;

    public SessionResponse(Long id, String sessionType, String status,
                           LocalDateTime actualStart, Integer durationSeconds) {
        this.id              = id;
        this.sessionType     = sessionType;
        this.status          = status;
        this.actualStart     = actualStart;
        this.durationSeconds = durationSeconds;
    }
}
