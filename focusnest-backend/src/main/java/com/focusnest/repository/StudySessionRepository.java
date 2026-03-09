package com.focusnest.repository;

import com.focusnest.model.StudySession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;

public interface StudySessionRepository extends JpaRepository<StudySession, Long> {

    List<StudySession> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT COALESCE(SUM(s.durationSeconds), 0) FROM StudySession s " +
           "WHERE s.userId = :userId AND s.status = 'COMPLETED' " +
           "AND s.actualStart >= :from AND s.actualStart <= :to")
    Integer getTotalSecondsInRange(Long userId, LocalDateTime from, LocalDateTime to);

    @Query("SELECT COUNT(s) FROM StudySession s WHERE s.userId = :userId " +
           "AND s.status = 'COMPLETED' AND s.sessionType = 'FOCUS' " +
           "AND s.actualStart >= :from AND s.actualStart <= :to")
    Integer countCompletedInRange(Long userId, LocalDateTime from, LocalDateTime to);
}
