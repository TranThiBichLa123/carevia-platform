package com.carevia.shared.dto.request.order;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {
    @NotEmpty private List<OrderItemRequest> items;
    private String voucherCode;
    private String shippingAddress;
    private String shippingCity;
    private String shippingCountry;
    private String shippingPostalCode;
    private String paymentMethod;
    private String customerNote;

    @Data
    public static class OrderItemRequest {
        private Long deviceId;
        private Integer quantity;
    }
}
