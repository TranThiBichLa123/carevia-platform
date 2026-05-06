package com.carevia.shared.dto.response.device;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExperienceStepResponse {
    private Long id;
    private Integer stepNumber;
    private String stepTitle;
    private String stepContent;
    private String iconUrl;
    private Integer durationMinutes;
}
