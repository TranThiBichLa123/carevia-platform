package com.carevia.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.carevia.core.domain.*;
import com.carevia.core.repository.*;
import com.carevia.shared.constant.BehaviorType;
import com.carevia.shared.dto.PageResponse;
import com.carevia.shared.dto.request.order.CreateOrderRequest;
import com.carevia.shared.dto.response.order.OrderResponse;
import com.carevia.shared.exception.InvalidRequestException;
import com.carevia.shared.exception.ResourceNotFoundException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final DeviceRepository deviceRepository;
    private final AccountRepository accountRepository;
    private final VoucherRepository voucherRepository;
    private final CartRepository cartRepository;
    private final UserBehaviorRepository userBehaviorRepository;
    private final NotificationService notificationService;

    public OrderService(OrderRepository orderRepository, DeviceRepository deviceRepository,
            AccountRepository accountRepository, VoucherRepository voucherRepository,
            CartRepository cartRepository, UserBehaviorRepository userBehaviorRepository,
            NotificationService notificationService) {
        this.orderRepository = orderRepository;
        this.deviceRepository = deviceRepository;
        this.accountRepository = accountRepository;
        this.voucherRepository = voucherRepository;
        this.cartRepository = cartRepository;
        this.userBehaviorRepository = userBehaviorRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public OrderResponse createOrder(Long accountId, CreateOrderRequest request) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        Order order = Order.builder()
                .orderCode("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                .account(account)
                .shippingAddress(request.getShippingAddress())
                .shippingCity(request.getShippingCity())
                .shippingCountry(request.getShippingCountry())
                .shippingPostalCode(request.getShippingPostalCode())
                .paymentMethod(request.getPaymentMethod() != null ? request.getPaymentMethod() : "STRIPE")
                .customerNote(request.getCustomerNote())
                .items(new ArrayList<>())
                .build();

        for (CreateOrderRequest.OrderItemRequest itemReq : request.getItems()) {
            Device device = deviceRepository.findById(itemReq.getDeviceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Device not found: " + itemReq.getDeviceId()));

            // ... kiểm tra kho (stock) giữ nguyên ...

            OrderItem orderItem = OrderItem.builder()
                    .device(device)
                    .quantity(itemReq.getQuantity())
                    .unitPrice(device.getPrice())
                    // Đổi .subtotal thành .totalPrice
                    .totalPrice(device.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity())))
                    .build();
            order.addItem(orderItem);

            // FIX LỖI TẠI ĐÂY:
            userBehaviorRepository.save(UserBehavior.builder()
                    .account(account)
                    .targetType("DEVICE") // Xác định loại đối tượng là thiết bị
                    .targetId(device.getId()) // Lưu ID thiết bị
                    .actionType("PURCHASE") // Sử dụng actionType thay vì behaviorType
                    .build());
        }

        order.calculateTotals();

        // Apply voucher
        if (request.getVoucherCode() != null && !request.getVoucherCode().isBlank()) {
            Voucher voucher = voucherRepository.findByCode(request.getVoucherCode())
                    .orElseThrow(() -> new ResourceNotFoundException("Voucher not found"));
            if (!voucher.isValid()) {
                throw new InvalidRequestException("Voucher is not valid");
            }
            BigDecimal discount = voucher.calculateDiscount(order.getSubtotal());
            order.setDiscountAmount(discount);
            order.setVoucher(voucher);
            order.setTotalAmount(order.getSubtotal().subtract(discount).add(order.getShippingFee()));
        }

        order = orderRepository.save(order);
        notificationService.createOrderNotification(account, order, "ORDER_CREATED");
        return toResponse(order);
    }

    @Transactional
    public OrderResponse createOrderFromCart(Long accountId, CreateOrderRequest request) {
        Cart cart = cartRepository.findByAccountId(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

        if (cart.getItems().isEmpty()) {
            throw new InvalidRequestException("Cart is empty");
        }

        // Convert cart items to order items
        List<CreateOrderRequest.OrderItemRequest> items = cart.getItems().stream()
                .map(ci -> {
                    CreateOrderRequest.OrderItemRequest item = new CreateOrderRequest.OrderItemRequest();
                    item.setDeviceId(ci.getDevice().getId());
                    item.setQuantity(ci.getQuantity());
                    return item;
                }).collect(Collectors.toList());

        request.setItems(items);
        OrderResponse response = createOrder(accountId, request);

        // Clear cart after order
        cart.clear();
        cartRepository.save(cart);

        return response;
    }

    public PageResponse<OrderResponse> getOrdersByAccount(Long accountId, Pageable pageable) {
        Page<Order> page = orderRepository.findByAccountId(accountId, pageable);
        return toPageResponse(page);
    }

    public OrderResponse getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return toResponse(order);
    }

    public OrderResponse getOrderByCode(String code) {
        Order order = orderRepository.findByOrderCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return toResponse(order);
    }

    // Staff operations
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        switch (status.toUpperCase()) {
            case "PAID" -> {
                order.markPaid("TXN-" + UUID.randomUUID().toString().substring(0, 8));
                // Update device stock
                for (OrderItem item : order.getItems()) {
                    item.getDevice().incrementSold(item.getQuantity());
                    deviceRepository.save(item.getDevice());
                }
                notificationService.createOrderNotification(order.getAccount(), order, "ORDER_PAID");
            }
            case "PROCESSING" -> {
                order.process();
                notificationService.createOrderNotification(order.getAccount(), order, "ORDER_PROCESSING");
            }
            case "COMPLETED" -> {
                order.complete();
                notificationService.createOrderNotification(order.getAccount(), order, "ORDER_COMPLETED");
            }
            case "CANCELLED" -> {
                order.cancel();
                notificationService.createOrderNotification(order.getAccount(), order, "ORDER_CANCELLED");
            }
            case "FAILED" -> order.failPayment();
            default -> throw new InvalidRequestException("Invalid status: " + status);
        }

        return toResponse(orderRepository.save(order));
    }

    @Transactional
    public void deleteOrder(Long orderId, Long accountId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getAccount().getId().equals(accountId)) {
            throw new InvalidRequestException("Cannot delete another user's order");
        }
        orderRepository.delete(order);
    }

    public PageResponse<OrderResponse> getAllOrders(Pageable pageable) {
        Page<Order> page = orderRepository.findAll(pageable);
        return toPageResponse(page);
    }

    private OrderResponse toResponse(Order o) {
        return OrderResponse.builder()
                .id(o.getId())
                .orderCode(o.getOrderCode())
                .accountId(o.getAccount().getId())
                .items(o.getItems().stream().map(i -> OrderResponse.OrderItemInfo.builder()
                        .id(i.getId())
                        .deviceId(i.getDevice().getId())
                        .deviceName(i.getDevice().getName())
                        .deviceImage(i.getDevice().getImage())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .subtotal(i.getSubtotal())
                        .build()).collect(Collectors.toList()))
                .subtotal(o.getSubtotal())
                .discountAmount(o.getDiscountAmount())
                .shippingFee(o.getShippingFee())
                .taxAmount(o.getTaxAmount())
                .totalAmount(o.getTotalAmount())
                .status(o.getStatus())
                .paymentStatus(o.getPaymentStatus())
                .paymentMethod(o.getPaymentMethod())
                .paymentTransactionId(o.getPaymentTransactionId())
                .voucherCode(o.getVoucher() != null ? o.getVoucher().getCode() : null)
                .shippingAddress(o.getShippingAddress())
                .shippingCity(o.getShippingCity())
                .shippingCountry(o.getShippingCountry())
                .shippingPostalCode(o.getShippingPostalCode())
                .customerNote(o.getCustomerNote())
                .createdAt(o.getCreatedAt())
                .build();
    }

    private PageResponse<OrderResponse> toPageResponse(Page<Order> page) {
        return PageResponse.<OrderResponse>builder()
                .items(page.getContent().stream().map(this::toResponse).collect(Collectors.toList()))
                .page(page.getNumber())
                .size(page.getSize())
                .totalItems(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}
