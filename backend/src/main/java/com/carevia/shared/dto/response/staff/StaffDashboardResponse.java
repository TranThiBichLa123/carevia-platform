package com.carevia.shared.dto.response.staff;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffDashboardResponse {
    private LocalDate date;
    private long bookingsToday;
    private long pendingBookings;
    private long checkedInToday;
    private long pendingOrders;
    private long lowStockDevices;
    private long maintenanceDevices;
    private long vouchersExpiringSoon;
    private List<DeviceAlert> lowStockAlerts;
    private List<DeviceAlert> maintenanceAlerts;
    private List<VoucherAlert> voucherAlerts;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeviceAlert {
        private Long deviceId;
        private String deviceName;
        private Integer stock;
        private String status;
        private String maintenanceReason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VoucherAlert {
        private Long voucherId;
        private String code;
        private Instant endDate;
        private Integer remainingQuantity;
    }
}