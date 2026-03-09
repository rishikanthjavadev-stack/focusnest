package com.focusnest.dto.response;
import java.time.LocalDateTime;
import java.util.List;

public class NoteResponse {
    public Long          id;
    public String        title;
    public String        content;
    public List<String>  tags;
    public String        topic;
    public Boolean       isPinned;
    public Boolean       isResearch;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;

    public NoteResponse(Long id, String title, String content, List<String> tags,
                        String topic, Boolean isPinned, Boolean isResearch,
                        LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id         = id;
        this.title      = title;
        this.content    = content;
        this.tags       = tags;
        this.topic      = topic;
        this.isPinned   = isPinned;
        this.isResearch = isResearch;
        this.createdAt  = createdAt;
        this.updatedAt  = updatedAt;
    }
}
