package com.carevia.shared.dto.request.staff;

import com.carevia.shared.constant.InventoryTransactionType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdjustInventoryRequest {

    @NotNull
    private InventoryTransactionType transactionType;

    @NotNull
    @Min(0)
    private Integer quantity;

    @NotBlank
    private String reason;

    private String note;
}