package com.doan.loyaltyapp.controller;

import com.doan.loyaltyapp.model.InternalNote;
import com.doan.loyaltyapp.repository.InternalNoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/internal-notes")
@CrossOrigin(origins = "*") // Cho phép Frontend gọi API
public class InternalNoteController {

    @Autowired
    private InternalNoteRepository noteRepository;

    // --- HÀM PHỤ: KIỂM TRA QUYỀN LINH HOẠT ---
    // Hàm này chấp nhận cả "ADMIN" (trong DB của bạn) và "ROLE_ADMIN" (mặc định Spring)
    private boolean isUserAdmin(Authentication auth) {
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(r -> {
                    String roleName = r.getAuthority().toUpperCase(); // Đổi hết về chữ hoa để so sánh
                    return roleName.equals("ADMIN") || roleName.equals("ROLE_ADMIN");
                });
    }

    // --- 1. LẤY DANH SÁCH TIN NHẮN (GET) ---
    @GetMapping
    public List<InternalNote> getNotes() {
        // Lấy thông tin người đang đăng nhập
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        
        // Kiểm tra xem có phải Admin không (dùng hàm mới viết ở trên)
        boolean isAdmin = isUserAdmin(auth);

        if (isAdmin) {
            // ADMIN: Xem được tất cả tin nhắn (của mình + của nhân viên)
            return noteRepository.findAllByOrderByCreatedAtAsc();
        } else {
            // STAFF: Chỉ xem được tin của chính mình HOẶC tin có senderRole là 'ADMIN'
            // Tham số thứ 2 là "ADMIN" phải khớp với chữ Admin lưu trong DB
            return noteRepository.findBySenderNameOrSenderRoleOrderByCreatedAtAsc(currentUsername, "ADMIN");
        }
    }

    // --- 2. GỬI TIN NHẮN MỚI (POST) ---
    @PostMapping
    public InternalNote createNote(@RequestBody Map<String, String> payload) {
        // Lấy nội dung
        String content = payload.get("content");

        // Lấy User từ Token
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = auth.getName();
        
        // Xác định Role để lưu xuống DB
        String roleToSave = "STAFF"; // Mặc định là nhân viên
        
        if (isUserAdmin(auth)) {
            roleToSave = "ADMIN"; // Nếu là Admin thì lưu chữ "ADMIN"
        }

        // Lưu vào Database
        InternalNote note = new InternalNote(content, currentUsername, roleToSave);
        return noteRepository.save(note);
    }
}