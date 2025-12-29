package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.Employee;
import com.doan.loyaltyapp.repository.EmployeeRepository;
import com.doan.loyaltyapp.service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees") // API riêng cho nhân viên
@CrossOrigin(origins = "*")
public class EmployeeController {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // 1. Lấy danh sách
    @GetMapping
    public List<Employee> getAll() {
        return employeeRepository.findAll();
    }

    // 2. Thêm nhân viên (Lưu vào bảng employees)
    @PostMapping
    public ResponseEntity<?> create(@RequestBody Employee emp) {
        if (employeeRepository.findByUsername(emp.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Tên đăng nhập đã tồn tại!");
        }
        
        // Mặc định pass 123456 nếu không nhập
        String rawPass = (emp.getPassword() == null || emp.getPassword().isEmpty()) ? "123456" : emp.getPassword();
        emp.setPassword(passwordEncoder.encode(rawPass));
        emp.setRole("STAFF"); // Luôn là STAFF
        
        Employee saved = employeeRepository.save(emp);
        auditLogService.saveLog("Admin", "TẠO NHÂN VIÊN", "NV: " + saved.getUsername());
        return ResponseEntity.ok(saved);
    }

    // 3. Cập nhật
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Employee details) {
        return employeeRepository.findById(id).map(emp -> {
            emp.setFullName(details.getFullName());
            emp.setActive(details.isActive());
            
            if (details.getPassword() != null && !details.getPassword().isEmpty()) {
                emp.setPassword(passwordEncoder.encode(details.getPassword()));
            }
            
            employeeRepository.save(emp);
            return ResponseEntity.ok(emp);
        }).orElse(ResponseEntity.notFound().build());
    }

    // 4. Xóa
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        employeeRepository.deleteById(id);
        auditLogService.saveLog("Admin", "XÓA NHÂN VIÊN", "ID: " + id);
        return ResponseEntity.ok().build();
    }
}