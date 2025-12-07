package com.doan.loyaltyapp.model.dto;

import com.doan.loyaltyapp.model.Customer;
import lombok.Data;
import java.util.List;

@Data
public class DashboardStats {
    private long totalCustomers;      // Tổng số khách hàng
    private long totalPointsIssued;   // Tổng số điểm đã cấp
    private Double totalRevenue;      // Tổng doanh thu
    private List<Customer> topCustomers; // Danh sách 5 khách hàng VIP
}