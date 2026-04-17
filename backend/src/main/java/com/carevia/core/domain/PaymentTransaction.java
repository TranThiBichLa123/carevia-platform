package com.carevia.core.domain;

import jakarta.persistence.*;
import lombok.*;
import com.carevia.shared.constant.PaymentMethod;
import com.carevia.shared.constant.PaymentStatus;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "payment_transactions") // Đổi sang số nhiều cho chuẩn quy tắc đặt tên DB
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(name = "external_transaction_id", unique = true, length = 255)
    private String externalTransactionId;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 10)
    @Builder.Default
    private String currency = "VND";

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.INITIATED;

    /**
     * Sửa columnDefinition thành TEXT để tránh lỗi mapping JSON của Hibernate 6
     * Giúp lưu trữ toàn bộ dữ liệu phản hồi từ ZaloPay/Stripe một cách an toàn.
     */
    @Column(name = "provider_response", columnDefinition = "TEXT")
    private String providerResponse;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "transaction_at", nullable = false)
    @Builder.Default
    private Instant transactionAt = Instant.now();

    @Column(name = "completed_at")
    private Instant completedAt;

    // --- Các phương thức nghiệp vụ (Business Logic) ---

    public void markPending() {
        this.status = PaymentStatus.INITIATED;
    }

    public void markSuccess() {
        this.status = PaymentStatus.SUCCESS;
        this.completedAt = Instant.now();
    }

    public void markFailed() {
        this.status = PaymentStatus.FAILED;
        this.completedAt = Instant.now();
    }

    public void cancel() {
        this.status = PaymentStatus.CANCELLED;
        this.completedAt = Instant.now();
    }

    public void timeout() {
        this.status = PaymentStatus.TIMEOUT;
        this.completedAt = Instant.now();
    }

    public void saveProviderResponse(String data) {
        this.providerResponse = data;
    }
}
