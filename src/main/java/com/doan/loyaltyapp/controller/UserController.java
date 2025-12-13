package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.model.Transaction;
import com.doan.loyaltyapp.repository.CustomerRepository;
import com.doan.loyaltyapp.repository.TransactionRepository;

// --- QUAN TRỌNG: Import đúng thư viện cho phân trang và sắp xếp ---
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
// -----------------------------------------------------------------

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

    // Inject TransactionRepository để lấy lịch sử giao dịch
    @Autowired
    private TransactionRepository transactionRepository;

    // --- CÁC API CŨ (Login/Register) ---
    // (Lưu ý: Nếu bạn đã chuyển sang dùng CustomerController cho Login/Register 
    // thì có thể xóa 2 hàm này đi để tránh nhầm lẫn. Tuy nhiên, tôi vẫn giữ lại để code không bị lỗi)

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
        
        if(payload.containsKey("email")) {
            newCustomer.setEmail(payload.get("email"));
        }

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

    // --- CÁC API PROFILE & REWARDS ---

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

    // --- API QUAN TRỌNG: PROFILE SUMMARY (DASHBOARD) ---
    // Đường dẫn khớp với Frontend: /api/user/profile-summary
    @GetMapping("/user/profile-summary")
    public ResponseEntity<?> getProfileSummary(@RequestParam Long id) {
        Customer customer = customerRepository.findById(id).orElse(null);
        if (customer == null) return ResponseEntity.notFound().build();

        // 1. Lấy lịch sử giao dịch (5 giao dịch gần nhất)
        // Sort.by("transactionDate") đã hoạt động vì đã import đúng thư viện
        Pageable pageable = PageRequest.of(0, 5, Sort.by("transactionDate").descending());
        List<Transaction> recentTransactions = transactionRepository.findByCustomerId(id, pageable);
        
        // 2. Logic tính hạng (Khớp với Frontend: Mới -> Bạc -> Vàng -> Kim Cương)
        int currentPoints = customer.getPointBalance();
        String currentTier = customer.getTier(); // DB lưu "Mới", "Bạc", "Vàng"...
        
        int nextTierPoints = 0;
        String nextTierName = "";

        // Logic leo hạng: 0 -> 2000 (Bạc) -> 5000 (Vàng) -> 10000 (Kim Cương)
        if (currentPoints < 2000) {
            nextTierPoints = 2000;
            nextTierName = "Bạc";
        } else if (currentPoints < 5000) {
            nextTierPoints = 5000;
            nextTierName = "Vàng";
        } else if (currentPoints < 10000) {
            nextTierPoints = 10000;
            nextTierName = "Kim Cương";
        } else {
            // Đã đạt cấp cao nhất
            nextTierPoints = currentPoints; 
            nextTierName = "MAX";
        }

        // Tính % tiến trình
        double progress = 0;
        if (!nextTierName.equals("MAX")) {
             // Tính điểm mốc của hạng hiện tại để thanh progress bar chạy mượt hơn (không bắt đầu từ 0)
             int prevTierPoints = 0;
             if (currentPoints >= 5000) prevTierPoints = 5000;
             else if (currentPoints >= 2000) prevTierPoints = 2000;

             double totalRange = nextTierPoints - prevTierPoints;
             double currentProgress = currentPoints - prevTierPoints;
             progress = currentProgress / totalRange;
        } else {
            progress = 1.0;
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("name", customer.getName());
        summary.put("points", currentPoints);
        summary.put("currentTier", currentTier);
        summary.put("nextTierPoints", nextTierPoints);
        summary.put("nextTierName", nextTierName);
        summary.put("progress", progress);
        summary.put("recentTransactions", recentTransactions);

        return ResponseEntity.ok(summary);
    }
}