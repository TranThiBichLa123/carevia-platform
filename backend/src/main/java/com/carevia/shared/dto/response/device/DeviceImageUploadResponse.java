package com.carevia.shared.dto.response.device;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceImageUploadResponse {
    private String imageUrl;
    private String imagePublicId;
}