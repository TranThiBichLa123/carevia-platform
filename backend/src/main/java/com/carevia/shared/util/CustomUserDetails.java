package com.carevia.shared.util;


import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import java.util.Collection;

@Getter
public class CustomUserDetails extends User {
    private final Long id; // Lưu ID của Account vào đây

    public CustomUserDetails(Long id, String username, String password, 
                             Collection<? extends GrantedAuthority> authorities) {
        super(username, password, authorities);
        this.id = id;
    }
}