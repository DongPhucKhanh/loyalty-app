package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.InternalNote;
import com.doan.loyaltyapp.repository.InternalNoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/internal-notes")
public class InternalNoteController {

    @Autowired
    private InternalNoteRepository noteRepository;

    // 1. Lấy danh sách ghi chú
    @GetMapping
    public List<InternalNote> getAllNotes() {
        return noteRepository.findAllByOrderByCreatedAtDesc();
    }

    // 2. Gửi ghi chú mới
    @PostMapping
    public InternalNote createNote(@RequestBody InternalNote note) {
        // Tự động lấy tên người đang đăng nhập
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        
        // Logic xác định Role đơn giản (hoặc bạn có thể lấy từ Authority)
        String role = currentUsername.startsWith("NV") ? "STAFF" : "ADMIN"; 
        
        note.setSenderName(currentUsername);
        note.setSenderRole(role);
        
        return noteRepository.save(note);
    }
    
    // 3. Xóa ghi chú (Chỉ Admin hoặc người viết mới xóa được - làm đơn giản trước)
    @DeleteMapping("/{id}")
    public void deleteNote(@PathVariable Long id) {
        noteRepository.deleteById(id);
    }
}