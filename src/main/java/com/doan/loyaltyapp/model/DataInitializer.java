package com.doan.loyaltyapp.model;

import com.doan.loyaltyapp.model.AdminUser; // Đã đổi theo code bạn gửi
import com.doan.loyaltyapp.repository.AdminUserRepository; // Đã đổi theo code bạn gửi
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Sử dụng Optional.isEmpty() để kiểm tra sự tồn tại của admin
        if (adminUserRepository.findByUsername("admin").isEmpty()) {
            AdminUser admin = new AdminUser();
            
            // Các trường khớp với bảng admin_users trong DBeaver
            admin.setUsername("admin");
            admin.setFullName("Quản trị viên hệ thống");
            admin.setRole("ADMIN");
            
            // Mã hóa mật khẩu BCrypt để khớp với SecurityConfig
            admin.setPassword(passwordEncoder.encode("admin123"));

            // Lưu vào database Aiven
            adminUserRepository.save(admin);
            
            System.out.println("--------------------------------------------------");
            System.out.println(">>> Đã tạo thành công Admin trên bảng admin_users");
            System.out.println(">>> Tài khoản: admin / Mật khẩu: admin123");
            System.out.println("--------------------------------------------------");
        }
    }
}