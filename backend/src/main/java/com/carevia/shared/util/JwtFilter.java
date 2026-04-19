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
        try {
            String jwt = resolveToken(request);

            // Log xem Filter có nhận được Token từ Frontend gửi lên không
            if (jwt != null) {
                System.out.println("DEBUG - JwtFilter: Nhan duoc token: " + jwt.substring(0, 10) + "...");
            }

            if (StringUtils.hasText(jwt) && !"undefined".equalsIgnoreCase(jwt) && !"null".equalsIgnoreCase(jwt)) {
                if (tokenProvider.validateToken(jwt)) {
                    Authentication authentication = tokenProvider.getAuthentication(jwt);
                    SecurityContextHolder.getContext().setAuthentication(authentication);

                    // Log xác nhận đã nạp User thành công
                    System.out
                            .println("DEBUG - JwtFilter: Da nap Authentication cho user: " + authentication.getName());
                } else {
                    System.out.println("DEBUG - JwtFilter: Token khong hop le (validateToken = false)");
                }
            }
        } catch (Exception e) {
            SecurityContextHolder.clearContext();
            System.out.println("DEBUG - JwtFilter LOI: " + e.getMessage()); // Sửa logger thành System.out để dễ thấy
        }
        filterChain.doFilter(request, response);
    }

    /**
     * Hàm hỗ trợ lấy chuỗi JWT từ Header Authorization
     */
    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            // Nếu là chuỗi "undefined" thì coi như không có token
            if ("undefined".equalsIgnoreCase(token) || "null".equalsIgnoreCase(token)) {
                return null;
            }
            return token;
        }
        return null;
    }

}
