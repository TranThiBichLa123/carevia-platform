package com.carevia.core.domain;

import jakarta.persistence.*;
import lombok.*;
import com.carevia.shared.constant.BookingStatus;
import com.carevia.shared.entity.BaseEntity;
import com.carevia.shared.exception.InvalidStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_code", unique = true, nullable = false, length = 20)
    private String bookingCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ExperienceSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id", nullable = false)
    private Device device;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING_CONFIRM;

    @Column(name = "total_price", precision = 12, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "discount_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;

    @Column(name = "customer_note", length = 500)
    private String customerNote;

    @Column(name = "admin_note", columnDefinition = "TEXT")
    private String adminNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "handled_by_admin_id")
    private Account handledByAdmin;

    @Column(name = "staff_note", length = 500)
    private String staffNote;

    @Column(name = "cancel_reason", length = 500)
    private String cancelReason;

    @Column(name = "cancelled_by", length = 20)
    private String cancelledBy;

    public void confirm() {
        if (this.status != BookingStatus.PENDING_CONFIRM) {
            throw new InvalidStatusException("Can only confirm bookings in PENDING_CONFIRM status");
        }
        this.status = BookingStatus.CONFIRMED;
    }

    public void complete() {
        if (this.status != BookingStatus.CONFIRMED) {
            throw new InvalidStatusException("Can only complete bookings in CONFIRMED status");
        }
        this.status = BookingStatus.COMPLETED;
    }

    public void cancel(String reason, String cancelledBy) {
        if (this.status == BookingStatus.COMPLETED || this.status == BookingStatus.CANCELLED) {
            throw new InvalidStatusException("Cannot cancel booking in status: " + this.status);
        }
        this.status = BookingStatus.CANCELLED;
        this.cancelReason = reason;
        this.cancelledBy = cancelledBy;
        this.session.releaseSlot();
        if (this.voucher != null) {
            this.voucher.returnVoucher();
        }
    }

    public void expire() {
        if (this.status != BookingStatus.PENDING_CONFIRM) {
            throw new InvalidStatusException("Can only expire bookings in PENDING_CONFIRM status");
        }
        this.status = BookingStatus.EXPIRED;
        this.session.releaseSlot();
        if (this.voucher != null) {
            this.voucher.returnVoucher();
        }
    }

    public void markNoShow() {
        if (this.status != BookingStatus.CONFIRMED) {
            throw new InvalidStatusException("Can only mark no-show for CONFIRMED bookings");
        }
        this.status = BookingStatus.NO_SHOW;
    }

    public void assignAdmin(Account admin) {
        this.handledByAdmin = admin;
    }
}
