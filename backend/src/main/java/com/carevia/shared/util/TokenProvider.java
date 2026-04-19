package com.carevia.shared.util;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Collections;
import java.security.Key;
import java.util.Date;

@Component
public class TokenProvider {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration:86400}") // Mặc định 24h nếu không cấu hình trong properties
    private long tokenValidityInSeconds;

    private final UserDetailsService userDetailsService;

    public TokenProvider(UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    // --- THÊM MỚI: Hàm tạo Token khi đăng nhập thành công ---
    public String createToken(Authentication authentication) {
        long now = (new Date()).getTime();
        Date validity = new Date(now + this.tokenValidityInSeconds * 1000);

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String role = userDetails.getAuthorities().iterator().next().getAuthority();

        return Jwts.builder()
                .setSubject(authentication.getName())
                // Lưu role và userId ở lớp ngoài cùng cho dễ lấy
                .claim("role", role)
                .claim("userId", userDetails.getId())
                .setIssuedAt(new Date())
                .setExpiration(validity)
                .signWith(getKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getKey()) // Phải dùng getKey() thống nhất
                    .build()
                    .parseClaimsJws(authToken);
            return true;
        } catch (Exception e) {
            // Thêm dòng này để xem tại sao nó false
            System.out.println("Lý do Token lỗi: " + e.getMessage());
            return false;
        }
    }

    public String getUsername(String token) {
        return Jwts.parserBuilder().setSigningKey(getKey()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public Authentication getAuthentication(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();

        // 1. Lấy Role (Thử mọi trường hợp có thể xảy ra trong Token của bạn)
        String role = null;

        if (claims.get("role") != null) {
            role = claims.get("role").toString();
        } else if (claims.get("user") != null) {
            java.util.Map<String, Object> userMap = (java.util.Map) claims.get("user");
            role = userMap.get("role") != null ? userMap.get("role").toString() : null;
        }

        // Nếu không tìm thấy bất kỳ role nào, log ra để debug
        if (role == null) {
            System.out.println("DEBUG - Không tìm thấy role trong Token! Claims: " + claims);
            role = "GUEST";
        }

        // 2. Lấy userId an toàn
        Object userIdObj = claims.get("userId");
        Long userId = 0L;
        if (userIdObj instanceof Number) {
            userId = ((Number) userIdObj).longValue();
        }

        // 3. Tạo quyền hạn (Đảm bảo là CLIENT khớp với annotation)
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority(role));

        CustomUserDetails principal = new CustomUserDetails(
                userId,
                claims.getSubject(),
                "",
                authorities);

        return new UsernamePasswordAuthenticationToken(principal, token, authorities);
    }

    private Key getKey() {
        // VIẾT CHẾT CHUỖI NÀY VÀO ĐỂ TEST - Bỏ qua việc đọc từ file yml/env
        String hardcodedKey = "carevialocaljwtsecretcarevia2026keyv1v2v3v4v5v6";
        byte[] keyBytes = hardcodedKey.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

}
