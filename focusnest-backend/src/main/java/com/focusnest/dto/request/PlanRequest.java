package com.focusnest.dto.request;
import java.util.List;

public class PlanRequest {
    public List<String> skills;
    public Integer      dailyMinutes;
    public List<String> availableSlots;
    public String       goal;

    public List<String> getSkills()         { return skills; }
    public Integer      getDailyMinutes()   { return dailyMinutes; }
    public List<String> getAvailableSlots() { return availableSlots; }
    public String       getGoal()           { return goal; }
}
