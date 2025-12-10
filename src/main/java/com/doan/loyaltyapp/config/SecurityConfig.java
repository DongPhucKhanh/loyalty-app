package com.doan.loyaltyapp.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
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
            // 1. Tắt CSRF (để test API dễ dàng)
            .csrf(csrf -> csrf.disable())

            // 2. KÍCH HOẠT CORS (Cho phép Frontend React gọi vào)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 3. Cấu hình quyền truy cập (Authorize Requests)
            .authorizeHttpRequests(auth -> auth
                // --- MỞ KHÓA CHO SWAGGER UI (MỚI) ---
                .requestMatchers(
                        "/v3/api-docs/**",
                        "/swagger-ui/**",
                        "/swagger-ui.html"
                ).permitAll()

                // --- MỞ KHÓA CHO LOGIN / REGISTER ---
                .requestMatchers("/api/admin/users/login", "/api/admin/users/register").permitAll()

                // --- MỞ KHÓA CHO CÁC API CÔNG KHAI KHÁC (NẾU CẦN) ---
                // Cho phép trình duyệt gửi pre-flight request (OPTIONS)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll() 

                // --- CÁC API CÒN LẠI BẮT BUỘC PHẢI CÓ TOKEN ---
                .anyRequest().authenticated()
            )

            // 4. Thêm bộ lọc JWT vào trước bộ lọc xác thực mặc định
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // CẤU HÌNH CHI TIẾT CORS (Để React không bị lỗi)
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Cho phép Frontend chạy ở cổng 5173
        configuration.setAllowedOrigins(List.of("http://localhost:5173")); 
        
        // Cho phép tất cả các phương thức
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // Cho phép tất cả các Headers cần thiết
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "x-auth-token"));
        
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}