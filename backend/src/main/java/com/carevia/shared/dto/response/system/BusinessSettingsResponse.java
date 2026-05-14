package com.carevia.shared.dto.response.system;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BusinessSettingsResponse {
    private String businessName;
    private String hotline;
    private String supportEmail;
    private String storeAddress;
    private String storeHours;
    private String supportNote;
}