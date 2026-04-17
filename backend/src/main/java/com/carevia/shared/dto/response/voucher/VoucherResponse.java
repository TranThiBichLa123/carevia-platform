package com.carevia.shared.dto.response.voucher;

import com.carevia.shared.constant.VoucherStatus;
import com.carevia.shared.constant.VoucherType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoucherResponse {
    private Long id;
    private String code;
    private String description;
    private VoucherType voucherType;
    private BigDecimal discountValue;
    private BigDecimal minOrderValue;
    private BigDecimal maxDiscount;
    private Integer totalQuantity;
    private Integer usedQuantity;
    private Integer remainingQuantity;
    private Instant startDate;
    private Instant endDate;
    private VoucherStatus status;
    private Long applicableDeviceId;
    private String applicableDeviceName;
    private Long applicableCategoryId;
    private Instant createdAt;
}
