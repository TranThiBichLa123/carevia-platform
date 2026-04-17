package com.carevia.shared.dto.request.booking;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateBookingRequest {
    @NotNull private Long sessionId;
    @NotNull private Long deviceId;
    private String customerNote;
    private String voucherCode;
}
