package com.doan.loyaltyapp.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1. Tắt CSRF
            .csrf(csrf -> csrf.disable())

            // 2. KÍCH HOẠT CORS (Cho phép Frontend gọi vào)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 3. Cấu hình quyền truy cập
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/admin/users/login", "/api/admin/users/register").permitAll()
                // Cho phép Options Request (để trình duyệt hỏi đường trước khi gửi dữ liệu thật)
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                .anyRequest().authenticated()
            )

            // 4. Thêm bộ lọc JWT
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // CẤU HÌNH CHI TIẾT CORS
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Cho phép Frontend chạy ở cổng 5173
        configuration.setAllowedOrigins(List.of("http://localhost:5173")); 
        
        // Cho phép tất cả các phương thức (GET, POST, PUT, DELETE, OPTIONS)
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // Cho phép tất cả các Headers (Authorization, Content-Type...)
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "x-auth-token"));
        
        // Cho phép gửi kèm Credentials (nếu cần)
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}