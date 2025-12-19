package com.doan.loyaltyapp.config; // ⚠️ KIỂM TRA LẠI PACKAGE NẾU CẦN

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    // --- 1. BEAN MÃ HÓA MẬT KHẨU ---
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // --- 2. CẤU HÌNH BẢO MẬT ---
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // 1. Cho phép OPTIONS (quan trọng cho CORS)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // 2. Swagger & Public Resources
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**").permitAll()

                // 3. Auth Endpoints
                .requestMatchers("/api/register", "/api/login", "/api/customers/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/customers").permitAll()

                // 4. Mở rộng quyền truy cập để Test (Sau này cần bảo mật thì xóa bớt)
                .requestMatchers("/api/tiers/**", "/api/rewards/**", "/api/promotions/**").permitAll()
                .requestMatchers("/api/customers/**", "/api/admin/**").permitAll()
                .requestMatchers("/api/transactions/**").permitAll()

                // 5. Cho phép tất cả GET để frontend dễ gọi dữ liệu (Test only)
                .requestMatchers(HttpMethod.GET, "/api/**").permitAll()

                // 6. Các request còn lại bắt buộc đăng nhập
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // --- 3. CẤU HÌNH CORS (QUAN TRỌNG NHẤT) ---
    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        // Cho phép nhận Cookie/Auth header
        config.setAllowCredentials(true);

        // Chấp nhận TẤT CẢ các domain (Vercel, Localhost, Render...)
        // Dùng Pattern "*" thay vì liệt kê từng cái để tránh lỗi thiếu domain
        config.addAllowedOriginPattern("*");

        // Cho phép tất cả Header
        config.setAllowedHeaders(Arrays.asList("*"));

        // Cho phép tất cả các method
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        source.registerCorsConfiguration("/**", config);

        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        
        // Đặt độ ưu tiên cao nhất: Chạy filter này TRƯỚC KHI check bảo mật
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);

        return bean;
    }
}