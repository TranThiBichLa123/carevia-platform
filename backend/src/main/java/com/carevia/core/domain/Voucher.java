package com.carevia.core.domain;

import jakarta.persistence.*;
import lombok.*;
import com.carevia.shared.constant.VoucherStatus;
import com.carevia.shared.constant.VoucherType;
import com.carevia.shared.entity.BaseEntity;
import com.carevia.shared.exception.InvalidStatusException;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "vouchers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Voucher extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(length = 255)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "voucher_type", nullable = false, length = 20)
    private VoucherType voucherType;

    @Column(name = "discount_value", nullable = false, precision = 12, scale = 2)
    private BigDecimal discountValue;

    @Column(name = "min_order_value", precision = 12, scale = 2)
    private BigDecimal minOrderValue;

    @Column(name = "max_discount", precision = 12, scale = 2)
    private BigDecimal maxDiscount;

    @Column(name = "total_quantity", nullable = false)
    private Integer totalQuantity;

    @Column(name = "used_quantity")
    @Builder.Default
    private Integer usedQuantity = 0;

    @Column(name = "start_date", nullable = false)
    private Instant startDate;

    @Column(name = "end_date", nullable = false)
    private Instant endDate;

    @Enumerated(EnumType.STRING)
    @Column(length = 20, nullable = false)
    @Builder.Default
    private VoucherStatus status = VoucherStatus.ACTIVE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "device_id")
    private Device applicableDevice;

    @Column(name = "applicable_category_id")
    private Long applicableCategoryId;

    public boolean isValid() {
        Instant now = Instant.now();
        return status == VoucherStatus.ACTIVE
                && now.isAfter(startDate)
                && now.isBefore(endDate)
                && usedQuantity < totalQuantity;
    }

    public void useVoucher() {
        if (!isValid()) {
            throw new InvalidStatusException("Voucher is not valid");
        }
        this.usedQuantity++;
        if (this.usedQuantity >= this.totalQuantity) {
            this.status = VoucherStatus.USED_UP;
        }
    }

    public void returnVoucher() {
        if (this.usedQuantity > 0) {
            this.usedQuantity--;
            if (this.status == VoucherStatus.USED_UP) {
                this.status = VoucherStatus.ACTIVE;
            }
        }
    }

    public BigDecimal calculateDiscount(BigDecimal orderAmount) {
        if (!isValid()) return BigDecimal.ZERO;
        if (minOrderValue != null && orderAmount.compareTo(minOrderValue) < 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount;
        if (voucherType == VoucherType.PERCENTAGE) {
            discount = orderAmount.multiply(discountValue).divide(BigDecimal.valueOf(100));
            if (maxDiscount != null && discount.compareTo(maxDiscount) > 0) {
                discount = maxDiscount;
            }
        } else {
            discount = discountValue;
        }

        return discount.min(orderAmount);
    }
}
