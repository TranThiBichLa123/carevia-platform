package com.carevia.shared.dto.response.account;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response DTO for shipping address mutations")
public class AddressMutationResponse {

    @Schema(description = "Operation result", example = "true")
    private boolean success;

    @Schema(description = "List of current addresses after mutation")
    private List<AddressResponse> addresses;

    @Schema(description = "User-facing message", example = "Address added successfully")
    private String message;
}