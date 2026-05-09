package com.carevia.shared.dto.response.refund;

import com.carevia.shared.constant.RefundStatus;
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
public class RefundResponse {
    private Long id;
    /** ORDER_CANCEL | BOOKING_CANCEL | ORDER_RETURN */
    private String refundType;
    private Long orderId;
    private String orderCode;
    private Long bookingId;
    private String bookingCode;
    private BigDecimal amount;
    private String reasonCode;
    private String reasonDetail;
    private RefundStatus status;
    private Instant requestedAt;
    private Instant processedAt;
}
