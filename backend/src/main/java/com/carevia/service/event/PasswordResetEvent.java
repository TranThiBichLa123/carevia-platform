package com.carevia.service.event;

import com.carevia.core.domain.Account;
import lombok.Getter; // Thêm dòng này
import lombok.AllArgsConstructor;

@Getter // Thêm dòng này
@AllArgsConstructor
public class PasswordResetEvent {
    private final Account account;
    private final String token;
}