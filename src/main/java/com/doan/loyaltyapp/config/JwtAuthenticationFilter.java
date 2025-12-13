package com.doan.loyaltyapp.config;

import com.doan.loyaltyapp.model.Customer;
import com.doan.loyaltyapp.repository.CustomerRepository;
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
    private CustomerRepository customerRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String requestPath = request.getRequestURI();
        String requestMethod = request.getMethod();

        // 1. Cho phép request OPTIONS (CORS pre-flight) đi qua
        if (requestMethod.equalsIgnoreCase("OPTIONS")) {
             filterChain.doFilter(request, response);
             return;
        }

        // 2. DANH SÁCH API CÔNG KHAI (KHÔNG CẦN TOKEN)
        // Chỉ bao gồm Đăng nhập và Đăng ký.
        // Tuyệt đối KHÔNG thêm "/api/user" vào đây.
        boolean isPublicEndpoint = 
            requestPath.equals("/api/login") ||             
            requestPath.equals("/api/register") ||
            requestPath.equals("/api/customers/login"); // API đăng nhập mới

        // Nếu là API công khai, cho qua luôn không cần check token
        if (isPublicEndpoint) {
            filterChain.doFilter(request, response);
            return; 
        }

        // -----------------------------------------------------------------
        // 3. XỬ LÝ TOKEN (Cho các request còn lại như /api/user/profile-summary)
        // -----------------------------------------------------------------
        
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String phone = null; // Username trong hệ thống của bạn là Số điện thoại

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7); // Cắt bỏ chữ "Bearer "
            try {
                phone = jwtUtils.extractUsername(token);
            } catch (Exception e) {
                System.out.println("Lỗi Token: " + e.getMessage());
            }
        }

        // 4. Xác thực và lưu vào SecurityContext
        if (phone != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Tìm Customer trong DB bằng số điện thoại
            Optional<Customer> customerOptional = customerRepository.findByPhone(phone);

            if (customerOptional.isPresent()) {
                Customer customer = customerOptional.get();

                // Kiểm tra hạn sử dụng của Token
                if (jwtUtils.validateToken(token, customer.getPhone())) {
                    
                    // Tạo đối tượng xác thực
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            customer, 
                            null, 
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_CUSTOMER")) // Gán quyền mặc định
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Đóng dấu "Đã xác thực" vào hệ thống Spring Security
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        }

        // Cho phép request đi tiếp đến Controller
        filterChain.doFilter(request, response);
    }
}