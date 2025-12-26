package com.doan.loyaltyapp.model;

import jakarta.persistence.*;
import java.time.LocalDate; // <--- Import này bắt buộc để dùng ngày tháng
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String phone;

    private String email;
    private String password;
    private String address; // Địa chỉ

    private Integer pointBalance = 0;
    private String tier = "Mới";

    // --- CÁC TRƯỜNG MỚI ---
    private String gender;  // Giới tính
    private LocalDate dob;  // Ngày sinh
    private String avatar;  // Ảnh đại diện
    private String status;  // Trạng thái (ACTIVE/LOCKED)

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // --- GETTER & SETTER (Đầy đủ cho tất cả các trường) ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Integer getPointBalance() { return pointBalance; }
    public void setPointBalance(Integer pointBalance) { this.pointBalance = pointBalance; }

    public String getTier() { return tier; }
    public void setTier(String tier) { this.tier = tier; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public LocalDate getDob() { return dob; }
    public void setDob(LocalDate dob) { this.dob = dob; }

    public String getAvatar() { return avatar; }
    public void setAvatar(String avatar) { this.avatar = avatar; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}