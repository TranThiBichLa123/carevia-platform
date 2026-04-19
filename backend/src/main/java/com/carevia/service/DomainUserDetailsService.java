package com.carevia.service;

import com.carevia.core.domain.Account;
import com.carevia.core.repository.AccountRepository;
import com.carevia.shared.util.CustomUserDetails;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service("userDetailsService")
public class DomainUserDetailsService implements UserDetailsService {

    private final AccountRepository accountRepository;

    public DomainUserDetailsService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        return accountRepository.findOneByEmailIgnoreCase(login)
                .map(this::createSpringSecurityUser)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "User with email " + login + " was not found in the database"));
    }

    private CustomUserDetails createSpringSecurityUser(Account account) {
        // Lấy quyền (Role) 
        List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority(account.getRole().name())
        );

        // Trả về CustomUserDetails kèm theo ID từ database
        return new CustomUserDetails(
                account.getId(),         // QUAN TRỌNG: Truyền ID vào đây
                account.getEmail(),      // Username dùng email
                account.getPasswordHash(),
                authorities
        );
    }
}
