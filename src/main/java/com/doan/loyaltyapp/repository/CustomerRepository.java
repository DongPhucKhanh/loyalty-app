package com.doan.loyaltyapp.repository;

import com.doan.loyaltyapp.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    // 1. Tìm khách hàng theo số điện thoại (Dùng khi check trùng hoặc tìm ở POS)
    Customer findByPhone(String phone);

    // 2. Lấy danh sách Top 5 khách hàng có điểm cao nhất (Dùng cho Dashboard)
    List<Customer> findTop5ByOrderByPointBalanceDesc();

    // 3. Thống kê số lượng khách hàng theo từng hạng (Dùng cho Biểu đồ Dashboard)
    // Kết quả trả về dạng danh sách các mảng object: [["Vàng", 5], ["Bạc", 10], ...]
    @Query("SELECT c.tier, COUNT(c) FROM Customer c GROUP BY c.tier")
    List<Object[]> countCustomersByTier();
}