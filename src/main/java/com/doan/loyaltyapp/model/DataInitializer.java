package com.doan.loyaltyapp.model;

import com.doan.loyaltyapp.model.AdminUser;
import com.doan.loyaltyapp.model.Employee; // Import thêm Entity Employee
import com.doan.loyaltyapp.repository.AdminUserRepository;
import com.doan.loyaltyapp.repository.EmployeeRepository; // Import thêm Repository Employee
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private EmployeeRepository employeeRepository; // Thêm Repository này

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String encodedPassword = passwordEncoder.encode("admin123");

        // 1. Đảm bảo Admin có trong bảng admin_users
        if (adminUserRepository.findByUsername("admin").isEmpty()) {
            AdminUser admin = new AdminUser();
            admin.setUsername("admin");
            admin.setFullName("Quản trị viên hệ thống");
            admin.setRole("ADMIN");
            admin.setPassword(encodedPassword);
            adminUserRepository.save(admin);
            System.out.println(">>> Đã tạo Admin trong bảng admin_users");
        }

        // 2. Đảm bảo Admin có trong bảng employees (Vì Log báo hệ thống tìm ở đây)
        if (employeeRepository.findByUsername("admin").isEmpty()) {
            Employee emp = new Employee();
            emp.setUsername("admin");
            emp.setPassword(encodedPassword);
            emp.setFullName("Quản trị viên (Phụ)");
            emp.setRole("ADMIN");
            // Rất quan trọng: Phải set Active vì database yêu cầu NOT NULL
            emp.setActive(true); 
            
            employeeRepository.save(emp);
            System.out.println(">>> Đã tạo Admin trong bảng employees để đồng bộ xác thực!");
        }
    }
}