package com.carevia.service;


import com.carevia.service.event.AccountActiveEvent;
import com.carevia.service.event.PasswordResetEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AccountEventListener {

    private final MailService mailService;

    @EventListener
    public void handleAccountActiveEvent(AccountActiveEvent event) {
        // Gọi hàm gửi mail kích hoạt
        mailService.sendActivationEmail(event.getAccount(), event.getToken());
    }

    @EventListener
    public void handlePasswordResetEvent(PasswordResetEvent event) {
        // Gọi hàm gửi mail reset mật khẩu
        mailService.sendPasswordResetMail(event.getAccount(), event.getToken());
    }
}    
