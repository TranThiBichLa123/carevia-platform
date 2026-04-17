package com.carevia.shared.dto.response.cart;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {
    private Long id;
    private List<CartItemInfo> items;
    private BigDecimal totalAmount;
    private int totalItems;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class CartItemInfo {
        private Long id;
        private Long deviceId;
        private String deviceName;
        private String deviceImage;
        private BigDecimal devicePrice;
        private BigDecimal originalPrice;
        private Double discountPercentage;
        private Integer stock;
        private Integer quantity;
        private BigDecimal subtotal;
    }
}
