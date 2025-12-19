package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.repository.CustomerRepository;
import com.doan.loyaltyapp.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder; // <--- Đừng quên import này
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/customers")
// Config cho phép cả Localhost và Vercel gọi vào
@CrossOrigin(origins = {"http://localhost:5173", "https://loyalty-client-lilac.vercel.app"}, allowCredentials = "true") 
public class CustomerController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private PasswordEncoder passwordEncoder; // <--- Bắt buộc phải có để mã hóa

    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    // ==========================================
    // 1. ĐĂNG KÝ (Cần mã hóa mật khẩu)
    // ==========================================
    @PostMapping
    public ResponseEntity<?> createCustomer(@RequestBody Customer customer) {
        // Kiểm tra trùng số điện thoại
        if (customer.getPhone() != null && customerRepository.findByPhone(customer.getPhone()).isPresent()) {
            return ResponseEntity.badRequest().body("Số điện thoại đã tồn tại!");
        }

        // Mật khẩu mặc định nếu không nhập
        if (customer.getPassword() == null || customer.getPassword().isEmpty()) {
            customer.setPassword("123456");
        }

        // --- QUAN TRỌNG NHẤT: MÃ HÓA MẬT KHẨU ---
        // Dòng này biến "123" thành "$2a$10$..."
        String encodedPassword = passwordEncoder.encode(customer.getPassword());
        customer.setPassword(encodedPassword);

        // Các giá trị mặc định khác
        if (customer.getPointBalance() == 0) customer.setPointBalance(0);
        if (customer.getTier() == null) customer.setTier("Mới");

        try {
            Customer savedCustomer = customerRepository.save(customer);
            return ResponseEntity.ok(savedCustomer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }

    // ==========================================
    // 2. ĐĂNG NHẬP (So sánh mật khẩu mã hóa)
    // ==========================================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String phone = loginData.get("phone");
        String rawPassword = loginData.get("password");

        Optional<Customer> customerOpt = customerRepository.findByPhone(phone);
        if (customerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Số điện thoại không tồn tại!");
        }

        Customer customer = customerOpt.get();

        // So sánh mật khẩu nhập vào (raw) với mật khẩu trong DB (encoded)
        if (!passwordEncoder.matches(rawPassword, customer.getPassword())) {
            return ResponseEntity.badRequest().body("Sai mật khẩu!");
        }

        // Tạo Token trả về
        String token = jwtUtils.generateToken(customer.getPhone());
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("id", customer.getId());
        response.put("name", customer.getName());
        response.put("phone", customer.getPhone());
        response.put("points", customer.getPointBalance()); // Map đúng biến 'points' cho Frontend
        response.put("tier", customer.getTier());

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // 3. CẬP NHẬT THÔNG TIN (Đổi mật khẩu nếu có)
    // ==========================================
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomer(@PathVariable Long id, @RequestBody Customer customerDetails) {
        Customer existingCustomer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        existingCustomer.setName(customerDetails.getName());
        existingCustomer.setPhone(customerDetails.getPhone());
        existingCustomer.setEmail(customerDetails.getEmail());

        // Chỉ mã hóa lại nếu người dùng đổi mật khẩu mới
        if (customerDetails.getPassword() != null && !customerDetails.getPassword().isEmpty()) {
            existingCustomer.setPassword(passwordEncoder.encode(customerDetails.getPassword()));
        }

        Customer updatedCustomer = customerRepository.save(existingCustomer);
        return ResponseEntity.ok(updatedCustomer);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id) {
        if (!customerRepository.existsById(id)) return ResponseEntity.notFound().build();
        customerRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}