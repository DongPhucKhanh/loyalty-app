package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.repository.CustomerRepository;
import com.doan.loyaltyapp.utils.JwtUtils; // Đảm bảo import JwtUtils
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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

    // Inject thêm JwtUtils để tạo Token khi đăng nhập
    @Autowired
    private JwtUtils jwtUtils;

    // 1. Lấy danh sách khách hàng
    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    // 2. Thêm khách hàng mới (Đăng ký)
    @PostMapping
    public ResponseEntity<?> createCustomer(@RequestBody Customer customer) {
        if (customer.getPhone() != null && customerRepository.findByPhone(customer.getPhone()).isPresent()) {
            return ResponseEntity.badRequest().body("Số điện thoại đã tồn tại!");
        }

        if (customer.getPassword() == null || customer.getPassword().isEmpty()) {
            customer.setPassword("123456");
        }

        if (customer.getPointBalance() == 0) {
            customer.setPointBalance(0);
        }

        if (customer.getTier() == null || customer.getTier().isEmpty()) {
            customer.setTier("Mới");
        }

        try {
            Customer savedCustomer = customerRepository.save(customer);
            return ResponseEntity.ok(savedCustomer);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Lỗi lưu dữ liệu: " + e.getMessage());
        }
    }

    // --- 3. HÀM ĐĂNG NHẬP (MỚI THÊM VÀO) ---
    // Endpoint: POST /api/customers/login
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginData) {
        String phone = loginData.get("phone");
        String password = loginData.get("password");

        // 1. Tìm user theo số điện thoại
        Optional<Customer> customerOpt = customerRepository.findByPhone(phone);
        
        if (customerOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Số điện thoại không tồn tại!");
        }

        Customer customer = customerOpt.get();

        // 2. Kiểm tra mật khẩu (So sánh chuỗi thường vì code create của bạn chưa mã hóa)
        if (!customer.getPassword().equals(password)) {
            return ResponseEntity.badRequest().body("Sai mật khẩu!");
        }

        // 3. Tạo Token
        String token = jwtUtils.generateToken(customer.getPhone());

        // 4. Chuẩn bị dữ liệu trả về (Token + Thông tin User)
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        
        // --- QUAN TRỌNG: TRẢ VỀ THÔNG TIN ĐỂ FRONTEND LƯU ---
        response.put("id", customer.getId());
        response.put("name", customer.getName());
        response.put("phone", customer.getPhone());
        response.put("email", customer.getEmail());
        response.put("points", customer.getPointBalance()); // Điểm hiện tại
        response.put("tier", customer.getTier());           // Hạng hiện tại

        return ResponseEntity.ok(response);
    }
    // ------------------------------------------

    // 4. Cập nhật thông tin khách hàng
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomer(@PathVariable Long id, @RequestBody Customer customerDetails) {
        Customer existingCustomer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng ID: " + id));

        existingCustomer.setName(customerDetails.getName());
        existingCustomer.setPhone(customerDetails.getPhone());
        existingCustomer.setEmail(customerDetails.getEmail());

        Customer updatedCustomer = customerRepository.save(existingCustomer);
        return ResponseEntity.ok(updatedCustomer);
    }

    // 5. Xóa khách hàng
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id) {
        if (!customerRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        customerRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}