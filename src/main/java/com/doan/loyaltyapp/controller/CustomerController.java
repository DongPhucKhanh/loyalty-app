package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*") // Cho phép Frontend (localhost:5173) gọi API
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    // ==========================================
    // 1. LẤY DANH SÁCH KHÁCH HÀNG
    // GET: http://localhost:8080/api/customers
    // ==========================================
    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerService.getAllCustomers();
    }

    // ==========================================
    // 2. LẤY CHI TIẾT 1 KHÁCH HÀNG
    // GET: http://localhost:8080/api/customers/{id}
    // ==========================================
    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) {
        Customer customer = customerService.getCustomerById(id);
        return ResponseEntity.ok(customer);
    }

    // ==========================================
    // 3. THÊM KHÁCH HÀNG MỚI
    // POST: http://localhost:8080/api/customers
    // ==========================================
    @PostMapping
    public ResponseEntity<?> createCustomer(@RequestBody Customer customer) {
        try {
            Customer newCustomer = customerService.createCustomer(customer);
            return ResponseEntity.ok(newCustomer);
        } catch (RuntimeException e) {
            // Trả về lỗi nếu trùng SĐT
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==========================================
    // 4. SỬA THÔNG TIN KHÁCH HÀNG (MỚI)
    // PUT: http://localhost:8080/api/customers/{id}
    // ==========================================
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCustomer(@PathVariable Long id, @RequestBody Customer customerDetails) {
        try {
            Customer updatedCustomer = customerService.updateCustomer(id, customerDetails);
            return ResponseEntity.ok(updatedCustomer);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ==========================================
    // 5. XÓA KHÁCH HÀNG (MỚI)
    // DELETE: http://localhost:8080/api/customers/{id}
    // ==========================================
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        try {
            customerService.deleteCustomer(id);
            return ResponseEntity.noContent().build(); // Trả về 204 No Content (Thành công)
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}