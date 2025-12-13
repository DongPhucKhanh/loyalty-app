package com.doan.loyaltyapp.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String phone;

    // Trong ảnh DB có cột email
    private String email; 

    // Mật khẩu (DB không hiện trong ảnh nhưng bắt buộc phải có để login)
    private String password; 

    // Ánh xạ cột 'point_balance' trong DB
    @Column(name = "point_balance")
    // @JsonProperty giúp Frontend vẫn nhận được chữ "points" để không bị lỗi giao diện
    @JsonProperty("points") 
    private int pointBalance;

    // Ánh xạ cột 'tier' trong DB
    @Column(name = "tier")
    @JsonProperty("rankName") // Giúp Frontend vẫn nhận được chữ "rankName"
    private String tier;

    // Ánh xạ cột 'created_at' trong DB
    @Column(name = "created_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    // --- CONSTRUCTORS ---
    public Customer() {}

    // --- GETTERS & SETTERS ---
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

    public int getPointBalance() { return pointBalance; }
    public void setPointBalance(int pointBalance) { this.pointBalance = pointBalance; }

    public String getTier() { return tier; }
    public void setTier(String tier) { this.tier = tier; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}