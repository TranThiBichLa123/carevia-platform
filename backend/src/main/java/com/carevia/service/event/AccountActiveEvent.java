package com.carevia.service.event;

import com.carevia.core.domain.Account;
import lombok.Getter; // Thêm dòng này
import lombok.AllArgsConstructor;

@Getter // Thêm dòng này để tự tạo hàm getAccount() và getToken()
@AllArgsConstructor
public class AccountActiveEvent {
    private final Account account;
    private final String token;
}