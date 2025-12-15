package com.doan.loyaltyapp.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
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

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                // 1. Cho phép OPTIONS (CORS)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // 2. Swagger & Auth
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**").permitAll()
                .requestMatchers("/api/register", "/api/login", "/api/customers/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/customers").permitAll()

                // --- 3. KHU VỰC QUẢN LÝ (FIX LỖI 403) ---
                // Khai báo rõ ràng từng đường dẫn con để đảm bảo Spring Security hiểu
                .requestMatchers("/api/tiers/**").permitAll()
                .requestMatchers("/api/customers/**").permitAll()
                .requestMatchers("/api/rewards/**").permitAll()
                .requestMatchers("/api/promotions/**").permitAll()
                .requestMatchers("/api/admin/**").permitAll()

                // --- SỬA ĐOẠN NÀY ---
                // Mở quyền cho tất cả đường dẫn con của transactions
                .requestMatchers("/api/transactions/**").permitAll()
                .requestMatchers("/api/transactions/customer/**").permitAll() // <-- Thêm dòng này để chắc chắn
                
                // ---------------------

                // 4. (Tùy chọn cho Dev) Cho phép TẤT CẢ request GET để xem dữ liệu không bị chặn
                // Nếu dòng trên vẫn lỗi, dòng này sẽ cứu bạn
                .requestMatchers(HttpMethod.GET, "/api/**").permitAll()

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Bean CorsFilter giữ nguyên...
    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:5174"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        source.registerCorsConfiguration("/**", config);
        FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>(new CorsFilter(source));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);
        return bean;
    }
}