package com.carevia.shared.dto.request.booking;

import lombok.Data;

@Data
public class UpdateBookingStatusRequest {
    private String status;
    private String note;
    private String cancelReason;
}
