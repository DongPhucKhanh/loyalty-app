package com.doan.loyaltyapp.repository;

import com.doan.loyaltyapp.model.InternalNote;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InternalNoteRepository extends JpaRepository<InternalNote, Long> {
    // Lấy tin nhắn mới nhất xếp lên đầu
    List<InternalNote> findAllByOrderByCreatedAtDesc();
}