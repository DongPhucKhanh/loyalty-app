package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.repository.CustomerRepository;
import com.doan.loyaltyapp.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/customers")
// Cấu hình CORS: Chấp nhận Localhost và Vercel
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "https://loyalty-client-lilac.vercel.app"}, allowCredentials = "true")
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // Lấy danh sách khách hàng
    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    // ============================================================
    // 1. ĐĂNG KÝ (CẬP NHẬT ĐẦY ĐỦ TRƯỜNG MỚI)
    // ============================================================
    @PostMapping
    public ResponseEntity<?> createCustomer(@RequestBody Customer customer) {
        // --- LOG KIỂM TRA CODE MỚI ---
        System.out.println("DEBUG: Đang đăng ký khách hàng mới: " + customer.getName());

        // 1. Kiểm tra số điện thoại đã tồn tại chưa
        if (customer.getPhone() != null && customerRepository.findByPhone(customer.getPhone()).isPresent()) {
            return ResponseEntity.badRequest().body("Số điện thoại đã tồn tại!");
        }

        // 2. Xử lý Mật khẩu (Mặc định & Mã hóa)
        if (customer.getPassword() == null || customer.getPassword().isEmpty()) {
            customer.setPassword("123456");
        }
        // QUAN TRỌNG: Mã hóa mật khẩu trước khi lưu
        customer.setPassword(passwordEncoder.encode(customer.getPassword()));

        // 3. Xử lý dữ liệu mặc định cho người dùng mới
        if (customer.getPointBalance() == 0) customer.setPointBalance(0);
        if (customer.getTier() == null) customer.setTier("Mới");
        
        // Mới: Mặc định trạng thái là ACTIVE (Hoạt động)
        if (customer.getStatus() == null || customer.getStatus().isEmpty()) {
            customer.setStatus("ACTIVE");
        }

        // Mới: Mặc định Avatar nếu chưa có
        if (customer.getAvatar() == null || customer.getAvatar().isEmpty()) {
            customer.setAvatar("https://cdn-icons-png.flaticon.com/512/149/149071.png"); // Link ảnh mẫu
        }

        // Lưu vào Database
        try {
            Customer savedCustomer = customerRepository.save(customer);
            return ResponseEntity.ok(savedCustomer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lưu dữ liệu: " + e.getMessage());
        }
    }

    // ============================================================
    // 2. ĐĂNG NHẬP (KIỂM TRA MẬT KHẨU MÃ HÓA & TRẠNG THÁI)
    // ============================================================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String phone = loginData.get("phone");
        String rawPassword = loginData.get("password");

        // 1. Tìm tài khoản theo SĐT
        Optional<Customer> customerOpt = customerRepository.findByPhone(phone);
        if (customerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Số điện thoại không tồn tại!");
        }

        Customer customer = customerOpt.get();

        // 2. So sánh mật khẩu (Raw vs Encoded)
        if (!passwordEncoder.matches(rawPassword, customer.getPassword())) {
            return ResponseEntity.badRequest().body("Sai mật khẩu!");
        }

        // 3. Kiểm tra trạng thái tài khoản (Mới)
        if ("LOCKED".equals(customer.getStatus()) || "KHOA".equals(customer.getStatus())) {
            return ResponseEntity.badRequest().body("Tài khoản của bạn đã bị khóa!");
        }

        // 4. Tạo Token và trả về thông tin
        String token = jwtUtils.generateToken(customer.getPhone());
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("id", customer.getId());
        response.put("name", customer.getName());
        response.put("phone", customer.getPhone());
        response.put("pointBalance", customer.getPointBalance());
        response.put("tier", customer.getTier());
        response.put("avatar", customer.getAvatar()); // Trả về avatar để hiển thị
        response.put("role", "CUSTOMER");

        return ResponseEntity.ok(response);
    }

    // ============================================================
    // 3. CẬP NHẬT THÔNG TIN (BAO GỒM CẢ CÁC TRƯỜNG MỚI)
    // ============================================================
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomer(@PathVariable Long id, @RequestBody Customer customerDetails) {
        Customer existingCustomer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng ID: " + id));

        // Cập nhật các thông tin cơ bản
        existingCustomer.setName(customerDetails.getName());
        existingCustomer.setPhone(customerDetails.getPhone());
        existingCustomer.setEmail(customerDetails.getEmail());
        existingCustomer.setAddress(customerDetails.getAddress()); // Địa chỉ
        
        // Cập nhật các trường mới
        if (customerDetails.getGender() != null) existingCustomer.setGender(customerDetails.getGender());
        if (customerDetails.getDob() != null) existingCustomer.setDob(customerDetails.getDob());
        if (customerDetails.getAvatar() != null) existingCustomer.setAvatar(customerDetails.getAvatar());
        if (customerDetails.getStatus() != null) existingCustomer.setStatus(customerDetails.getStatus());

        // Chỉ mã hóa lại nếu người dùng nhập mật khẩu MỚI
        if (customerDetails.getPassword() != null && !customerDetails.getPassword().isEmpty()) {
            existingCustomer.setPassword(passwordEncoder.encode(customerDetails.getPassword()));
        }

        Customer updatedCustomer = customerRepository.save(existingCustomer);
        return ResponseEntity.ok(updatedCustomer);
    }

    // Xóa khách hàng
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id) {
        if (!customerRepository.existsById(id)) return ResponseEntity.notFound().build();
        customerRepository.deleteById(id);
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