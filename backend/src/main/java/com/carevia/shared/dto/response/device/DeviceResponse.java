package com.carevia.shared.dto.response.device;

import com.carevia.shared.constant.DeviceStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeviceResponse {
    private Long id;
    private String name;
    private String slug;
    private String description;
    private String content;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private Double discountPercentage;
    private Integer stock;
    private Double averageRating;
    private String image;
    private List<String> images;
    private CategoryInfo category;
    private BrandInfo brand;
    private String sku;
    private WarrantyInfo warranty;
    private String origin;
    private String deviceCondition;
    private String skinType;
    private String skinConcerns;
    private DeviceStatus status;
    private Integer sold;
    private Integer reviewCount;
    private Long viewCount;
    private Boolean isBookingAvailable;
    private BigDecimal bookingPrice;
    private List<String> tags;
    private String videoUrl;
    private List<SpecificationInfo> specifications;
    private Instant createdAt;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CategoryInfo {
        private Long id;
        private String name;
        private String slug;
        private String image;
        private String categoryType;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class BrandInfo {
        private Long id;
        private String name;
        private String slug;
        private String image;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class WarrantyInfo {
        private Integer period;
        private String policy;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SpecificationInfo {
        private String label;
        private String value;
    }
}
