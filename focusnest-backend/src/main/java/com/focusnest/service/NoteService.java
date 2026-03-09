package com.focusnest.service;

import com.focusnest.dto.request.NoteRequest;
import com.focusnest.dto.response.NoteResponse;
import com.focusnest.model.Note;
import com.focusnest.repository.NoteRepository;
import com.focusnest.repository.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoteService {

    private final NoteRepository noteRepo;
    private final UserRepository userRepo;

    public NoteService(NoteRepository noteRepo, UserRepository userRepo) {
        this.noteRepo = noteRepo;
        this.userRepo = userRepo;
    }

    public NoteResponse create(String email, NoteRequest req) {
        var user = userRepo.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Not found"));

        Note n = new Note();
        n.setUserId(user.getId());
        n.setTitle(req.getTitle());
        n.setContent(req.getContent());
        n.setIsPinned(req.getIsPinned() != null && req.getIsPinned());
        n.setIsResearch(req.getIsResearch() != null && req.getIsResearch());
        noteRepo.save(n);

        return toResponse(n, req.getTags() != null ? req.getTags() : Collections.emptyList(),
            req.getTopic());
    }

    public List<NoteResponse> getAll(String email) {
        var user = userRepo.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Not found"));
        return noteRepo.findByUserIdOrderByIsPinnedDescCreatedAtDesc(user.getId())
            .stream().map(n -> toResponse(n, Collections.emptyList(), null))
            .collect(Collectors.toList());
    }

    public List<NoteResponse> search(String email, String q) {
        var user = userRepo.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Not found"));
        return noteRepo.searchByUserId(user.getId(), q)
            .stream().map(n -> toResponse(n, Collections.emptyList(), null))
            .collect(Collectors.toList());
    }

    public NoteResponse update(String email, Long id, NoteRequest req) {
        Note n = noteRepo.findById(id)
            .orElseThrow(() -> new RuntimeException("Note not found"));
        if (req.getTitle()   != null) n.setTitle(req.getTitle());
        if (req.getContent() != null) n.setContent(req.getContent());
        if (req.getIsPinned()!= null) n.setIsPinned(req.getIsPinned());
        n.setUpdatedAt(LocalDateTime.now());
        noteRepo.save(n);
        return toResponse(n, req.getTags() != null ? req.getTags() : Collections.emptyList(),
            req.getTopic());
    }

    public void delete(String email, Long id) {
        noteRepo.deleteById(id);
    }

    private NoteResponse toResponse(Note n, List<String> tags, String topic) {
        return new NoteResponse(n.getId(), n.getTitle(), n.getContent(),
            tags, topic, n.getIsPinned(), n.getIsResearch(),
            n.getCreatedAt(), n.getUpdatedAt());
    }
}
