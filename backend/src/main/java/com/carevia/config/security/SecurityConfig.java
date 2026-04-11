package com.carevia.config.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Tắt các tính năng bảo mật mặc định để test API dễ dàng hơn
                .csrf(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth
                        // 1. Cho phép truy cập Swagger UI
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html")
                        .permitAll()

                        // 2. Cho phép TẤT CẢ các API bắt đầu bằng /api/** được truy cập không cần login
                        // Điều này sẽ giúp bạn hết lỗi 403 khi nhấn Execute trên Swagger
                        .requestMatchers("/api/**").permitAll()

                        /*
                         * // Tạm thời COMMENT lại phần phân quyền vì chưa cần thiết lúc này
                         * .requestMatchers("/api/admin/**").hasRole("ADMIN")
                         * .requestMatchers("/api/staff/**").hasAnyRole("STAFF", "ADMIN")
                         * .requestMatchers("/api/client/**").hasAnyRole("CLIENT", "STAFF", "ADMIN")
                         */

                        // 3. Mọi request khác (nếu có) cũng cho phép luôn để test cho mượt
                        .anyRequest().permitAll());

        return http.build();
    }
}
