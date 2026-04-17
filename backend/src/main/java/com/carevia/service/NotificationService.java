package com.carevia.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.carevia.core.domain.*;
import com.carevia.core.repository.NotificationRepository;
import com.carevia.shared.constant.NotificationStatus;
import com.carevia.shared.constant.NotificationType;
import com.carevia.shared.dto.PageResponse;
import com.carevia.shared.dto.response.notification.NotificationResponse;
import com.carevia.shared.exception.ResourceNotFoundException;

import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    public void createBookingNotification(Account account, Booking booking, String eventType) {
        String title;
        String message;
        NotificationType type;

        switch (eventType) {
            case "BOOKING_CREATED" -> {
                title = "Booking Created";
                message = "Your booking " + booking.getBookingCode() + " has been created successfully. Waiting for confirmation.";
                type = NotificationType.BOOKING_CREATED;
            }
            case "BOOKING_CONFIRMED" -> {
                title = "Booking Confirmed";
                message = "Your booking " + booking.getBookingCode() + " has been confirmed!";
                type = NotificationType.BOOKING_CONFIRMED;
            }
            case "BOOKING_CANCELLED" -> {
                title = "Booking Cancelled";
                message = "Your booking " + booking.getBookingCode() + " has been cancelled.";
                type = NotificationType.BOOKING_CANCELLED;
            }
            case "BOOKING_COMPLETED" -> {
                title = "Booking Completed";
                message = "Your booking " + booking.getBookingCode() + " has been completed. Thank you!";
                type = NotificationType.BOOKING_COMPLETED;
            }
            default -> {
                title = "Booking Update";
                message = "Your booking " + booking.getBookingCode() + " has been updated.";
                type = NotificationType.SYSTEM;
            }
        }

        Notification notification = Notification.builder()
                .account(account)
                .title(title)
                .message(message)
                .notificationType(type)
                .referenceId(booking.getId())
                .referenceType("BOOKING")
                .actionUrl("/client/my-bookings")
                .build();

        notificationRepository.save(notification);
    }

    public void createOrderNotification(Account account, Order order, String eventType) {
        String title;
        String message;
        NotificationType type;

        switch (eventType) {
            case "ORDER_CREATED" -> {
                title = "Order Created";
                message = "Your order " + order.getOrderCode() + " has been created. Please complete payment.";
                type = NotificationType.ORDER_CREATED;
            }
            case "ORDER_PAID" -> {
                title = "Payment Successful";
                message = "Payment for order " + order.getOrderCode() + " was successful!";
                type = NotificationType.ORDER_PAID;
            }
            case "ORDER_PROCESSING" -> {
                title = "Order Processing";
                message = "Your order " + order.getOrderCode() + " is being processed.";
                type = NotificationType.ORDER_PROCESSING;
            }
            case "ORDER_COMPLETED" -> {
                title = "Order Completed";
                message = "Your order " + order.getOrderCode() + " has been completed!";
                type = NotificationType.ORDER_COMPLETED;
            }
            case "ORDER_CANCELLED" -> {
                title = "Order Cancelled";
                message = "Your order " + order.getOrderCode() + " has been cancelled.";
                type = NotificationType.ORDER_CANCELLED;
            }
            default -> {
                title = "Order Update";
                message = "Your order " + order.getOrderCode() + " has been updated.";
                type = NotificationType.SYSTEM;
            }
        }

        Notification notification = Notification.builder()
                .account(account)
                .title(title)
                .message(message)
                .notificationType(type)
                .referenceId(order.getId())
                .referenceType("ORDER")
                .actionUrl("/client/user/orders")
                .build();

        notificationRepository.save(notification);
    }

    public void createSystemNotification(Account account, String title, String message) {
        Notification notification = Notification.builder()
                .account(account)
                .title(title)
                .message(message)
                .notificationType(NotificationType.SYSTEM)
                .build();
        notificationRepository.save(notification);
    }

    public PageResponse<NotificationResponse> getNotifications(Long accountId, Pageable pageable) {
        Page<Notification> page = notificationRepository.findByAccountIdOrderByCreatedAtDesc(accountId, pageable);
        return toPageResponse(page);
    }

    public PageResponse<NotificationResponse> getUnreadNotifications(Long accountId, Pageable pageable) {
        Page<Notification> page = notificationRepository.findByAccountIdAndStatusOrderByCreatedAtDesc(
                accountId, NotificationStatus.UNREAD, pageable);
        return toPageResponse(page);
    }

    public long getUnreadCount(Long accountId) {
        return notificationRepository.countByAccountIdAndStatus(accountId, NotificationStatus.UNREAD);
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.markAsRead();
        return toResponse(notificationRepository.save(notification));
    }

    @Transactional
    public int markAllAsRead(Long accountId) {
        return notificationRepository.markAllAsRead(accountId);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .notificationType(n.getNotificationType())
                .status(n.getStatus())
                .referenceId(n.getReferenceId())
                .referenceType(n.getReferenceType())
                .actionUrl(n.getActionUrl())
                .createdAt(n.getCreatedAt())
                .build();
    }

    private PageResponse<NotificationResponse> toPageResponse(Page<Notification> page) {
        return PageResponse.<NotificationResponse>builder()
                .items(page.getContent().stream().map(this::toResponse).collect(Collectors.toList()))
                .page(page.getNumber())
                .size(page.getSize())
                .totalItems(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}
