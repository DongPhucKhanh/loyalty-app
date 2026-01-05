package com.doan.loyaltyapp.service;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.repository.CustomerRepository;
import com.doan.loyaltyapp.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class ScheduledTasks {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private AuditLogService auditLogService;

    // --- SỬA Ở ĐÂY ---
    // Cũ: "0 0 0 1 * ?" (0h ngày mùng 1 hàng tháng)
    // Mới: "*/10 * * * * *" (Mỗi 10 giây chạy 1 lần)
    // @Scheduled(cron = "*/10 * * * * *") 
    @Scheduled(cron = "0 0 0 1 * ?")
    @Transactional
    public void resetPointsAndTiersTest() {
        System.out.println(">>> [TEST] ĐANG CHẠY JOB RESET 10 GIÂY...");

        List<Customer> customers = customerRepository.findAll();
        
        if (customers.isEmpty()) return;

        for (Customer customer : customers) {
            // Chỉ reset những người có điểm > 0 hoặc hạng khác "Mới" để đỡ tốn tài nguyên ghi log rác
            if (customer.getPointBalance() > 0 || !"Mới".equals(customer.getTier())) {
                customer.setPointBalance(0);
                customer.setTier("Mới");
            }
        }

        customerRepository.saveAll(customers);

        // Ghi log để bạn thấy nó chạy (F5 trang Lịch sử sẽ thấy liên tục)
        auditLogService.saveLog("Hệ thống (Auto)", "RESET TEST", 
                "Đã reset điểm về 0 cho tất cả khách hàng.");
        
        System.out.println(">>> [TEST] ĐÃ RESET XONG.");
    }
}