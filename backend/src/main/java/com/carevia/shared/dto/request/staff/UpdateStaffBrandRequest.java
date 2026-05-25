package com.carevia.shared.dto.request.staff;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request for staff to update their assigned brand profile")
public class UpdateStaffBrandRequest {

    @NotBlank(message = "Brand name is required")
    @Size(max = 150, message = "Brand name must not exceed 150 characters")
    @Schema(description = "Brand display name", example = "Foreo Vietnam")
    private String name;

    @Size(max = 5000, message = "Brand description must not exceed 5000 characters")
    @Schema(description = "Brand description for storefront and admin review")
    private String description;
}