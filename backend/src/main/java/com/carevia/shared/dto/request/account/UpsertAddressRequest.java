package com.carevia.shared.dto.request.account;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Request DTO for creating or updating a shipping address")
public class UpsertAddressRequest {

    @NotBlank(message = "Street address is required")
    @Size(max = 255, message = "Street address must not exceed 255 characters")
    @Schema(description = "Street address", example = "123 Nguyen Trai, Ward 1")
    private String street;

    @NotBlank(message = "City is required")
    @Size(max = 120, message = "City must not exceed 120 characters")
    @Schema(description = "City or province", example = "Ho Chi Minh")
    private String city;

    @NotBlank(message = "Country is required")
    @Size(max = 120, message = "Country must not exceed 120 characters")
    @Schema(description = "Country", example = "Vietnam")
    private String country;

    @NotBlank(message = "Postal code is required")
    @Size(max = 30, message = "Postal code must not exceed 30 characters")
    @Schema(description = "Postal code", example = "700000")
    private String postalCode;

    @Schema(description = "Whether this address is the default shipping address", example = "true")
    private Boolean isDefault;
}