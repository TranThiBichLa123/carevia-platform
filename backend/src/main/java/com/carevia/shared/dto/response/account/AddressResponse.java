package com.carevia.shared.dto.response.account;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Shipping address response")
public class AddressResponse {

    @Schema(description = "Address ID", example = "1")
    private Long id;

    @Schema(description = "Street address", example = "123 Nguyen Trai, Ward 1")
    private String street;

    @Schema(description = "City or province", example = "Ho Chi Minh")
    private String city;

    @Schema(description = "Country", example = "Vietnam")
    private String country;

    @Schema(description = "Postal code", example = "700000")
    private String postalCode;

    @Schema(description = "Whether this is the default address", example = "true")
    private Boolean isDefault;
}