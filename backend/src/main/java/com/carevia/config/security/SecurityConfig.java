package com.carevia.config.security;

import com.carevia.shared.util.JwtFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; // Thêm import này
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> web.ignoring().requestMatchers(
                "/v3/api-docs/**",
                "/v3/api-docs.yaml",
                "/swagger-ui/**",
                "/swagger-ui/index.html",
                "/swagger-resources/**",
                "/webjars/**");
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // 1. CẤU HÌNH XỬ LÝ LỖI PHÂN QUYỀN CHUẨN (Thay thế đoạn ép mã OK cũ)
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            // Trả về đúng mã 401 Unauthorized khi không có Token hợp lệ
                            response.setStatus(org.springframework.http.HttpStatus.UNAUTHORIZED.value());
                            response.setContentType("application/json;charset=UTF-8");

                            // Đóng gói cấu trúc lỗi an toàn thông tin (ApiResponse) dạng JSON
                            String jsonResponse = "{"
                                    + "\"status\": 401,"
                                    + "\"error\": \"Unauthorized\","
                                    + "\"message\": \"Yêu cầu quyền truy cập hệ thống (Thiếu Bearer Token).\""
                                    + "}";
                            response.getWriter().write(jsonResponse);
                        }))

                .authorizeHttpRequests(auth -> auth
                        // Cho phép truy cập công khai vào Swagger (Đã có cấu hình WebSecurityCustomizer
                        // bỏ qua bộ lọc ở trên)
                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/v3/api-docs.yaml",
                                "/swagger-ui/**",
                                "/swagger-ui/index.html",
                                "/swagger-resources/**",
                                "/webjars/**",
                                "/favicon.ico")
                        .permitAll()

                        // Không permitAll vô điều kiện cho /error để tránh lọt lưới bảo mật
                        // .requestMatchers("/error").permitAll() // <-- XÓA HOẶC LÀM MỜ DÒNG NÀY ĐI

                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/recommendations/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/devices/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/system-settings/**").permitAll()
                        .requestMatchers("/api/v1/payments/zalopay/callback").permitAll()

                        // Cấu hình cụ thể cho Orders (Có thể viết hiển thị hoặc để rơi vào
                        // .anyRequest())
                        .requestMatchers("/api/v1/orders/**").authenticated()

                        .requestMatchers("/api/v1/wishlist/**").authenticated()
                        .requestMatchers("/api/v1/bookings/**").authenticated()

                        // Tất cả các request khác (bao gồm cả orders nếu không khai báo trên) đều phải
                        // login
                        .anyRequest().authenticated())

                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        // Quan trọng: Cho phép các header mà axios thường gửi
        config.setAllowedHeaders(
                List.of("Authorization", "Content-Type", "Accept", "X-Requested-With", "Cache-Control", "Origin"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public DaoAuthenticationProvider daoAuthenticationProvider(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }
}
