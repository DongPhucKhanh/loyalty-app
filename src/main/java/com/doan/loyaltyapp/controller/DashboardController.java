package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.dto.DashboardStats;
import com.doan.loyaltyapp.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    // API: Lấy thống kê tổng quan
    // GET: http://localhost:8080/api/admin/dashboard/stats
    @GetMapping("/stats")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }
}