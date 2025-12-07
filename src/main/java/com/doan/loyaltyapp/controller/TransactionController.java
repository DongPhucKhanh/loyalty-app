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
@CrossOrigin(origins = "*")
public class TransactionController {

    @Autowired
    private PointService pointService;
    
    @Autowired
    private TransactionRepository transactionRepository;

    // 1. Xem lịch sử giao dịch
    @GetMapping
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll(Sort.by(Sort.Direction.DESC, "transactionDate"));
    }

    // 2. Tạo giao dịch (SỬA LẠI ĐOẠN NÀY)
    // POST: /api/transactions/add-points?customerId=1&amount=100000&type=PRODUCT
    @PostMapping("/add-points")
    public String addPoints(
            @RequestParam Long customerId, 
            @RequestParam Double amount,
            @RequestParam(defaultValue = "PRODUCT") String type // <--- Thêm tham số này và set mặc định
    ) {
        // Bây giờ đã đủ 3 tham số để gọi hàm
        pointService.addPointsFromTransaction(customerId, amount, type);
        
        return "Giao dịch thành công!";
    }
}