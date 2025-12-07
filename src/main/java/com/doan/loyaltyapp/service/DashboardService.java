package com.doan.loyaltyapp.service;

import com.doan.loyaltyapp.model.dto.DashboardStats;
import com.doan.loyaltyapp.repository.CustomerRepository;
import com.doan.loyaltyapp.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
        stats.setTotalPointsIssued(totalPoints != null ? totalPoints : 0);

        // 4. Lấy Top 5 khách hàng VIP
        stats.setTopCustomers(customerRepository.findTop5ByOrderByPointBalanceDesc());

        return stats;
    }
}