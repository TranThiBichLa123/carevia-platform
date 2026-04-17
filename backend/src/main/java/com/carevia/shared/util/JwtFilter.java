package com.carevia.shared.util; // Hoặc chuyển về package security để dễ quản lý

import com.carevia.shared.util.TokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final TokenProvider tokenProvider;

    // Inject TokenProvider vào filter
    public JwtFilter(TokenProvider tokenProvider) {
        this.tokenProvider = tokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // 1. Trích xuất Token từ header Authorization
        String jwt = resolveToken(request);

        // 2. Kiểm tra nếu Token có tồn tại và hợp lệ (đúng chữ ký, chưa hết hạn)
        if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
            // 3. Lấy đối tượng Authentication (bên trong chứa CustomUserDetails có ID)
            Authentication authentication = tokenProvider.getAuthentication(jwt);
            
            // 4. Nạp vào SecurityContext để hệ thống nhận diện User cho Request này
            SecurityContextHolder.getContext().setAuthentication(authentication);
        }
        
        // Cho phép request đi tiếp qua các filter khác
        filterChain.doFilter(request, response);
    }

    /**
     * Hàm hỗ trợ lấy chuỗi JWT từ Header Authorization
     */
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
