package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.model.Transaction;
import com.doan.loyaltyapp.repository.CustomerRepository;
import com.doan.loyaltyapp.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*") // <--- 1. QUAN TRỌNG: Sửa lỗi 403 Forbidden
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private CustomerRepository customerRepository;

    // 1. Lấy TOÀN BỘ danh sách giao dịch
    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll(Sort.by(Sort.Direction.DESC, "transactionDate"));
    }

    // 2. Lấy lịch sử của 1 khách hàng
    @GetMapping("/customer/{customerId}")
    public List<Transaction> getTransactionsByCustomer(@PathVariable Long customerId) {
        return transactionRepository.findByCustomerIdOrderByTransactionDateDesc(customerId);
    }

    // 3. API CỘNG ĐIỂM (Đã sửa để khớp với Frontend)
    // Frontend gửi dạng: /add-points?customerId=1&amount=500000
    @PostMapping("/add-points")
    public ResponseEntity<?> addPoints(
            @RequestParam Long customerId,  // <--- 2. Sửa @RequestBody thành @RequestParam
            @RequestParam Double amount     // <--- 2. Nhận trực tiếp biến amount
    ) {
        try {
            // Tìm khách hàng
            Customer customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại!"));

            // Tính điểm: 10.000 VNĐ = 1 điểm (Theo logic hiển thị ở Frontend)
            // Hoặc 1.000 VNĐ = 1 điểm tùy bạn quy định. Ở đây mình để 10.000 theo ảnh bạn gửi
            int pointsEarned = (int) (amount / 10000); 

            // Lưu giao dịch
            Transaction transaction = new Transaction();
            transaction.setCustomer(customer);
            transaction.setTotalAmount(amount);
            transaction.setPointsEarned(pointsEarned);
            transaction.setPointsUsed(0);
            transaction.setType("EARN"); // Mặc định là tích điểm
            transaction.setTransactionDate(LocalDateTime.now());
            
            transactionRepository.save(transaction);

            // Cập nhật ví và hạng thành viên
            int newBalance = customer.getPointBalance() + pointsEarned;
            customer.setPointBalance(newBalance);

            // Logic thăng hạng (Tự động cập nhật hạng dựa trên tổng điểm)
            // updateCustomerTier(customer, newBalance);

            customerRepository.save(customer);

            return ResponseEntity.ok("Cộng điểm thành công! Khách nhận được " + pointsEarned + " điểm.");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Lỗi Server: " + e.getMessage());
        }
    }

    // Hàm phụ: Cập nhật hạng thành viên
    // private void updateCustomerTier(Customer customer, int balance) {
    //     if (balance >= 10000) customer.setTier("Kim Cương");
    //     else if (balance >= 5000) customer.setTier("Vàng");
    //     else if (balance >= 2000) customer.setTier("Bạc");
    //     else if (balance < 2000) customer.setTier("Mới"); // Reset về Mới nếu điểm thấp
    // }
}