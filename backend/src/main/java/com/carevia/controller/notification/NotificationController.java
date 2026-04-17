package com.carevia.controller.notification;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.carevia.service.NotificationService;
import com.carevia.shared.annotation.Authenticated;
import com.carevia.shared.exception.UnauthorizedException;
import com.carevia.shared.util.SecurityUtils;

@RestController
@RequestMapping("/api/v1/notifications")
@Tag(name = "Notifications", description = "Notification APIs")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Authenticated
    @Operation(summary = "Get notifications")
    public ResponseEntity<?> getNotifications(Pageable pageable) {
        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
        return ResponseEntity.ok(notificationService.getNotifications(accountId, pageable));
    }

    @GetMapping("/unread")
    @Authenticated
    @Operation(summary = "Get unread notifications")
    public ResponseEntity<?> getUnreadNotifications(Pageable pageable) {
        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
        return ResponseEntity.ok(notificationService.getUnreadNotifications(accountId, pageable));
    }

    @GetMapping("/unread-count")
    @Authenticated
    @Operation(summary = "Get unread notification count")
    public ResponseEntity<Long> getUnreadCount() {
        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
        return ResponseEntity.ok(notificationService.getUnreadCount(accountId));
    }

    @PutMapping("/{id}/read")
    @Authenticated
    @Operation(summary = "Mark notification as read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PutMapping("/read-all")
    @Authenticated
    @Operation(summary = "Mark all notifications as read")
    public ResponseEntity<?> markAllAsRead() {
        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
        int count = notificationService.markAllAsRead(accountId);
        return ResponseEntity.ok(java.util.Map.of("markedCount", count));
    }
}
