package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.repository.CustomerRepository;
import com.doan.loyaltyapp.service.AuditLogService;
import com.doan.loyaltyapp.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/customers")
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
    // 1. ĐĂNG KÝ / TẠO KHÁCH HÀNG MỚI (CẬP NHẬT VALIDATION)
    // ============================================================
    @PostMapping
    public ResponseEntity<?> createCustomer(@RequestBody Customer customer) {
        // --- BẮT ĐẦU KIỂM TRA DỮ LIỆU ĐẦU VÀO ---

        // 1. Kiểm tra Họ tên: không chứa ký tự đặc biệt hoặc số
        // Regex: ^[a-zA-Z\\s\\p{L}]+$ (Hỗ trợ tiếng Việt có dấu)
        if (customer.getName() == null || !customer.getName().matches("^[a-zA-Z\\s\\p{L}]+$")) {
            return ResponseEntity.badRequest().body("Họ tên không hợp lệ (không chứa số hoặc ký tự đặc biệt)!");
        }

        // 2. Kiểm tra Số điện thoại: chỉ chứa số và ít hơn 10 chữ số
        // Tìm đoạn này trong createCustomer và sửa lại:
        if (customer.getPhone() == null || !customer.getPhone().matches("^[0-9]+$")
                || customer.getPhone().length() != 10) {
            return ResponseEntity.badRequest().body("Số điện thoại phải bao gồm đúng 10 chữ số!");
        }

        // 3. Kiểm tra Mật khẩu: yêu cầu ít nhất 6 ký tự
        if (customer.getPassword() != null && !customer.getPassword().isEmpty()
                && customer.getPassword().length() < 6) {
            return ResponseEntity.badRequest().body("Mật khẩu phải có ít nhất 6 ký tự!");
        }

        // 4. Kiểm tra SĐT đã tồn tại trong DB chưa
        if (customerRepository.findByPhone(customer.getPhone()).isPresent()) {
            return ResponseEntity.badRequest().body("Số điện thoại này đã được đăng ký!");
        }

        // --- KẾT THÚC KIỂM TRA ---

        // Xử lý mật khẩu mặc định nếu không nhập
        if (customer.getPassword() == null || customer.getPassword().isEmpty()) {
            customer.setPassword("123456"); // Mặc định 6 ký tự hợp lệ
        }
        customer.setPassword(passwordEncoder.encode(customer.getPassword()));

        // Thiết lập dữ liệu mặc định hệ thống
        customer.setPointBalance(0);
        customer.setTier("Mới"); // Mặc định ban đầu
        customer.setStatus("ACTIVE");

        if (customer.getAvatar() == null || customer.getAvatar().isEmpty()) {
            customer.setAvatar("https://cdn-icons-png.flaticon.com/512/149/149071.png");
        }

        try {
            Customer savedCustomer = customerRepository.save(customer);

            // GHI LOG HÀNH ĐỘNG
            String currentUsername = "Khách tự đăng ký";
            try {
                currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
                if (currentUsername.equals("anonymousUser"))
                    currentUsername = "Khách tự đăng ký";
            } catch (Exception e) {
            }

            auditLogService.saveLog(currentUsername, "TẠO KHÁCH HÀNG",
                    "Tên: " + savedCustomer.getName() + " - SĐT: " + savedCustomer.getPhone());

            return ResponseEntity.ok(savedCustomer);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi hệ thống khi lưu: " + e.getMessage());
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
    // 3. CẬP NHẬT THÔNG TIN (CŨNG CẦN VALIDATION TƯƠNG TỰ)
    // ============================================================
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomer(@PathVariable Long id, @RequestBody Customer customerDetails) {
        Customer existingCustomer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng ID: " + id));

        // Kiểm tra lại tính hợp lệ của tên khi cập nhật
        if (customerDetails.getName() != null && !customerDetails.getName().matches("^[a-zA-Z\\s\\p{L}]+$")) {
            return ResponseEntity.badRequest().body("Họ tên cập nhật không hợp lệ!");
        }

        existingCustomer.setName(customerDetails.getName());
        existingCustomer.setPhone(customerDetails.getPhone());
        existingCustomer.setAddress(customerDetails.getAddress());

        if (customerDetails.getPassword() != null && !customerDetails.getPassword().isEmpty()) {
            if (customerDetails.getPassword().length() < 6) {
                return ResponseEntity.badRequest().body("Mật khẩu mới phải từ 6 ký tự!");
            }
            existingCustomer.setPassword(passwordEncoder.encode(customerDetails.getPassword()));
        }

        Customer updatedCustomer = customerRepository.save(existingCustomer);

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        auditLogService.saveLog(currentUsername, "CẬP NHẬT KHÁCH", "ID: " + id);

        return ResponseEntity.ok(updatedCustomer);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCustomer(@PathVariable Long id) {
        if (!customerRepository.existsById(id))
            return ResponseEntity.notFound().build();

        Customer cus = customerRepository.findById(id).get();
        customerRepository.deleteById(id);

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        auditLogService.saveLog(currentUsername, "XÓA KHÁCH HÀNG", "Tên: " + cus.getName());

        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCustomerById(@PathVariable Long id) {
        return customerRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}