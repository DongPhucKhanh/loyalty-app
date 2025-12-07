package com.doan.loyaltyapp.repository;

import com.doan.loyaltyapp.model.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {
    // Tìm admin theo username để xử lý đăng nhập
    Optional<AdminUser> findByUsername(String username);
}