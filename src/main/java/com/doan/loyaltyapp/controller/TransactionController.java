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
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private CustomerRepository customerRepository;

    // 1. Lấy TOÀN BỘ danh sách giao dịch (Dành cho Admin xem tổng quan)
    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll(Sort.by(Sort.Direction.DESC, "transactionDate"));
    }

    // ==================================================================
    // 2. API CÒN THIẾU: LẤY LỊCH SỬ CỦA 1 KHÁCH HÀNG
    // Endpoint: GET /api/transactions/customer/{customerId}
    // ==================================================================
    @GetMapping("/customer/{customerId}")
    public List<Transaction> getTransactionsByCustomer(@PathVariable Long customerId) {
        // Hàm này đã được khai báo trong TransactionRepository ở các bước trước
        return transactionRepository.findByCustomerIdOrderByTransactionDateDesc(customerId);
    }

    // 3. API CỘNG ĐIỂM (Logic đã chuẩn)
    @PostMapping("/add-points")
    public ResponseEntity<?> addPoints(@RequestBody Map<String, Object> payload) {
        try {
            // Kiểm tra dữ liệu đầu vào
            if (payload.get("customerId") == null || payload.get("amount") == null) {
                return ResponseEntity.badRequest().body("Thiếu thông tin customerId hoặc amount");
            }

            // Ép kiểu an toàn
            Long customerId = Long.valueOf(payload.get("customerId").toString());
            String amountStr = payload.get("amount").toString().replace(",", ""); // Xóa dấu phẩy
            Double amount = Double.valueOf(amountStr);
            String type = payload.getOrDefault("type", "EARN").toString();

            // Tìm khách hàng
            Customer customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại!"));

            // Tính điểm: 1000 VNĐ = 1 điểm
            int pointsEarned = (int) (amount / 1000);

            // Lưu giao dịch
            Transaction transaction = new Transaction();
            transaction.setCustomer(customer);
            transaction.setTotalAmount(amount);
            transaction.setPointsEarned(pointsEarned);
            transaction.setPointsUsed(0);
            transaction.setType(type);
            transaction.setTransactionDate(LocalDateTime.now());
            
            transactionRepository.save(transaction);

            // Cập nhật ví và hạng thành viên
            int newBalance = customer.getPointBalance() + pointsEarned;
            customer.setPointBalance(newBalance);

            // Logic thăng hạng
            if (newBalance >= 10000) customer.setTier("Kim Cương");
            else if (newBalance >= 5000) customer.setTier("Vàng");
            else if (newBalance >= 2000) customer.setTier("Bạc");
            else if (customer.getTier() == null) customer.setTier("Mới");

            customerRepository.save(customer);

            // Trả về kết quả
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Thành công");
            response.put("pointsAdded", pointsEarned);
            response.put("newBalance", newBalance);
            response.put("tier", customer.getTier());

            return ResponseEntity.ok(response);

        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Dữ liệu số không hợp lệ!");
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Lỗi Server: " + e.getMessage());
        }
    }
}