package com.doan.loyaltyapp.service;

import com.doan.loyaltyapp.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class PointResetScheduler {

    @Autowired
    private CustomerRepository customerRepository;

    // --- CẤU HÌNH THỜI GIAN CHẠY ---
    // Cron expression: "Giây Phút Giờ Ngày Tháng Thứ"
    // "0 0 0 1 * ?" nghĩa là: 00 giờ 00 phút 00 giây, ngày mùng 1 của mọi tháng
    @Scheduled(cron = "0 0 0 1 * ?")
    // @Scheduled(fixedRate = 10000) test chạy mỗi 10 giây
    public void resetPointsMonthly() {
        System.out.println("⏰ BẮT ĐẦU RESET ĐIỂM ĐỊNH KỲ: " + LocalDateTime.now());
        
        try {
            customerRepository.resetAllPoints();
            System.out.println("✅ Đã reset toàn bộ điểm của khách hàng về 0 thành công!");
        } catch (Exception e) {
            System.err.println("❌ Lỗi khi reset điểm: " + e.getMessage());
        }
    }
}