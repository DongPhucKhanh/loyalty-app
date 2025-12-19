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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // <--- MỚI
import org.springframework.security.crypto.password.PasswordEncoder;     // <--- MỚI
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


    // --- 1. BEAN MÃ HÓA MẬT KHẨU (BẮT BUỘC PHẢI CÓ) ---
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth

                // 1. Cho phép OPTIONS (CORS preflight)

                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // 2. Swagger
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**").permitAll()

                // 3. Auth / Customer public API
                .requestMatchers("/api/register", "/api/login", "/api/customers/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/customers").permitAll()


                .requestMatchers("/api/tiers/**").permitAll()
                .requestMatchers("/api/customers/**").permitAll()
                .requestMatchers("/api/rewards/**").permitAll()
                .requestMatchers("/api/promotions/**").permitAll()
                .requestMatchers("/api/admin/**").permitAll()


                // --- GIAO DỊCH ---
                .requestMatchers("/api/transactions/**").permitAll()
                .requestMatchers("/api/transactions/customer/**").permitAll()
                
                // 4. Cho phép tất cả request GET (để test)
                .requestMatchers(HttpMethod.GET, "/api/**").permitAll()

                // 6. Các request còn lại cần xác thực
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public FilterRegistrationBean<CorsFilter> corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();


        config.setAllowCredentials(true);
        config.setAllowedOrigins(Arrays.asList(
                "http://localhost:5173",
                "http://localhost:5174"
        ));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowedMethods(Arrays.asList(
                "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));


        
        config.setAllowCredentials(true);
        
        // Dùng Pattern "*" để chấp nhận tất cả domain (Vercel, Localhost...)
        config.addAllowedOriginPattern("*"); 
        
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        
        source.registerCorsConfiguration("/**", config);

        FilterRegistrationBean<CorsFilter> bean =
                new FilterRegistrationBean<>(new CorsFilter(source));
        bean.setOrder(Ordered.HIGHEST_PRECEDENCE);

        return bean;
    }
}   