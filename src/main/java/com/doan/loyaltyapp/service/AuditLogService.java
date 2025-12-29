package com.doan.loyaltyapp.service;

import com.doan.loyaltyapp.model.AuditLog;
import com.doan.loyaltyapp.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void saveLog(String who, String action, String details) {
        try {
            AuditLog log = new AuditLog(who, action, details);
            auditLogRepository.save(log);
        } catch (Exception e) {
            System.err.println("Lỗi không ghi được log: " + e.getMessage());
        }
    }
}