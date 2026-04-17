package com.carevia.shared.dto.response.booking;

import com.carevia.shared.constant.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private String bookingCode;
    private Long accountId;
    private String accountName;
    private SessionInfo session;
    private DeviceInfo device;
    private LocalDate appointmentDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private BookingStatus status;
    private BigDecimal totalPrice;
    private BigDecimal discountAmount;
    private String voucherCode;
    private String customerNote;
    private String staffNote;
    private String cancelReason;
    private String cancelledBy;
    private Instant createdAt;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SessionInfo {
        private Long id;
        private String branchName;
        private String locationDetail;
        private LocalDate sessionDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private Integer maxSlots;
        private Integer availableSlots;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DeviceInfo {
        private Long id;
        private String name;
        private String image;
        private BigDecimal bookingPrice;
    }
}
