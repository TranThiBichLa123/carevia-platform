package com.carevia.shared.dto.response.staff;

import com.carevia.shared.constant.InventoryTransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryTransactionResponse {
    private Long id;
    private Long deviceId;
    private String deviceName;
    private InventoryTransactionType transactionType;
    private Integer quantityChange;
    private Integer previousStock;
    private Integer newStock;
    private String reason;
    private String note;
    private String createdBy;
    private Instant createdAt;
}