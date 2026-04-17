package com.carevia.core.domain;

import jakarta.persistence.*;
import lombok.*;
import com.carevia.shared.entity.BaseEntity;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id")
    private Device device;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    private Service service;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "discount_price", precision = 12, scale = 2)
    private BigDecimal discountPrice;

    @Column(name = "total_price", precision = 12, scale = 2)
    private BigDecimal totalPrice;

    @PrePersist
    @PreUpdate
    private void calculateTotal() {
        BigDecimal effectivePrice = this.discountPrice != null ? this.discountPrice : this.unitPrice;
        this.totalPrice = effectivePrice.multiply(BigDecimal.valueOf(this.quantity));
    }

    public BigDecimal getSubtotal() {
        if (this.totalPrice != null) return this.totalPrice;
        BigDecimal effectivePrice = this.discountPrice != null ? this.discountPrice : this.unitPrice;
        return effectivePrice.multiply(BigDecimal.valueOf(this.quantity));
    }
}
