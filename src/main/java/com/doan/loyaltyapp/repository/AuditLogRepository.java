package com.doan.loyaltyapp.repository;

import com.doan.loyaltyapp.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    // 1. Hàm lấy TOÀN BỘ log, sắp xếp mới nhất (Dùng cho Admin / AuditLogController)
    // 👉 BẠN CẦN THÊM DÒNG NÀY ĐỂ SỬA LỖI:
    List<AuditLog> findAllByOrderByTimestampDesc(); 

    // 2. Hàm lấy log CỦA 1 NGƯỜI CỤ THỂ (Dùng cho Nhân viên / EmployeeController)
    // (Giữ nguyên dòng này bạn đã làm trước đó)
    List<AuditLog> findByPerformedByOrderByTimestampDesc(String performedBy);

}