package com.carevia.shared.dto.request.device;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class CreateDeviceRequest {
    @NotBlank private String name;
    private String slug;
    private String description;
    private String content;
    @NotNull private BigDecimal price;
    private BigDecimal originalPrice;
    private Double discountPercentage;
    private Integer stock;
    private String image;
    private List<String> images;
    private Long categoryId;
    private Long brandId;
    private String sku;
    private Integer warrantyPeriod;
    private String warrantyPolicy;
    private String origin;
    private String deviceCondition;
    private String skinType;
    private String skinConcerns;
    private Boolean isBookingAvailable;
    private BigDecimal bookingPrice;
    private List<String> tags;
    private String videoUrl;
    private List<SpecificationDTO> specifications;

    @Data
    public static class SpecificationDTO {
        private String label;
        private String value;
    }
}
