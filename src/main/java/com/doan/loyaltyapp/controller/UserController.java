package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.model.Tier; // <--- Import Model Tier
import com.doan.loyaltyapp.model.Transaction;
import com.doan.loyaltyapp.repository.CustomerRepository;
import com.doan.loyaltyapp.repository.TierRepository; // <--- Import Repo Tier
import com.doan.loyaltyapp.repository.TransactionRepository;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"}, allowCredentials = "true")
public class UserController {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private TierRepository tierRepository; // <--- 1. TIÊM REPOSITORY HẠNG VÀO

    // --- CÁC API LOGIN / REGISTER (GIỮ NGUYÊN) ---
    @PostMapping("/register")
    public Customer register(@RequestBody Map<String, String> payload) {
        String phone = payload.get("phone");
        if (customerRepository.findByPhone(phone).isPresent()) {
            throw new RuntimeException("Số điện thoại này đã được đăng ký!");
        }
        Customer newCustomer = new Customer();
        newCustomer.setName(payload.get("name"));
        newCustomer.setPhone(phone);
        newCustomer.setPassword(payload.get("password"));
        newCustomer.setPointBalance(0); 
        newCustomer.setTier("Mới");
        if(payload.containsKey("email")) newCustomer.setEmail(payload.get("email"));
        return customerRepository.save(newCustomer);
    }

    @PostMapping("/login")
    public Customer login(@RequestBody Map<String, String> payload) {
        String phone = payload.get("phone");
        String password = payload.get("password");
        Optional<Customer> customerOpt = customerRepository.findByPhone(phone);
        if (customerOpt.isPresent()) {
            Customer customer = customerOpt.get();
            if (customer.getPassword().equals(password)) {
                return customer; 
            }
        }
        throw new RuntimeException("Sai số điện thoại hoặc mật khẩu!");
    }

    // --- CÁC API PROFILE & REWARDS (GIỮ NGUYÊN) ---
    @GetMapping("/user/profile")
    public Customer getUserProfile(@RequestParam Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng ID: " + id));
    }

    @GetMapping("/user/rewards")
    public List<Map<String, Object>> getRewards() {
        List<Map<String, Object>> list = new ArrayList<>();
        Map<String, Object> r1 = new HashMap<>();
        r1.put("id", 1); r1.put("name", "Voucher 50k"); r1.put("points", 500); r1.put("image", "https://via.placeholder.com/150");
        list.add(r1);
        Map<String, Object> r2 = new HashMap<>();
        r2.put("id", 2); r2.put("name", "Ly Sứ"); r2.put("points", 1200); r2.put("image", "https://via.placeholder.com/150");
        list.add(r2);
        return list;
    }

    @PostMapping("/user/redeem")
    public Map<String, Object> redeemReward(@RequestBody Map<String, Object> payload) {
        Long userId = Long.valueOf(payload.get("userId").toString());
        int pointsToRedeem = Integer.parseInt(payload.get("points").toString());
        Customer customer = customerRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Khách hàng không tồn tại"));
        Map<String, Object> response = new HashMap<>();
        if (customer.getPointBalance() >= pointsToRedeem) {
            customer.setPointBalance(customer.getPointBalance() - pointsToRedeem);
            customerRepository.save(customer);
            response.put("success", true);
            response.put("message", "Đổi quà thành công!");
            response.put("newPoints", customer.getPointBalance());
        } else {
            response.put("success", false);
            response.put("message", "Bạn không đủ điểm!");
        }
        return response;
    }

    // --- API PROFILE SUMMARY (DASHBOARD) - ĐÃ CẬP NHẬT LOGIC ĐỘNG ---
    @GetMapping("/user/profile-summary")
    public ResponseEntity<?> getProfileSummary(@RequestParam Long id) {
        Customer customer = customerRepository.findById(id).orElse(null);
        if (customer == null) return ResponseEntity.notFound().build();

        // 1. Lấy lịch sử giao dịch
        Pageable pageable = PageRequest.of(0, 5, Sort.by("transactionDate").descending());
        List<Transaction> recentTransactions = transactionRepository.findByCustomerId(id, pageable);
        
        // 2. Logic tính hạng ĐỘNG (Lấy từ DB thay vì gán cứng)
        int currentPoints = customer.getPointBalance();
        String currentTierName = customer.getTier();

        // Lấy tất cả các hạng, sắp xếp tăng dần theo điểm
        List<Tier> tiers = tierRepository.findAll(Sort.by(Sort.Direction.ASC, "minPoint"));

        Tier currentTierObj = null;
        Tier nextTierObj = null;

        // Thuật toán tìm hạng hiện tại và hạng kế tiếp
        for (int i = 0; i < tiers.size(); i++) {
            if (tiers.get(i).getName().equals(currentTierName)) {
                currentTierObj = tiers.get(i);
                // Nếu chưa phải là hạng cuối cùng trong list thì lấy hạng tiếp theo
                if (i < tiers.size() - 1) {
                    nextTierObj = tiers.get(i + 1);
                }
                break;
            }
        }
        
        // Fallback: Nếu không tìm thấy tên hạng trong DB (do lỗi dữ liệu cũ), lấy hạng đầu tiên
        if (currentTierObj == null && !tiers.isEmpty()) {
            currentTierObj = tiers.get(0);
            if (tiers.size() > 1) nextTierObj = tiers.get(1);
        }

        // 3. Tính toán thông tin trả về
        String nextTierLabel = "MAX";
        int nextTierPointsVal = currentPoints;
        double progress = 1.0;

        if (nextTierObj != null) {
            nextTierLabel = nextTierObj.getName();
            nextTierPointsVal = nextTierObj.getMinPoint();

            // Tính Progress Bar
            int prevTierPoints = currentTierObj != null ? currentTierObj.getMinPoint() : 0;
            double totalRange = nextTierObj.getMinPoint() - prevTierPoints;
            double currentProgress = currentPoints - prevTierPoints;

            if (totalRange > 0) {
                progress = currentProgress / totalRange;
                // Đảm bảo progress từ 0 -> 1
                if (progress < 0) progress = 0;
                if (progress > 1) progress = 1;
            }
        }

        Map<String, Object> summary = new HashMap<>();
        
        summary.put("id", customer.getId()); // ID quan trọng
        summary.put("name", customer.getName());
        summary.put("points", currentPoints);
        summary.put("currentTier", currentTierName);
        
        // Thông tin hạng kế tiếp (Động)
        summary.put("nextTierPoints", nextTierPointsVal);
        summary.put("nextTierName", nextTierLabel);
        
        summary.put("progress", progress);
        summary.put("recentTransactions", recentTransactions);

        return ResponseEntity.ok(summary);
    }
}