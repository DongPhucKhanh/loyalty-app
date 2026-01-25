package com.doan.loyaltyapp.repository;

import com.doan.loyaltyapp.model.InternalNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InternalNoteRepository extends JpaRepository<InternalNote, Long> {
    
    // 1. Lấy tất cả (Sắp xếp mới nhất ở dưới)
    List<InternalNote> findAllByOrderByCreatedAtAsc();

    // 2. QUERY QUAN TRỌNG: Lấy tin của chính mình HOẶC tin của Admin
    // (Dành cho Staff: chỉ xem được tin mình chat và tin sếp chỉ đạo)
    List<InternalNote> findBySenderNameOrSenderRoleOrderByCreatedAtAsc(String senderName, String senderRole);
}