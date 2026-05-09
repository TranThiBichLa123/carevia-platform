package com.carevia.core.domain;

import jakarta.persistence.*;
import lombok.*;
import com.carevia.shared.constant.RefundStatus;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "refund")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Refund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id")
    private PaymentTransaction transaction;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    /** ORDER_CANCEL | BOOKING_CANCEL | ORDER_RETURN */
    @Column(name = "refund_type", nullable = false, length = 30)
    @Builder.Default
    private String refundType = "ORDER_CANCEL";

    @Column(name = "external_refund_id", unique = true, length = 255)
    private String externalRefundId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "reason_code", nullable = false, length = 100)
    private String reasonCode;

    @Column(name = "reason_detail", columnDefinition = "TEXT")
    private String reasonDetail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private RefundStatus status = RefundStatus.REQUESTED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "processed_by_admin_id")
    private Account processedByAdmin;

    @Column(name = "requested_at", nullable = false)
    @Builder.Default
    private Instant requestedAt = Instant.now();

    @Column(name = "processed_at")
    private Instant processedAt;

    public void approve(Account admin) {
        this.status = RefundStatus.APPROVED;
        this.processedByAdmin = admin;
    }

    public void process() {
        this.status = RefundStatus.PROCESSING;
    }

    public void markSuccess() {
        this.status = RefundStatus.SUCCESS;
        this.processedAt = Instant.now();
    }

    public void markFailed(String reason) {
        this.status = RefundStatus.FAILED;
        this.reasonDetail = reason;
        this.processedAt = Instant.now();
    }

    public void cancel() {
        this.status = RefundStatus.CANCELLED;
        this.processedAt = Instant.now();
    }
}
