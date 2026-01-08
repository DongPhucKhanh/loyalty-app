package com.doan.loyaltyapp.repository;

import com.doan.loyaltyapp.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // 1. Lấy danh sách thông báo của user cụ thể, sắp xếp mới nhất lên đầu
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    // 2. Đếm số thông báo chưa đọc (Dùng để hiển thị số trên chấm đỏ icon chuông)
    long countByUserIdAndIsReadFalse(Long userId);

    // --- THÊM DÒNG NÀY ĐỂ HẾT LỖI TRONG CONTROLLER ---
    // 3. Tìm danh sách các thông báo chưa đọc để cập nhật trạng thái "Đã đọc" hàng loạt
    List<Notification> findByUserIdAndIsReadFalse(Long userId);
}