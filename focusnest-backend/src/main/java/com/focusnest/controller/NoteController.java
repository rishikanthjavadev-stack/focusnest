package com.focusnest.controller;

import com.focusnest.dto.request.NoteRequest;
import com.focusnest.dto.response.NoteResponse;
import com.focusnest.service.NoteService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/notes")
public class NoteController {

    private final NoteService noteService;

    public NoteController(NoteService noteService) {
        this.noteService = noteService;
    }

    @PostMapping
    public ResponseEntity<NoteResponse> create(
            @RequestBody NoteRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(noteService.create(user.getUsername(), req));
    }

    @GetMapping
    public ResponseEntity<List<NoteResponse>> getAll(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(noteService.getAll(user.getUsername()));
    }

    @GetMapping("/search")
    public ResponseEntity<List<NoteResponse>> search(
            @RequestParam String q,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(noteService.search(user.getUsername(), q));
    }

    @PutMapping("/{id}")
    public ResponseEntity<NoteResponse> update(
            @PathVariable Long id,
            @RequestBody NoteRequest req,
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(noteService.update(user.getUsername(), id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails user) {
        noteService.delete(user.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
