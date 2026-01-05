package com.doan.loyaltyapp.config;

import com.doan.loyaltyapp.utils.JwtUtils; // Đảm bảo import đúng
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    // ❌ ĐÃ XÓA: private CustomerRepository customerRepository;
    // Lý do: Không cần tra DB ở đây, chỉ cần Token hợp lệ là đủ để lấy tên.

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Lấy Token từ Header gửi lên
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        // Header phải có dạng "Bearer eyJhbGci..."
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // Cắt bỏ chữ "Bearer "
            try {
                username = jwtUtils.extractUsername(token); // Lấy tên user (NV06, Admin, hoặc SĐT khách)
            } catch (Exception e) {
                logger.error("Lỗi trích xuất Token: " + e.getMessage());
            }
        }

        // 2. Nếu có username và chưa được xác thực
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            // Kiểm tra Token còn hạn không và có khớp username không
            if (jwtUtils.validateToken(token, username)) {
                
                // 3. --- THIẾT LẬP DANH TÍNH (QUAN TRỌNG NHẤT) ---
                // Đoạn này báo cho Spring Boot biết: "Đây là NV06, cho phép đi qua!"
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        username, null, new ArrayList<>() 
                );
                
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // Gán vào hệ thống bảo mật
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // Cho phép đi tiếp
        filterChain.doFilter(request, response);
    }
}