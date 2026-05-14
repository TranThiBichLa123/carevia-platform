package com.carevia.shared.dto.request.system;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateBusinessSettingsRequest {

    @NotBlank(message = "Business name is required")
    @Size(max = 150, message = "Business name must not exceed 150 characters")
    private String businessName;

    @NotBlank(message = "Hotline is required")
    @Size(max = 50, message = "Hotline must not exceed 50 characters")
    private String hotline;

    @NotBlank(message = "Support email is required")
    @Email(message = "Support email is invalid")
    @Size(max = 150, message = "Support email must not exceed 150 characters")
    private String supportEmail;

    @NotBlank(message = "Store address is required")
    @Size(max = 300, message = "Store address must not exceed 300 characters")
    private String storeAddress;

    @Size(max = 200, message = "Store hours must not exceed 200 characters")
    private String storeHours;

    @Size(max = 2000, message = "Support note must not exceed 2000 characters")
    private String supportNote;
}