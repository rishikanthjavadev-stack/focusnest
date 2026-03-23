package com.focusnest.repository;

import com.focusnest.model.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface NoteRepository extends JpaRepository<Note, Long> {

    Integer countByUserId(Long userId);

    List<Note> findByUserIdOrderByIsPinnedDescCreatedAtDesc(Long userId);

    @Query("SELECT n FROM Note n WHERE n.userId = :userId AND " +
           "(LOWER(n.title) LIKE LOWER(CONCAT('%',:q,'%')) OR " +
           "LOWER(n.content) LIKE LOWER(CONCAT('%',:q,'%')))" +
           "ORDER BY n.isPinned DESC, n.createdAt DESC")
    List<Note> searchByUserId(Long userId, String q);
}
