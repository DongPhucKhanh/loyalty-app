package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.Tier;
import com.doan.loyaltyapp.repository.TierRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tiers")
@CrossOrigin(origins = "*")
public class TierController {

    @Autowired
    private TierRepository tierRepository;

    @GetMapping
    public List<Tier> getAll() {
        return tierRepository.findAll(Sort.by(Sort.Direction.ASC, "minPoint"));
    }

    @PostMapping
    public Tier create(@RequestBody Tier tier) {
        return tierRepository.save(tier);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Tier> update(@PathVariable Long id, @RequestBody Tier details) {
        Tier tier = tierRepository.findById(id).orElseThrow();
        tier.setName(details.getName());
        tier.setMinPoint(details.getMinPoint());
        tier.setColorCode(details.getColorCode());
        return ResponseEntity.ok(tierRepository.save(tier));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        tierRepository.deleteById(id);
    }
}