package com.doan.loyaltyapp.model.dto;

import com.doan.loyaltyapp.model.Customer;
import lombok.Data;
import java.util.List;
import java.util.Map; // Import Map

@Data
public class DashboardStats {
    private long totalCustomers;
    private long totalPointsIssued;
    private Double totalRevenue;
    private List<Customer> topCustomers;
    
    // THÊM TRƯỜNG NÀY: Dữ liệu cho biểu đồ tròn
    private Map<String, Long> tierStats; 
}