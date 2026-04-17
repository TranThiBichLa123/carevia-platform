package com.carevia.shared.dto.request.session;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CreateSessionRequest {
    @NotNull private Long deviceId;
    private String branchName;
    private String locationDetail;
    @NotNull private LocalDate sessionDate;
    @NotNull private LocalTime startTime;
    @NotNull private LocalTime endTime;
    private Integer maxSlots;
    private BigDecimal pricePerSlot;
    private Long staffId;
}
