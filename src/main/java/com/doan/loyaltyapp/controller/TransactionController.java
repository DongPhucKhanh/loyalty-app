package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.model.Promotion; // <--- 1. Import Promotion
import com.doan.loyaltyapp.model.Transaction;
import com.doan.loyaltyapp.repository.CustomerRepository;
import com.doan.loyaltyapp.repository.PromotionRepository; // <--- 2. Import Repo
import com.doan.loyaltyapp.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate; // <--- 3. Import LocalDate
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "*") 
public class TransactionController {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PromotionRepository promotionRepository; // <--- 4. Tiêm (Inject) Repository Khuyến mãi

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

    // 3. API CỘNG ĐIỂM (LOGIC MỚI: CÓ TÍNH KHUYẾN MÃI)
    @PostMapping("/add-points")
    public ResponseEntity<?> addPoints(
            @RequestParam Long customerId,
            @RequestParam Double amount
    ) {
        try {
            // A. Tìm khách hàng
            Customer customer = customerRepository.findById(customerId)
                    .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại!"));

            // B. Tính điểm gốc (10.000 VNĐ = 1 điểm)
            int basePoints = (int) (amount / 10000); 

            // C. --- KIỂM TRA KHUYẾN MÃI (LOGIC MỚI) ---
            double multiplier = 1.0; // Hệ số mặc định là 1 (không nhân)
            String promoName = "";

            // Gọi Repo để tìm xem hôm nay có sự kiện nào đang chạy không
            List<Promotion> activePromotions = promotionRepository.findActivePromotions(LocalDate.now());
            
            if (!activePromotions.isEmpty()) {
                // Lấy khuyến mãi đầu tiên tìm được
                Promotion promo = activePromotions.get(0);
                multiplier = promo.getMultiplier(); // Lấy hệ số nhân (ví dụ 1.5)
                promoName = promo.getName();
                
                System.out.println("DEBUG: Áp dụng khuyến mãi: " + promoName + " | Hệ số: x" + multiplier);
            }

            // D. Tính điểm thực nhận (Làm tròn xuống)
            int finalPoints = (int) (basePoints * multiplier);

            // E. Lưu giao dịch
            Transaction transaction = new Transaction();
            transaction.setCustomer(customer);
            transaction.setTotalAmount(amount);
            transaction.setPointsEarned(finalPoints); // Lưu điểm đã nhân hệ số
            transaction.setPointsUsed(0);
            transaction.setType("EARN"); 
            transaction.setTransactionDate(LocalDateTime.now());
            
            // (Tùy chọn) Lưu tên khuyến mãi vào ghi chú nếu cần
            if(multiplier > 1.0) {
                // transaction.setNote("Áp dụng KM: " + promoName); 
            }
            
            transactionRepository.save(transaction);

            // F. Cập nhật ví và hạng thành viên
            int newBalance = customer.getPointBalance() + finalPoints;
            customer.setPointBalance(newBalance);

            // Logic thăng hạng (nếu có)
            updateCustomerTier(customer, newBalance);

            customerRepository.save(customer);

            return ResponseEntity.ok("Thành công! Điểm gốc: " + basePoints + ". Điểm nhận được (x" + multiplier + "): " + finalPoints + " điểm.");

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Lỗi Server: " + e.getMessage());
        }
    }

    // Hàm phụ: Tự động thăng hạng (Dựa vào tổng điểm)
    private void updateCustomerTier(Customer customer, int balance) {
        if (balance >= 10000) customer.setTier("Kim Cương");
        else if (balance >= 5000) customer.setTier("Vàng");
        else if (balance >= 2000) customer.setTier("Bạc");
        else customer.setTier("Mới");
    }
}