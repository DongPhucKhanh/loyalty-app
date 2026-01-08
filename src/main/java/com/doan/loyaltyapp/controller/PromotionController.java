package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.model.Notification;
import com.doan.loyaltyapp.model.Promotion;
import com.doan.loyaltyapp.repository.CustomerRepository;
import com.doan.loyaltyapp.repository.NotificationRepository;
import com.doan.loyaltyapp.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@CrossOrigin(origins = "*")
public class PromotionController {

    @Autowired
    private PromotionRepository promotionRepository;

    @Autowired
    private CustomerRepository customerRepository; // Thêm để lấy danh sách khách hàng

    @Autowired
    private NotificationRepository notificationRepository; // Thêm để tạo thông báo

    @GetMapping
    public List<Promotion> getAll() {
        return promotionRepository.findAll();
    }

    // --- TẠO MỚI & GỬI THÔNG BÁO ---
    @PostMapping
    public Promotion create(@RequestBody Promotion promo) {
        Promotion savedPromo = promotionRepository.save(promo);
        sendBroadcastNotification(savedPromo); // Gọi hàm gửi thông báo
        return savedPromo;
    }

    // --- CẬP NHẬT & GỬI THÔNG BÁO ---
    @PutMapping("/{id}")
    public Promotion update(@PathVariable Long id, @RequestBody Promotion promo) {
        Promotion updatedPromo = promotionRepository.save(promo);
        sendBroadcastNotification(updatedPromo); // Thông báo khi có thay đổi
        return updatedPromo;
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        promotionRepository.deleteById(id);
    }

    // --- HÀM PHỤ: GỬI THÔNG BÁO CHO TẤT CẢ USER ---
    private void sendBroadcastNotification(Promotion promo) {
        List<Customer> customers = customerRepository.findAll();
        for (Customer customer : customers) {
            Notification notif = new Notification();
            notif.setUserId(customer.getId());
            notif.setTitle("Ưu đãi mới: " + promo.getName());
            notif.setMessage("Hệ số x" + promo.getMultiplier() + " đang được áp dụng. Xem ngay để không bỏ lỡ!");
            notif.setType("PROMOTION");
            notif.setRead(false); // Trạng thái mặc định là chưa đọc (hiện chấm đỏ)
            notif.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(notif);
        }
    }
}