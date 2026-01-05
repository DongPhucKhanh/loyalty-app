package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.repository.CustomerRepository;
import com.doan.loyaltyapp.service.AuditLogService;
import com.doan.loyaltyapp.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder; // <--- 1. IMPORT QUAN TRỌNG
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/customers")
// Cấu hình CORS: Chấp nhận Localhost và Vercel
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174",
        "https://loyalty-client-lilac.vercel.app" }, allowCredentials = "true")
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditLogService auditLogService;

    // Lấy danh sách khách hàng
    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    // ============================================================
    // 1. ĐĂNG KÝ / TẠO KHÁCH HÀNG MỚI
    // ============================================================
    @PostMapping
    public ResponseEntity<?> createCustomer(@RequestBody Customer customer) {
        System.out.println("DEBUG: Đang đăng ký khách hàng mới: " + customer.getName());

        // 1. Kiểm tra số điện thoại
        if (customer.getPhone() != null && customerRepository.findByPhone(customer.getPhone()).isPresent()) {
            return ResponseEntity.badRequest().body("Số điện thoại đã tồn tại!");
        }

        // 2. Xử lý Mật khẩu
        if (customer.getPassword() == null || customer.getPassword().isEmpty()) {
            customer.setPassword("123456");
        }
        customer.setPassword(passwordEncoder.encode(customer.getPassword()));

        // 3. Xử lý dữ liệu mặc định
        if (customer.getPointBalance() == 0) customer.setPointBalance(0);
        if (customer.getTier() == null) customer.setTier("Mới");
        if (customer.getStatus() == null || customer.getStatus().isEmpty()) {
            customer.setStatus("ACTIVE");
        }
        if (customer.getAvatar() == null || customer.getAvatar().isEmpty()) {
            customer.setAvatar("https://cdn-icons-png.flaticon.com/512/149/149071.png");
        }

        try {
            Customer savedCustomer = customerRepository.save(customer);

            // --- 4. GHI LOG (QUAN TRỌNG) ---
            // Lấy tên người đang thao tác (NV06, Admin...)
            String currentUsername = "Khách tự đăng ký";
            try {
                currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
                if (currentUsername.equals("anonymousUser")) currentUsername = "Khách tự đăng ký";
            } catch (Exception e) {}

            auditLogService.saveLog(currentUsername, "TẠO KHÁCH HÀNG", 
                    "Tên: " + savedCustomer.getName() + " - SĐT: " + savedCustomer.getPhone());
            // -------------------------------

            return ResponseEntity.ok(savedCustomer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lưu dữ liệu: " + e.getMessage());
        }
    }

    // ============================================================
    // 2. ĐĂNG NHẬP
    // ============================================================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String phone = loginData.get("phone");
        String rawPassword = loginData.get("password");

        Optional<Customer> customerOpt = customerRepository.findByPhone(phone);
        if (customerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Số điện thoại không tồn tại!");
        }

        Customer customer = customerOpt.get();

        if (!passwordEncoder.matches(rawPassword, customer.getPassword())) {
            return ResponseEntity.badRequest().body("Sai mật khẩu!");
        }

        if ("LOCKED".equals(customer.getStatus()) || "KHOA".equals(customer.getStatus())) {
            return ResponseEntity.badRequest().body("Tài khoản của bạn đã bị khóa!");
        }

        String token = jwtUtils.generateToken(customer.getPhone());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("id", customer.getId());
        response.put("name", customer.getName());
        response.put("phone", customer.getPhone());
        response.put("pointBalance", customer.getPointBalance());
        response.put("tier", customer.getTier());
        response.put("avatar", customer.getAvatar());
        response.put("role", "CUSTOMER");

        return ResponseEntity.ok(response);
    }

    // ============================================================
    // 3. CẬP NHẬT THÔNG TIN
    // ============================================================
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomer(@PathVariable Long id, @RequestBody Customer customerDetails) {
        Customer existingCustomer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng ID: " + id));

        // Cập nhật thông tin
        existingCustomer.setName(customerDetails.getName());
        existingCustomer.setPhone(customerDetails.getPhone());
        existingCustomer.setEmail(customerDetails.getEmail());
        existingCustomer.setAddress(customerDetails.getAddress());

        if (customerDetails.getGender() != null) existingCustomer.setGender(customerDetails.getGender());
        if (customerDetails.getDob() != null) existingCustomer.setDob(customerDetails.getDob());
        if (customerDetails.getAvatar() != null) existingCustomer.setAvatar(customerDetails.getAvatar());
        if (customerDetails.getStatus() != null) existingCustomer.setStatus(customerDetails.getStatus());

        if (customerDetails.getPassword() != null && !customerDetails.getPassword().isEmpty()) {
            existingCustomer.setPassword(passwordEncoder.encode(customerDetails.getPassword()));
        }

        Customer updatedCustomer = customerRepository.save(existingCustomer);

        // --- GHI LOG CẬP NHẬT ---
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        auditLogService.saveLog(currentUsername, "CẬP NHẬT KHÁCH", 
                "Đã sửa thông tin khách ID: " + id);
        // ------------------------

        return ResponseEntity.ok(updatedCustomer);
    }

    // ============================================================
    // 4. XÓA KHÁCH HÀNG
    // ============================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id) {
        if (!customerRepository.existsById(id))
            return ResponseEntity.notFound().build();
        
        Customer cus = customerRepository.findById(id).get();
        customerRepository.deleteById(id);
        
        // --- GHI LOG XÓA (Đã sửa lấy đúng tên người xóa) ---
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        auditLogService.saveLog(currentUsername, "XÓA KHÁCH HÀNG",
                "Đã xóa khách: " + cus.getName() + " - SĐT: " + cus.getPhone());

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCustomerById(@PathVariable Long id) {
        Optional<Customer> customer = customerRepository.findById(id);
        if (customer.isPresent()) {
            return ResponseEntity.ok(customer.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}