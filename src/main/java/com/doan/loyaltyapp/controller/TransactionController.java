package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.Transaction;
import com.doan.loyaltyapp.repository.TransactionRepository;
import com.doan.loyaltyapp.service.PointService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*") // Cho phép Frontend gọi API
public class TransactionController {

    @Autowired
    private PointService pointService;
    
    @Autowired
    private TransactionRepository transactionRepository;

    // ==========================================
    // 1. XEM TOÀN BỘ LỊCH SỬ GIAO DỊCH
    // GET: http://localhost:8080/api/transactions
    // ==========================================
    @GetMapping
    public List<Transaction> getAllTransactions() {
        // Sắp xếp ngày mới nhất lên đầu để Admin dễ theo dõi
        return transactionRepository.findAll(Sort.by(Sort.Direction.DESC, "transactionDate"));
    }

    // ==========================================
    // 2. XEM LỊCH SỬ CỦA RIÊNG 1 KHÁCH HÀNG
    // GET: http://localhost:8080/api/transactions/customer/{customerId}
    // ==========================================
    @GetMapping("/customer/{customerId}")
    public List<Transaction> getTransactionsByCustomer(@PathVariable Long customerId) {
        return transactionRepository.findByCustomerIdOrderByTransactionDateDesc(customerId);
    }

    // ==========================================
    // 3. TẠO GIAO DỊCH MUA HÀNG (TÍCH ĐIỂM)
    // POST: /api/transactions/add-points?customerId=1&amount=100000&type=PRODUCT
    // ==========================================
    @PostMapping("/add-points")
    public String addPoints(
            @RequestParam Long customerId, 
            @RequestParam Double amount,
            @RequestParam(defaultValue = "PRODUCT") String type // Mặc định là PRODUCT nếu không truyền
    ) {
        // Gọi Service để tính toán điểm (1% hoặc 0% tùy loại) và lưu vào DB
        pointService.addPointsFromTransaction(customerId, amount, type);
        
        return "Giao dịch thành công!";
    }
}