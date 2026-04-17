package com.carevia.shared.dto.request.device;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class UpdateDeviceRequest {
    private String name;
    private String description;
    private String content;
    private BigDecimal price;
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
    private String status;
    private Boolean isBookingAvailable;
    private BigDecimal bookingPrice;
    private List<String> tags;
    private String videoUrl;
    private List<CreateDeviceRequest.SpecificationDTO> specifications;
}
