package com.carevia.shared.dto.request.staff;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to approve staff")
public class ApproveStaffRequest {

    @Schema(description = "Existing brand ID to assign to the approved staff. Leave empty to create or reuse the brand from the seller application.", example = "12")
    private Long brandId;

    @Size(max = 500, message = "Note must not exceed 500 characters")
    @Schema(description = "Optional note for approval", example = "Approved based on credentials verification")
    private String note;
}

