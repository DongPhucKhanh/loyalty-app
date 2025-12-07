package com.doan.loyaltyapp.service;

import com.doan.loyaltyapp.model.AdminUser;
import com.doan.loyaltyapp.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class AdminUserService {

    @Autowired
    private AdminUserRepository adminUserRepository;

    public AdminUser createAdmin(AdminUser adminUser) {
        // Ở đây bạn có thể thêm logic mã hóa mật khẩu trước khi lưu
        return adminUserRepository.save(adminUser);
    }

    public AdminUser login(String username, String password) {
        Optional<AdminUser> adminOptional = adminUserRepository.findByUsername(username);
        if (adminOptional.isPresent()) {
            AdminUser admin = adminOptional.get();
            // So sánh mật khẩu (đơn giản)
            if (admin.getPassword().equals(password)) {
                return admin;
            }
        }
        return null; // Đăng nhập thất bại
    }

    public List<AdminUser> getAllAdmins() {
        return adminUserRepository.findAll();
    }
}