package com.carevia.shared.dto.response.session;

import com.carevia.shared.constant.SessionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SessionResponse {
    private Long id;
    private Long deviceId;
    private String deviceName;
    private String branchName;
    private String locationDetail;
    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer maxSlots;
    private Integer availableSlots;
    private SessionStatus status;
    private BigDecimal pricePerSlot;
    private Long staffId;
    private String staffName;
}
