package com.carevia.service.event;


import com.carevia.core.domain.Account;

public record AccountActiveEvent(Account account, String rawToken) {
}
