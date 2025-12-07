package com.doan.loyaltyapp.config;

import com.doan.loyaltyapp.model.AdminUser;
import com.doan.loyaltyapp.repository.AdminUserRepository;
import com.doan.loyaltyapp.utils.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Lấy Token từ Header gửi lên
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // Cắt bỏ chữ "Bearer "
            try {
                username = jwtUtils.extractUsername(token);
            } catch (Exception e) {
                System.out.println("Lỗi trích xuất Token: " + e.getMessage());
            }
        }

        // 2. Nếu có Username và chưa được xác thực
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            Optional<AdminUser> userOptional = adminUserRepository.findByUsername(username);

            if (userOptional.isPresent()) {
                AdminUser user = userOptional.get();

                // 3. Kiểm tra tính hợp lệ
                if (jwtUtils.validateToken(token, user.getUsername())) {
                    // 4. Tạo đối tượng xác thực (Vé thông hành)
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            user, 
                            null, 
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRole()))
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // 5. Đóng dấu "Đã xác thực" vào hệ thống
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        }

        // Cho phép đi tiếp
        filterChain.doFilter(request, response);
    }
}