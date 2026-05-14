package com.carevia.shared.dto.request.staff;

import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UpdateMaintenanceRequest {

    @Size(max = 500)
    private String maintenanceReason;

    private LocalDate maintenanceStartDate;

    private LocalDate maintenanceEndDate;

    private BigDecimal maintenanceCost;

    private Boolean markCompleted;
}