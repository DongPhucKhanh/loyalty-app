package com.doan.loyaltyapp.config;

import com.doan.loyaltyapp.utils.JwtUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority; // <--- 1. IMPORT MỚI
import org.springframework.security.core.authority.SimpleGrantedAuthority; // <--- 2. IMPORT MỚI
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtils jwtUtils;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // 1. Lấy Token
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                username = jwtUtils.extractUsername(token);
            } catch (Exception e) {
                logger.error("Lỗi trích xuất Token: " + e.getMessage());
            }
        }

        // 2. Xác thực
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            
            if (jwtUtils.validateToken(token, username)) {
                
                // 3. --- QUAN TRỌNG: PHÂN QUYỀN (Role) TỰ ĐỘNG ---
                List<GrantedAuthority> authorities = new ArrayList<>();
                
                if (username.startsWith("NV")) {
                    // Nếu username bắt đầu bằng NV -> Là STAFF
                    authorities.add(new SimpleGrantedAuthority("STAFF"));
                } else if (username.matches("\\d+")) { 
                    // Nếu username toàn số (SĐT) -> Là CUSTOMER
                    authorities.add(new SimpleGrantedAuthority("CUSTOMER"));
                } else {
                    // Còn lại -> Là ADMIN
                    authorities.add(new SimpleGrantedAuthority("ADMIN"));
                }
                // ------------------------------------------------

                // 4. Tạo đối tượng xác thực với danh sách quyền đã cấp
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        username, null, authorities // <--- Đưa danh sách quyền vào đây
                );
                
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}