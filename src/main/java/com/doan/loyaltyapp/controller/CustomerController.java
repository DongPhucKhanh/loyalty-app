package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.repository.CustomerRepository;
import com.doan.loyaltyapp.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder; // <--- Import mới
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private JwtUtils jwtUtils;

    // --- 1. INJECT PASSWORD ENCODER ---
    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    // --- 2. CẬP NHẬT ĐĂNG KÝ (MÃ HÓA MẬT KHẨU) ---
    @PostMapping
    public ResponseEntity<?> createCustomer(@RequestBody Customer customer) {
        if (customer.getPhone() != null && customerRepository.findByPhone(customer.getPhone()).isPresent()) {
            return ResponseEntity.badRequest().body("Số điện thoại đã tồn tại!");
        }

        // Mật khẩu mặc định nếu admin tạo hộ mà không nhập pass
        if (customer.getPassword() == null || customer.getPassword().isEmpty()) {
            customer.setPassword("123456");
        }

        // --- QUAN TRỌNG: MÃ HÓA TRƯỚC KHI LƯU ---
        customer.setPassword(passwordEncoder.encode(customer.getPassword()));

        if (customer.getPointBalance() == 0) customer.setPointBalance(0);
        if (customer.getTier() == null) customer.setTier("Mới");

        try {
            Customer savedCustomer = customerRepository.save(customer);
            return ResponseEntity.ok(savedCustomer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lưu dữ liệu: " + e.getMessage());
        }
    }

    // --- 3. CẬP NHẬT ĐĂNG NHẬP (KIỂM TRA MẬT KHẨU MÃ HÓA) ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String phone = loginData.get("phone");
        String rawPassword = loginData.get("password"); // Mật khẩu thô người dùng nhập

        Optional<Customer> customerOpt = customerRepository.findByPhone(phone);
        if (customerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Số điện thoại không tồn tại!");
        }

        Customer customer = customerOpt.get();

        // --- QUAN TRỌNG: DÙNG MATCHES ĐỂ SO SÁNH (KHÔNG DÙNG EQUALS) ---
        if (!passwordEncoder.matches(rawPassword, customer.getPassword())) {
            return ResponseEntity.badRequest().body("Sai mật khẩu!");
        }

        // Tạo Token và trả về (Code cũ giữ nguyên)
        String token = jwtUtils.generateToken(customer.getPhone());
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("id", customer.getId());
        response.put("name", customer.getName());
        response.put("phone", customer.getPhone());
        response.put("points", customer.getPointBalance()); // Chú ý: Backend bạn đang trả về pointBalance
        response.put("tier", customer.getTier());

        return ResponseEntity.ok(response);
    }

    // --- 4. CẬP NHẬT (NẾU ĐỔI MẬT KHẨU) ---
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomer(@PathVariable Long id, @RequestBody Customer customerDetails) {
        Customer existingCustomer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng ID: " + id));

        existingCustomer.setName(customerDetails.getName());
        existingCustomer.setPhone(customerDetails.getPhone());
        existingCustomer.setEmail(customerDetails.getEmail());

        // Nếu có gửi mật khẩu mới lên thì mới mã hóa và cập nhật
        if (customerDetails.getPassword() != null && !customerDetails.getPassword().isEmpty()) {
            existingCustomer.setPassword(passwordEncoder.encode(customerDetails.getPassword()));
        }

        Customer updatedCustomer = customerRepository.save(existingCustomer);
        return ResponseEntity.ok(updatedCustomer);
    }

    // Xóa (Giữ nguyên)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id) {
        if (!customerRepository.existsById(id)) return ResponseEntity.notFound().build();
        customerRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}