package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.AdminUser;
import com.doan.loyaltyapp.model.Employee;
import com.doan.loyaltyapp.repository.AdminUserRepository;
import com.doan.loyaltyapp.repository.EmployeeRepository;
import com.doan.loyaltyapp.utils.JwtUtils; // <--- ĐÃ SỬA: Dùng 'utils' (có chữ s) cho khớp với file JwtUtils
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Cho phép React truy cập
public class AuthController {

    @Autowired
    private AdminUserRepository adminRepo;    // Repository quản lý Admin

    @Autowired
    private EmployeeRepository employeeRepo;  // Repository quản lý Nhân viên

    @Autowired
    private PasswordEncoder passwordEncoder;  // Mã hóa mật khẩu

    @Autowired
    private JwtUtils jwtUtils; // Tiêm Bean tạo Token vào đây

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");

        // Map chứa kết quả trả về cho Frontend
        Map<String, Object> response = new HashMap<>();

        // -----------------------------------------------------------
        // BƯỚC 1: Tìm trong bảng ADMIN (Ưu tiên Admin)
        // -----------------------------------------------------------
        Optional<AdminUser> adminOpt = adminRepo.findByUsername(username);

        if (adminOpt.isPresent()) {
            AdminUser admin = adminOpt.get();
            // So sánh mật khẩu
            if (passwordEncoder.matches(password, admin.getPassword())) {
                response.put("id", admin.getId());
                response.put("username", admin.getUsername());
                response.put("fullName", admin.getFullName());
                response.put("role", "ADMIN");
                
                // --- QUAN TRỌNG: Tạo Token cho Admin ---
                String token = jwtUtils.generateToken(admin.getUsername());
                response.put("token", token); 
                // ---------------------------------------

                return ResponseEntity.ok(response);
            }
        }

        // -----------------------------------------------------------
        // BƯỚC 2: Tìm trong bảng EMPLOYEE (Nếu không phải Admin)
        // -----------------------------------------------------------
        Optional<Employee> empOpt = employeeRepo.findByUsername(username);

        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            // So sánh mật khẩu
            if (passwordEncoder.matches(password, emp.getPassword())) {
                // Kiểm tra tài khoản có bị khóa không
                if (!emp.isActive()) {
                    return ResponseEntity.status(403).body("Tài khoản này đã bị khóa!");
                }

                response.put("id", emp.getId());
                response.put("username", emp.getUsername());
                response.put("fullName", emp.getFullName());
                response.put("role", "STAFF");
                
                // --- QUAN TRỌNG: Tạo Token cho Nhân viên ---
                String token = jwtUtils.generateToken(emp.getUsername());
                response.put("token", token);
                // -------------------------------------------
                
                return ResponseEntity.ok(response);
            }
        }

        // -----------------------------------------------------------
        // BƯỚC 3: Đăng nhập thất bại
        // -----------------------------------------------------------
        return ResponseEntity.status(401).body("Sai tên đăng nhập hoặc mật khẩu!");
    }
}