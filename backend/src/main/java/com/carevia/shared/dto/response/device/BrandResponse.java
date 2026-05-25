package com.carevia.shared.dto.response.device;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandResponse {
    private Long id;
    private String name;
    private String slug;
    private String image;
    private String imagePublicId;
    private String description;
    private Boolean isFeatured;
    private Boolean isActive;
    private Double maxDiscountPercentage;
}
