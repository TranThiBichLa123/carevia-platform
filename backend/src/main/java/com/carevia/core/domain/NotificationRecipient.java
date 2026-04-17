package com.carevia.core.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "notification_recipient")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRecipient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notification_id", nullable = false)
    private Notification notification;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @Column(name = "read_at")
    private Instant readAt;

    @Column(name = "is_deleted", nullable = false)
    @Builder.Default
    private Boolean isDeleted = false;

    @Column(name = "sent_via_web", nullable = false)
    @Builder.Default
    private Boolean sentViaWeb = false;

    @Column(name = "sent_via_email", nullable = false)
    @Builder.Default
    private Boolean sentViaEmail = false;

    @Column(name = "sent_via_app_push", nullable = false)
    @Builder.Default
    private Boolean sentViaAppPush = false;

    public void markAsRead() {
        this.isRead = true;
        this.readAt = Instant.now();
    }

    public void markAsUnread() {
        this.isRead = false;
        this.readAt = null;
    }

    public void softDelete() {
        this.isDeleted = true;
    }

    public void restore() {
        this.isDeleted = false;
    }

    public void markSentViaWeb() {
        this.sentViaWeb = true;
    }

    public void markSentViaEmail() {
        this.sentViaEmail = true;
    }

    public void markSentViaAppPush() {
        this.sentViaAppPush = true;
    }
}
