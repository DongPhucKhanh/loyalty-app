package com.doan.loyaltyapp.repository;

import com.doan.loyaltyapp.model.Reward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RewardRepository extends JpaRepository<Reward, Long> {
}