package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.Notification;
import com.doan.loyaltyapp.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    // 1. Lấy danh sách thông báo của User (Sắp xếp mới nhất lên đầu)
    @GetMapping
    public List<Notification> getNotifications(@RequestParam Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // 2. Đếm số lượng chưa đọc (để hiện chấm đỏ trên icon chuông)
    @GetMapping("/unread-count")
    public long countUnread(@RequestParam Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    // 3. Đánh dấu MỘT thông báo cụ thể là đã đọc
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        return notificationRepository.findById(id).map(notif -> {
            notif.setRead(true);
            notificationRepository.save(notif);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
    
    // 4. LOGIC QUAN TRỌNG: Đánh dấu TẤT CẢ thông báo của User là đã đọc
    // Dùng để ẩn chấm đỏ khi người dùng click vào xem danh sách thông báo
    @PutMapping("/mark-all-read")
    public ResponseEntity<?> markAllRead(@RequestParam Long userId) {
        List<Notification> unreadNotifs = notificationRepository.findByUserIdAndIsReadFalse(userId);
        for (Notification n : unreadNotifs) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unreadNotifs);
        return ResponseEntity.ok().build();
    }
}