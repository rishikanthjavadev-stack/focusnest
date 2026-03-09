package com.focusnest.dto.response;

public class StatsResponse {
    public Integer todaySeconds;
    public Integer todaySessions;
    public Integer weekSeconds;
    public Integer streakDays;

    public StatsResponse(Integer todaySeconds, Integer todaySessions,
                         Integer weekSeconds, Integer streakDays) {
        this.todaySeconds   = todaySeconds;
        this.todaySessions  = todaySessions;
        this.weekSeconds    = weekSeconds;
        this.streakDays     = streakDays;
    }
}
