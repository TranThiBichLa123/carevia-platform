package com.carevia.core.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "notification_setting")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationSetting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "noti_type", nullable = false, length = 100)
    private String notiType;

    @Column(name = "enable_web", nullable = false)
    @Builder.Default
    private Boolean enableWeb = true;

    @Column(name = "enable_email", nullable = false)
    @Builder.Default
    private Boolean enableEmail = true;

    @Column(name = "enable_app_push", nullable = false)
    @Builder.Default
    private Boolean enableAppPush = true;

    @Column(name = "enable_sms", nullable = false)
    @Builder.Default
    private Boolean enableSms = false;

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private Instant updatedAt = Instant.now();

    public void enableWebChannel() {
        this.enableWeb = true;
    }

    public void disableWebChannel() {
        this.enableWeb = false;
    }

    public void enableEmailChannel() {
        this.enableEmail = true;
    }

    public void disableEmailChannel() {
        this.enableEmail = false;
    }

    public void enablePushChannel() {
        this.enableAppPush = true;
    }

    public void disablePushChannel() {
        this.enableAppPush = false;
    }

    public void enableSmsChannel() {
        this.enableSms = true;
    }

    public void disableSmsChannel() {
        this.enableSms = false;
    }
}
