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

        stats.setTotalCustomers(customerRepository.count());
        
        // Gọi hàm của transactionRepository (giữ nguyên nếu không lỗi)
        Double revenue = transactionRepository.sumTotalRevenue();
        stats.setTotalRevenue(revenue != null ? revenue : 0.0);

        Long totalPoints = transactionRepository.sumTotalPointsIssued();
        stats.setTotalPointsIssued(totalPoints != null ? totalPoints : 0L);

        // Cập nhật: FindTop5ByOrderByPointBalanceDesc
        stats.setTopCustomers(customerRepository.findTop5ByOrderByPointBalanceDesc());

        // Cập nhật: CountCustomersByTier
        List<Object[]> tierData = customerRepository.countCustomersByTier();
        Map<String, Long> tierMap = new HashMap<>();
        if (tierData != null) {
            for (Object[] row : tierData) {
                tierMap.put((String) row[0], (Long) row[1]);
            }
        }
        stats.setTierStats(tierMap);

        return stats;
    }
}