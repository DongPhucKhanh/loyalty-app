package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.AdminUser;
import com.doan.loyaltyapp.model.Employee;
import com.doan.loyaltyapp.repository.AdminUserRepository;
import com.doan.loyaltyapp.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth") // Frontend sẽ gọi vào: /api/auth/login
@CrossOrigin(origins = "*")  // Cho phép React truy cập
public class AuthController {

    @Autowired
    private AdminUserRepository adminRepo;    // Repository của bảng admin_users

    @Autowired
    private EmployeeRepository employeeRepo;  // Repository của bảng employees

    @Autowired
    private PasswordEncoder passwordEncoder;  // Công cụ mã hóa/so sánh mật khẩu

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");

        // Tạo Map để trả về kết quả JSON
        Map<String, Object> response = new HashMap<>();

        // -----------------------------------------------------------
        // BƯỚC 1: Tìm trong bảng ADMIN trước (Ưu tiên Sếp)
        // -----------------------------------------------------------
        Optional<AdminUser> adminOpt = adminRepo.findByUsername(username);

        if (adminOpt.isPresent()) {
            AdminUser admin = adminOpt.get();
            // So sánh mật khẩu nhập vào với mật khẩu mã hóa trong DB
            if (passwordEncoder.matches(password, admin.getPassword())) {
                response.put("id", admin.getId());
                response.put("username", admin.getUsername());
                response.put("fullName", admin.getFullName());
                response.put("role", "ADMIN"); // Quan trọng: Đánh dấu là ADMIN
                
                // Nếu bạn có dùng JWT token thì gen token và put vào đây
                // response.put("token", jwtUtils.generateToken(...)); 

                return ResponseEntity.ok(response);
            }
        }

        // -----------------------------------------------------------
        // BƯỚC 2: Nếu không thấy Admin, tìm tiếp trong bảng EMPLOYEE
        // -----------------------------------------------------------
        Optional<Employee> empOpt = employeeRepo.findByUsername(username);

        if (empOpt.isPresent()) {
            Employee emp = empOpt.get();
            if (passwordEncoder.matches(password, emp.getPassword())) {
                // Kiểm tra xem nhân viên có bị khóa không
                if (!emp.isActive()) {
                    return ResponseEntity.status(403).body("Tài khoản này đã bị khóa!");
                }

                response.put("id", emp.getId());
                response.put("username", emp.getUsername());
                response.put("fullName", emp.getFullName());
                response.put("role", "STAFF"); // Quan trọng: Đánh dấu là STAFF
                
                return ResponseEntity.ok(response);
            }
        }

        // -----------------------------------------------------------
        // BƯỚC 3: Nếu tìm cả 2 bảng đều không khớp
        // -----------------------------------------------------------
        return ResponseEntity.status(401).body("Sai tên đăng nhập hoặc mật khẩu!");
    }
}