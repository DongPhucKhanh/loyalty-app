package com.doan.loyaltyapp.service;

import com.doan.loyaltyapp.model.AdminUser;
import com.doan.loyaltyapp.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional; // Import thêm cái này

@Service
public class AdminUserService {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // 1. ĐĂNG KÝ
    public AdminUser createAdmin(AdminUser adminUser) {
        String hashedPassword = passwordEncoder.encode(adminUser.getPassword());
        adminUser.setPassword(hashedPassword);
        return adminUserRepository.save(adminUser);
    }

    // 2. ĐĂNG NHẬP (SỬA LỖI TẠI ĐÂY)
    public AdminUser login(String username, String rawPassword) {
        // Vì repository trả về Optional, ta dùng .orElse(null)
        // Nghĩa là: "Nếu tìm thấy thì lấy User ra, nếu không thấy thì trả về null"
        AdminUser admin = adminUserRepository.findByUsername(username).orElse(null);

        if (admin != null) {
            // So sánh mật khẩu
            if (passwordEncoder.matches(rawPassword, admin.getPassword())) {
                return admin;
            }
        }
        return null;
    }

    // 3. LẤY DANH SÁCH
    public List<AdminUser> getAllAdmins() {
        return adminUserRepository.findAll();
    }
}