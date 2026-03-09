package com.focusnest.dto.request;
import java.util.List;

public class NoteRequest {
    public String       title;
    public String       content;
    public List<String> tags;
    public String       topic;
    public Boolean      isPinned   = false;
    public Boolean      isResearch = false;

    public String       getTitle()      { return title; }
    public String       getContent()    { return content; }
    public List<String> getTags()       { return tags; }
    public String       getTopic()      { return topic; }
    public Boolean      getIsPinned()   { return isPinned; }
    public Boolean      getIsResearch() { return isResearch; }
}
