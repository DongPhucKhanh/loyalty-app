package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.AdminUser;
import com.doan.loyaltyapp.service.AdminUserService;
import com.doan.loyaltyapp.utils.JwtUtils;

import lombok.Data;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@CrossOrigin(origins = "*")
public class AdminUserController {

    @Autowired
    private AdminUserService adminUserService;

    @Autowired
    private JwtUtils jwtUtils;

    // ==========================================
    // 1. API ĐĂNG KÝ -> TRẢ VỀ LUÔN TOKEN (MỚI)
    // ==========================================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AdminUser adminUser) {
        try {
            // 1. Kiểm tra dữ liệu đầu vào
            if (adminUser.getUsername() == null || adminUser.getUsername().isEmpty()) {
                return ResponseEntity.badRequest().body("Lỗi: Username không được để trống!");
            }
            if (adminUser.getPassword() == null || adminUser.getPassword().isEmpty()) {
                return ResponseEntity.badRequest().body("Lỗi: Password không được để trống!");
            }

            // 2. Lưu Admin mới vào Database
            AdminUser newAdmin = adminUserService.createAdmin(adminUser);

            // 3. --- BỔ SUNG: TẠO TOKEN NGAY LẬP TỨC ---
            String token = jwtUtils.generateToken(newAdmin.getUsername());

            // 4. Trả về Token kèm thông tin (Giống hệt lúc Login)
            JwtResponse response = new JwtResponse(
                    token,
                    newAdmin.getUsername(),
                    newAdmin.getRole(),
                    newAdmin.getFullName()
            );
            
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Đăng ký thất bại: " + e.getMessage());
        }
    }

    // ==========================================
    // 2. API ĐĂNG NHẬP (GIỮ NGUYÊN)
    // ==========================================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        AdminUser admin = adminUserService.login(loginRequest.getUsername(), loginRequest.getPassword());

        if (admin != null) {
            String token = jwtUtils.generateToken(admin.getUsername());
            JwtResponse response = new JwtResponse(
                    token,
                    admin.getUsername(),
                    admin.getRole(),
                    admin.getFullName()
            );
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(401).body("Đăng nhập thất bại");
        }
    }

    // ==========================================
    // 3. CÁC API KHÁC (GIỮ NGUYÊN)
    // ==========================================
    @GetMapping
    public List<AdminUser> getAllAdmins() {
        return adminUserService.getAllAdmins();
    }

    // DTO Classes
    @Data
    static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    static class JwtResponse {
        private String token;
        private String type = "Bearer";
        private String username;
        private String role;
        private String fullName;

        public JwtResponse(String token, String username, String role, String fullName) {
            this.token = token;
            this.username = username;
            this.role = role;
            this.fullName = fullName;
        }
    }
}