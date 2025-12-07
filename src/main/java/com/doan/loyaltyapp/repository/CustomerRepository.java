package com.doan.loyaltyapp.repository;

import com.doan.loyaltyapp.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    Customer findByPhone(String phone);

    // Tìm Top 5 khách hàng sắp xếp theo điểm giảm dần
    List<Customer> findTop5ByOrderByPointBalanceDesc();
}