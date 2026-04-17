package com.carevia.controller.order;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.carevia.service.OrderService;
import com.carevia.shared.annotation.AdminOnly;
import com.carevia.shared.annotation.Authenticated;
import com.carevia.shared.annotation.StaffOnly;
import com.carevia.shared.dto.request.order.CreateOrderRequest;
import com.carevia.shared.exception.UnauthorizedException;
import com.carevia.shared.util.SecurityUtils;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/orders")
@Tag(name = "Orders", description = "Order management APIs")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    @Authenticated
    @Operation(summary = "Create a new order")
    public ResponseEntity<?> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
        return ResponseEntity.ok(orderService.createOrder(accountId, request));
    }

    @PostMapping("/from-cart")
    @Authenticated
    @Operation(summary = "Create order from cart")
    public ResponseEntity<?> createOrderFromCart(@Valid @RequestBody CreateOrderRequest request) {
        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
        return ResponseEntity.ok(orderService.createOrderFromCart(accountId, request));
    }

    @GetMapping("/my")
    @Authenticated
    @Operation(summary = "Get current user's orders")
    public ResponseEntity<?> getMyOrders(Pageable pageable) {
        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
        return ResponseEntity.ok(orderService.getOrdersByAccount(accountId, pageable));
    }

    @GetMapping("/{id}")
    @Authenticated
    @Operation(summary = "Get order by ID")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/code/{code}")
    @Authenticated
    @Operation(summary = "Get order by code")
    public ResponseEntity<?> getOrderByCode(@PathVariable String code) {
        return ResponseEntity.ok(orderService.getOrderByCode(code));
    }

    @DeleteMapping("/{id}")
    @Authenticated
    @Operation(summary = "Delete an order")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
        orderService.deleteOrder(id, accountId);
        return ResponseEntity.noContent().build();
    }

    // Staff/Admin endpoints
    @PutMapping("/{id}/status")
    @StaffOnly
    @Operation(summary = "Update order status (Staff)")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    @GetMapping("/all")
    @StaffOnly
    @Operation(summary = "Get all orders (Staff)")
    public ResponseEntity<?> getAllOrders(Pageable pageable) {
        return ResponseEntity.ok(orderService.getAllOrders(pageable));
    }
}
