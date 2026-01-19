package com.doan.loyaltyapp.config;

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

                // 3. --- QUAN TRỌNG: MỞ CỬA CHO LOGIN & NHÂN VIÊN ---
                // Cho phép vào trang đăng nhập mới
                .requestMatchers("/api/auth/**").permitAll() 
                
                // Cho phép quản lý nhân viên (để Admin tạo user, hoặc test)
                .requestMatchers("/api/employees/**").permitAll()
                
                // Cho phép quản lý Admin (nếu cần)
                .requestMatchers("/api/admin-users/**").permitAll()

                // 4. Auth Endpoints cũ (Giữ lại nếu App Mobile còn dùng)
                .requestMatchers("/api/register", "/api/login", "/api/customers/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/customers").permitAll()

                // 5. Mở rộng quyền truy cập để Test
                .requestMatchers("/api/tiers/**", "/api/rewards/**", "/api/promotions/**").permitAll()
                .requestMatchers("/api/customers/**", "/api/admin/**").permitAll()
                .requestMatchers("/api/transactions/**").permitAll()
                .requestMatchers("/api/internal-notes/**").hasAnyAuthority("ADMIN", "STAFF") 
                .requestMatchers("/api/transactions/**").hasAnyRole("ADMIN", "STAFF")

                // 6. Cho phép tất cả GET để frontend dễ gọi dữ liệu (Test only)
                .requestMatchers(HttpMethod.GET, "/api/**").permitAll()

                // 7. Các request còn lại bắt buộc đăng nhập
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // --- 3. CẤU HÌNH CORS (GIỮ NGUYÊN) ---
    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();

        config.setAllowCredentials(true);
        config.addAllowedOriginPattern("*");
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));

        source.registerCorsConfiguration("/**", config);

        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);

        return bean;
    }
}