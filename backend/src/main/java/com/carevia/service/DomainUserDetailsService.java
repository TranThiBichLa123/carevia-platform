package com.carevia.service;

import com.carevia.core.domain.Account;
import com.carevia.core.repository.AccountRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service("userDetailsService")
public class DomainUserDetailsService implements UserDetailsService {

    private final AccountRepository accountRepository;

    public DomainUserDetailsService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String login) throws UsernameNotFoundException {
        // Tìm user theo email (hoặc username tùy bạn cấu hình)
        return accountRepository.findOneByEmailIgnoreCase(login)
            .map(this::createSpringSecurityUser)
            .orElseThrow(() -> new UsernameNotFoundException("User with email " + login + " was not found in the database"));
    }

    private User createSpringSecurityUser(Account account) {
        return new User(
            account.getEmail(),
            account.getPasswordHash(), // password_hash trong DB
            Collections.singletonList(new SimpleGrantedAuthority(account.getRole().name()))
        );
    }
}