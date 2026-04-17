package com.carevia.shared.dto.request.voucher;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
public class CreateVoucherRequest {
    @NotBlank private String code;
    private String description;
    @NotNull private String voucherType;
    @NotNull private BigDecimal discountValue;
    private BigDecimal minOrderValue;
    private BigDecimal maxDiscount;
    @NotNull private Integer totalQuantity;
    @NotNull private Instant startDate;
    @NotNull private Instant endDate;
    private Long applicableDeviceId;
    private Long applicableCategoryId;
}
