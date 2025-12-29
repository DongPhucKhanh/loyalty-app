package com.doan.loyaltyapp.repository;

import com.doan.loyaltyapp.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    // Tìm log mới nhất xếp lên đầu
    List<AuditLog> findAllByOrderByTimestampDesc();
}