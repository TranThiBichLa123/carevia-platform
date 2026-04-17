package com.carevia.shared.dto.response.notification;

import com.carevia.shared.constant.NotificationStatus;
import com.carevia.shared.constant.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String title;
    private String message;
    private NotificationType notificationType;
    private NotificationStatus status;
    private Long referenceId;
    private String referenceType;
    private String actionUrl;
    private Instant createdAt;
}
