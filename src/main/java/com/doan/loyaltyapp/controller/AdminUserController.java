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
@CrossOrigin(origins = "*") // Cho phép Frontend gọi API từ bất kỳ đâu (localhost:3000, v.v.)
public class AdminUserController {

    @Autowired
    private AdminUserService adminUserService;

    @Autowired
    private JwtUtils jwtUtils;

    // ==========================================
    // 1. API ĐĂNG KÝ TÀI KHOẢN ADMIN MỚI
    // POST: http://localhost:8080/api/admin/users/register
    // ==========================================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody AdminUser adminUser) {
        try {
            // Gọi service để lưu admin mới
            AdminUser newAdmin = adminUserService.createAdmin(adminUser);
            return ResponseEntity.ok(newAdmin);
        } catch (Exception e) {
            // Trả về lỗi nếu Username đã tồn tại hoặc lỗi khác
            return ResponseEntity.badRequest().body("Lỗi: Đăng ký thất bại. Username có thể đã tồn tại.");
        }
    }

    // ==========================================
    // 2. API ĐĂNG NHẬP (TRẢ VỀ TOKEN)
    // POST: http://localhost:8080/api/admin/users/login
    // ==========================================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // Bước 1: Kiểm tra username và password
        AdminUser admin = adminUserService.login(loginRequest.getUsername(), loginRequest.getPassword());

        if (admin != null) {
            // Bước 2: Nếu đúng -> Tạo chuỗi Token (JWT)
            String token = jwtUtils.generateToken(admin.getUsername());

            // Bước 3: Đóng gói Token + Thông tin user trả về cho Frontend
            JwtResponse response = new JwtResponse(
                    token,
                    admin.getUsername(),
                    admin.getRole(),
                    admin.getFullName()
            );
            return ResponseEntity.ok(response);
        } else {
            // Bước 4: Nếu sai -> Trả về lỗi 401 Unauthorized
            return ResponseEntity.status(401).body("Đăng nhập thất bại: Sai tài khoản hoặc mật khẩu");
        }
    }

    // ==========================================
    // 3. API LẤY DANH SÁCH ADMIN (QUẢN LÝ)
    // GET: http://localhost:8080/api/admin/users
    // ==========================================
    @GetMapping
    public List<AdminUser> getAllAdmins() {
        return adminUserService.getAllAdmins();
    }

    // ==========================================
    // CÁC CLASS DTO (Data Transfer Object)
    // Dùng để hứng dữ liệu vào và trả dữ liệu ra
    // ==========================================

    // Class để hứng dữ liệu JSON khi đăng nhập gửi lên
    @Data
    static class LoginRequest {
        private String username;
        private String password;
    }

    // Class để định dạng dữ liệu trả về JSON đẹp đẽ cho Frontend
    @Data
    static class JwtResponse {
        private String token;       // Chuỗi JWT
        private String type = "Bearer"; // Loại token (chuẩn quốc tế)
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