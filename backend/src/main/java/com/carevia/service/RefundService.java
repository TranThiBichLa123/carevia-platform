package com.carevia.service;

import com.carevia.core.domain.*;
import com.carevia.core.repository.*;
import com.carevia.shared.constant.BookingStatus;
import com.carevia.shared.constant.OrderStatus;
import com.carevia.shared.constant.PaymentStatus;
import com.carevia.shared.constant.RefundStatus;
import com.carevia.shared.dto.response.refund.RefundResponse;
import com.carevia.shared.exception.InvalidRequestException;
import com.carevia.shared.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RefundService {

    private final RefundRepository refundRepository;
    private final OrderRepository orderRepository;
    private final BookingRepository bookingRepository;

    public RefundService(RefundRepository refundRepository,
                         OrderRepository orderRepository,
                         BookingRepository bookingRepository) {
        this.refundRepository = refundRepository;
        this.orderRepository = orderRepository;
        this.bookingRepository = bookingRepository;
    }

    /**
     * Called internally when user cancels a PAID order.
     * Creates a refund record with status REQUESTED.
     */
    @Transactional
    public Refund createOrderCancelRefund(Order order) {
        if (order.getPaymentStatus() != PaymentStatus.SUCCESS) {
            return null; // no payment made, no refund needed
        }
        Refund refund = Refund.builder()
                .order(order)
                .refundType("ORDER_CANCEL")
                .amount(order.getTotalAmount())
                .reasonCode("ORDER_CANCELLED")
                .reasonDetail(order.getCancelReason())
                .status(RefundStatus.REQUESTED)
                .build();
        return refundRepository.save(refund);
    }

    /**
     * Called internally when user cancels a CONFIRMED booking.
     * Creates a refund record with status REQUESTED.
     */
    @Transactional
    public Refund createBookingCancelRefund(Booking booking) {
        // Only issue refund if booking was CONFIRMED (slot was reserved and presumably pre-paid)
        Refund refund = Refund.builder()
                .booking(booking)
                .refundType("BOOKING_CANCEL")
                .amount(booking.getTotalPrice())
                .reasonCode("BOOKING_CANCELLED")
                .reasonDetail(booking.getCancelReason())
                .status(RefundStatus.REQUESTED)
                .build();
        return refundRepository.save(refund);
    }

    /**
     * User requests a return for a COMPLETED order.
     */
    @Transactional
    public RefundResponse requestOrderReturn(Long orderId, Long accountId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getAccount().getId().equals(accountId)) {
            throw new InvalidRequestException("Cannot request return for another user's order");
        }
        if (order.getStatus() != OrderStatus.COMPLETED) {
            throw new InvalidRequestException("Only completed orders can be returned");
        }
        // Check no existing active return request
        boolean hasActiveReturn = refundRepository.findByOrderId(orderId).stream()
                .anyMatch(r -> r.getRefundType().equals("ORDER_RETURN")
                        && r.getStatus() != RefundStatus.FAILED
                        && r.getStatus() != RefundStatus.CANCELLED);
        if (hasActiveReturn) {
            throw new InvalidRequestException("A return request already exists for this order");
        }

        Refund refund = Refund.builder()
                .order(order)
                .refundType("ORDER_RETURN")
                .amount(order.getTotalAmount())
                .reasonCode("ORDER_RETURN")
                .reasonDetail(reason)
                .status(RefundStatus.REQUESTED)
                .build();
        refund = refundRepository.save(refund);
        return toResponse(refund);
    }

    /** Get all refunds belonging to a user (from orders + bookings) */
    public List<RefundResponse> getUserRefunds(Long accountId) {
        List<Refund> fromOrders = refundRepository.findByOrderAccountId(accountId);
        List<Refund> fromBookings = refundRepository.findByBookingAccountId(accountId);

        List<Refund> all = new ArrayList<>();
        all.addAll(fromOrders);
        all.addAll(fromBookings);
        all.sort(Comparator.comparing(Refund::getRequestedAt).reversed());
        return all.stream().map(this::toResponse).collect(Collectors.toList());
    }

    /** Get refunds for a specific order */
    public List<RefundResponse> getRefundsByOrder(Long orderId) {
        return refundRepository.findByOrderId(orderId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    /** Get refunds for a specific booking */
    public List<RefundResponse> getRefundsByBooking(Long bookingId) {
        return refundRepository.findByBookingId(bookingId).stream()
                .map(this::toResponse).collect(Collectors.toList());
    }

    /** Get all refunds (admin) */
    public List<RefundResponse> getAllRefunds() {
        return refundRepository.findAll().stream()
                .sorted(Comparator.comparing(Refund::getRequestedAt).reversed())
                .map(this::toResponse).collect(Collectors.toList());
    }

    /** Admin: approve refund */
    @Transactional
    public RefundResponse approveRefund(Long refundId, Account admin) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new ResourceNotFoundException("Refund not found"));
        if (refund.getStatus() != RefundStatus.REQUESTED) {
            throw new InvalidRequestException("Only REQUESTED refunds can be approved");
        }
        refund.approve(admin);
        return toResponse(refundRepository.save(refund));
    }

    /** Admin: mark refund as completed (money sent) */
    @Transactional
    public RefundResponse markRefundSuccess(Long refundId) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new ResourceNotFoundException("Refund not found"));
        refund.markSuccess();
        return toResponse(refundRepository.save(refund));
    }

    /** Admin: mark refund as failed with reason */
    @Transactional
    public RefundResponse markRefundFailed(Long refundId, String reason) {
        Refund refund = refundRepository.findById(refundId)
                .orElseThrow(() -> new ResourceNotFoundException("Refund not found"));
        refund.markFailed(reason);
        return toResponse(refundRepository.save(refund));
    }

    private RefundResponse toResponse(Refund r) {
        return RefundResponse.builder()
                .id(r.getId())
                .refundType(r.getRefundType())
                .orderId(r.getOrder() != null ? r.getOrder().getId() : null)
                .orderCode(r.getOrder() != null ? r.getOrder().getOrderCode() : null)
                .bookingId(r.getBooking() != null ? r.getBooking().getId() : null)
                .bookingCode(r.getBooking() != null ? r.getBooking().getBookingCode() : null)
                .amount(r.getAmount())
                .reasonCode(r.getReasonCode())
                .reasonDetail(r.getReasonDetail())
                .status(r.getStatus())
                .requestedAt(r.getRequestedAt())
                .processedAt(r.getProcessedAt())
                .build();
    }
}
