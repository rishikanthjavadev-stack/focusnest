package com.focusnest.dto.response;

import java.util.List;

public class AnalyticsResponse {
    public List<DayData>  weeklyData;
    public Integer        totalWeekSeconds;
    public Integer        totalWeekSessions;
    public Integer        streakDays;
    public Integer        todaySeconds;
    public Double         avgSessionMinutes;
    public String         bestDay;
    public Integer        bestDaySeconds;

    public static class DayData {
        public String  day;
        public String  date;
        public Integer seconds;
        public Integer sessions;
        public DayData(String day, String date, Integer seconds, Integer sessions) {
            this.day = day; this.date = date;
            this.seconds = seconds; this.sessions = sessions;
        }
    }

    public AnalyticsResponse(List<DayData> weeklyData, Integer totalWeekSeconds,
            Integer totalWeekSessions, Integer streakDays, Integer todaySeconds,
            Double avgSessionMinutes, String bestDay, Integer bestDaySeconds) {
        this.weeklyData        = weeklyData;
        this.totalWeekSeconds  = totalWeekSeconds;
        this.totalWeekSessions = totalWeekSessions;
        this.streakDays        = streakDays;
        this.todaySeconds      = todaySeconds;
        this.avgSessionMinutes = avgSessionMinutes;
        this.bestDay           = bestDay;
        this.bestDaySeconds    = bestDaySeconds;
    }
}
