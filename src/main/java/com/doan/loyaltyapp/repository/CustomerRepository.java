package com.doan.loyaltyapp.repository;

import com.doan.loyaltyapp.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {
    
    Optional<Customer> findByPhone(String phone);

    // Sửa OrderByPoints -> OrderByPointBalance
    List<Customer> findTop5ByOrderByPointBalanceDesc();

    // Sửa rankName -> tier
    @Query("SELECT c.tier, COUNT(c) FROM Customer c GROUP BY c.tier")
    List<Object[]> countCustomersByTier();
}