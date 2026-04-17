package com.carevia.core.domain;

import jakarta.persistence.*;
import lombok.*;
import com.carevia.shared.constant.OrderStatus;
import com.carevia.shared.constant.PaymentStatus;
import com.carevia.shared.entity.BaseEntity;
import com.carevia.shared.exception.InvalidStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_code", unique = true, nullable = false, length = 20)
    private String orderCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @Column(name = "subtotal", precision = 12, scale = 2)
    private BigDecimal subtotal;

    @Column(name = "discount_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "shipping_fee", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal shippingFee = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.PENDING_PAYMENT;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 20)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.INITIATED;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "payment_transaction_id", length = 100)
    private String paymentTransactionId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;

    @Column(name = "shipping_address", length = 500)
    private String shippingAddress;

    @Column(name = "shipping_city", length = 100)
    private String shippingCity;

    @Column(name = "shipping_country", length = 100)
    private String shippingCountry;

    @Column(name = "shipping_postal_code", length = 20)
    private String shippingPostalCode;

    @Column(name = "customer_note", length = 500)
    private String customerNote;

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    public void markPaid(String transactionId) {
        if (this.status != OrderStatus.PENDING_PAYMENT) {
            throw new InvalidStatusException("Can only mark PENDING_PAYMENT orders as paid");
        }
        this.status = OrderStatus.PAID;
        this.paymentStatus = PaymentStatus.SUCCESS;
        this.paymentTransactionId = transactionId;
        if (this.voucher != null) {
            this.voucher.useVoucher();
        }
    }

    public void process() {
        if (this.status != OrderStatus.PAID) {
            throw new InvalidStatusException("Can only process PAID orders");
        }
        this.status = OrderStatus.PROCESSING;
    }

    public void complete() {
        if (this.status != OrderStatus.PROCESSING) {
            throw new InvalidStatusException("Can only complete PROCESSING orders");
        }
        this.status = OrderStatus.COMPLETED;
    }

    public void cancel() {
        if (this.status == OrderStatus.COMPLETED) {
            throw new InvalidStatusException("Cannot cancel completed orders");
        }
        this.status = OrderStatus.CANCELLED;
        if (this.voucher != null && this.paymentStatus == PaymentStatus.SUCCESS) {
            this.voucher.returnVoucher();
        }
    }

    public void failPayment() {
        this.status = OrderStatus.FAILED;
        this.paymentStatus = PaymentStatus.FAILED;
    }

    public void calculateTotals() {
        this.subtotal = items.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        this.totalAmount = subtotal.add(shippingFee).add(taxAmount).subtract(discountAmount);
    }
}
