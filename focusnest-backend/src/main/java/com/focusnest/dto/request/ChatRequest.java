package com.focusnest.dto.request;
import java.util.List;
import java.util.Map;

public class ChatRequest {
    public String                    message;
    public List<Map<String, String>> history;

    public String                    getMessage() { return message; }
    public List<Map<String, String>> getHistory()  { return history; }
}
