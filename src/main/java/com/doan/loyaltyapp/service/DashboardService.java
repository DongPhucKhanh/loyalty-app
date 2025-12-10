package com.doan.loyaltyapp.service;

import com.doan.loyaltyapp.model.dto.DashboardStats;
import com.doan.loyaltyapp.repository.CustomerRepository;
import com.doan.loyaltyapp.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class DashboardService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    public DashboardStats getStats() {
        DashboardStats stats = new DashboardStats();

        // 1. Đếm tổng số khách hàng
        long totalCustomers = customerRepository.count();
        stats.setTotalCustomers(totalCustomers);

        // 2. Tính tổng doanh thu (Xử lý null nếu chưa có giao dịch nào)
        Double revenue = transactionRepository.sumTotalRevenue();
        stats.setTotalRevenue(revenue != null ? revenue : 0.0);

        // 3. Tính tổng điểm đã cấp
        Long totalPoints = transactionRepository.sumTotalPointsIssued();
        stats.setTotalPointsIssued(totalPoints != null ? totalPoints : 0L);

        // 4. Lấy Top 5 khách hàng VIP (Điểm cao nhất)
        stats.setTopCustomers(customerRepository.findTop5ByOrderByPointBalanceDesc());

        // ==========================================================
        // 5. THỐNG KÊ HẠNG THÀNH VIÊN (CHO BIỂU ĐỒ TRÒN)
        // ==========================================================
        List<Object[]> tierData = customerRepository.countCustomersByTier();
        Map<String, Long> tierMap = new HashMap<>();

        if (tierData != null && !tierData.isEmpty()) {
            for (Object[] row : tierData) {
                // row[0] là tên hạng (String), row[1] là số lượng (Long)
                String tierName = (String) row[0];
                Long count = (Long) row[1];
                
                // Xử lý trường hợp tên hạng bị null (ví dụ khách cũ chưa xét hạng)
                tierMap.put(tierName != null ? tierName : "Chưa xếp hạng", count);
            }
        }
        
        stats.setTierStats(tierMap);
        // ==========================================================

        return stats;
    }
}