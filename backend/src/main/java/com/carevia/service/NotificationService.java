package com.carevia.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.carevia.core.domain.*;
import com.carevia.core.repository.NotificationRepository;
import com.carevia.shared.dto.PageResponse;
import com.carevia.shared.dto.response.notification.NotificationResponse;
import com.carevia.shared.exception.ResourceNotFoundException;
import com.carevia.shared.constant.NotificationStatus;
import com.carevia.shared.constant.NotificationType;
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
                title = "Booking đã được tạo";
                message = "Booking của bạn " + booking.getBookingCode()
                        + " đã được tạo thành công. Đang chờ xác nhận.";
                type = NotificationType.BOOKING_CREATED;
            }
            case "BOOKING_CONFIRMED" -> {
                title = "Booking đã được xác nhận";
                message = "Booking của bạn " + booking.getBookingCode() + " đã được xác nhận!";
                type = NotificationType.BOOKING_CONFIRMED;
            }
            case "BOOKING_CANCELLED" -> {
                title = "Booking đã bị hủy";
                message = "Booking của bạn " + booking.getBookingCode() + " đã bị hủy.";
                type = NotificationType.BOOKING_CANCELLED;
            }
            case "BOOKING_COMPLETED" -> {
                title = "Booking đã hoàn tất";
                message = "Booking của bạn " + booking.getBookingCode() + " đã hoàn tất. Cảm ơn bạn!";
                type = NotificationType.BOOKING_COMPLETED;
            }
            default -> {
                title = "Cập nhật Booking";
                message = "Booking của bạn " + booking.getBookingCode() + " đã được cập nhật.";
                type = NotificationType.SYSTEM;
            }
        }

        Notification notification = Notification.builder()
                .account(account)
                .status(NotificationStatus.UNREAD)
                .title(title)
                .content(message)
                .type(type.name())
                .notificationType(type.name())
                .referenceId(booking.getId())
                .referenceType("BOOKING")
                .targetUrl("/client/my-bookings")
                .build();

        notificationRepository.save(notification);
    }

    public void createOrderNotification(Account account, Order order, String eventType) {
        String title;
        String message;
        NotificationType type;

        switch (eventType) {
            case "ORDER_CREATED" -> {
                title = "Order đã được tạo";
                message = "Order của bạn " + order.getOrderCode() + " đã được tạo. Vui lòng hoàn tất thanh toán.";
                type = NotificationType.ORDER_CREATED;
            }
            case "ORDER_PAID" -> {
                title = "Thanh toán thành công";
                message = "Thanh toán cho order " + order.getOrderCode() + " đã thành công!";
                type = NotificationType.ORDER_PAID;
            }
            case "ORDER_PROCESSING" -> {
                title = "Order đang được xử lý";
                message = "Order của bạn " + order.getOrderCode() + " đang được xử lý.";
                type = NotificationType.ORDER_PROCESSING;
            }
            case "ORDER_COMPLETED" -> {
                title = "Order đã hoàn tất";
                message = "Order của bạn " + order.getOrderCode() + " đã hoàn tất!";
                type = NotificationType.ORDER_COMPLETED;
            }
            case "ORDER_CANCELLED" -> {
                title = "Order đã bị hủy";
                message = "Order của bạn " + order.getOrderCode() + " đã bị hủy.";
                type = NotificationType.ORDER_CANCELLED;
            }
            default -> {
                title = "Cập nhật Order";
                message = "Order của bạn " + order.getOrderCode() + " đã được cập nhật.";
                type = NotificationType.SYSTEM;
            }
        }

        Notification notification = Notification.builder()
                .account(account)
                .status(NotificationStatus.UNREAD)
                .title(title)
                .content(message)
                .type(type.name())
                .notificationType(type.name())
                .referenceId(order.getId())
                .referenceType("ORDER")
                .targetUrl("/client/account?tab=orders")
                .build();

        notificationRepository.save(notification);
    }

    public void createSystemNotification(Account account, String title, String message) {
        Notification notification = Notification.builder()
                .account(account)
                .status(NotificationStatus.UNREAD)
                .title(title)
                .content(message)
                .type("SYSTEM")
                .notificationType("SYSTEM")
                .build();
        notificationRepository.save(notification);
    }

    public PageResponse<NotificationResponse> getNotifications(Long accountId, Pageable pageable) {
        Page<Notification> page = notificationRepository.findByAccountIdOrderByCreatedAtDesc(accountId, pageable);
        return toPageResponse(page);
    }

    public PageResponse<NotificationResponse> getUnreadNotifications(Long accountId, Pageable pageable) {
        // 1. Gọi đúng tên hàm trong Repository có chứa Status
        // 2. Truyền tham số: accountId, NotificationStatus.UNREAD, và pageable
        Page<Notification> page = notificationRepository.findByAccountIdAndStatusOrderByCreatedAtDesc(
                accountId,
                NotificationStatus.UNREAD,
                pageable);

        return toPageResponse(page);
    }

    public long getUnreadCount(Long accountId) {
        return notificationRepository.countByAccountIdAndStatus(accountId, NotificationStatus.UNREAD);
    }

    @Transactional
    public NotificationResponse markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setStatus(NotificationStatus.READ);
        return toResponse(notification);
    }

    @Transactional
    public int markAllAsRead(Long accountId) {
        return notificationRepository.markAllAsRead(accountId);
    }

    private NotificationResponse toResponse(Notification n) {
        NotificationType nType;
        try {
            nType = (n.getType() != null) ? NotificationType.valueOf(n.getType()) : NotificationType.SYSTEM;
        } catch (IllegalArgumentException e) {
            nType = NotificationType.SYSTEM;
        }
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getContent())
                .notificationType(nType)
                .status(n.getStatus())
                .referenceId(n.getReferenceId())
                .referenceType(n.getReferenceType())
                .actionUrl(n.getTargetUrl())
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
