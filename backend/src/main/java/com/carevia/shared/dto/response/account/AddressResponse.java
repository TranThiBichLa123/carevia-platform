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

    // --- THÊM MỚI ---
    @Schema(description = "Ward", example = "Ward 1")
    private String ward;

    @Schema(description = "District", example = "District 1")
    private String district;
    // ----------------
    @Schema(description = "Whether this is the default address", example = "true")
    private Boolean isDefault;
}