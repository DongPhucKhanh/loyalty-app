package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.Promotion;
import com.doan.loyaltyapp.repository.PromotionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
@CrossOrigin(origins = "*")
public class PromotionController {

    @Autowired
    private PromotionRepository promotionRepository;

    @GetMapping
    public List<Promotion> getAll() {
        return promotionRepository.findAll();
    }

    @PostMapping
    public Promotion create(@RequestBody Promotion promo) {
        return promotionRepository.save(promo);
    }

    @PutMapping("/{id}")
    public Promotion update(@PathVariable Long id, @RequestBody Promotion promo) {
        return promotionRepository.save(promo); // Code tắt cho nhanh
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        promotionRepository.deleteById(id);
    }
}