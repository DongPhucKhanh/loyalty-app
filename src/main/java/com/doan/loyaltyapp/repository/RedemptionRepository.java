package com.doan.loyaltyapp.repository;

import com.doan.loyaltyapp.model.Redemption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface RedemptionRepository extends JpaRepository<Redemption, Long> {
    // Lấy lịch sử đổi quà của một khách hàng cụ thể
    List<Redemption> findByCustomerIdOrderByRedeemedDateDesc(Long customerId);

    // Tìm voucher theo mã code (dùng cho nhân viên kiểm tra tại quầy)
    Optional<Redemption> findByVoucherCode(String voucherCode);

    // --- CẬP NHẬT MỚI ---
    // Tìm các phần quà khách đã đổi nhưng chưa sử dụng để hiển thị tại POS
    List<Redemption> findByCustomerIdAndStatus(Long customerId, String status);
}