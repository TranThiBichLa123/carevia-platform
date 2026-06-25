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
import com.carevia.service.RefundService;

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
    private final ClientRepository clientRepository;
    private final UserBehaviorRepository userBehaviorRepository;
    private final NotificationService notificationService;
    private final RefundService refundService;
    private final RefundRepository refundRepository;
    private final StaffBrandAccessService staffBrandAccessService;

    public OrderService(OrderRepository orderRepository, DeviceRepository deviceRepository,
            AccountRepository accountRepository, VoucherRepository voucherRepository,
            CartRepository cartRepository, ClientRepository clientRepository,
            UserBehaviorRepository userBehaviorRepository,
            NotificationService notificationService, RefundService refundService,
            RefundRepository refundRepository, StaffBrandAccessService staffBrandAccessService) {
        this.orderRepository = orderRepository;
        this.deviceRepository = deviceRepository;
        this.accountRepository = accountRepository;
        this.voucherRepository = voucherRepository;
        this.cartRepository = cartRepository;
        this.clientRepository = clientRepository;
        this.userBehaviorRepository = userBehaviorRepository;
        this.notificationService = notificationService;
        this.refundService = refundService;
        this.refundRepository = refundRepository;
        this.staffBrandAccessService = staffBrandAccessService;
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
        return toAuthorizedResponse(order);
    }

    public OrderResponse getOrderByCode(String code) {
        Order order = orderRepository.findByOrderCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        return toAuthorizedResponse(order);
    }

    // Staff operations
    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        staffBrandAccessService.requireManageableOrderForMutation(order);

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
            case "SHIPPING" -> {
                // Nếu trong Class Order của bạn có hàm order.ship() hoặc tương tự thì gọi ở đây
                // Ví dụ: order.setStatus(OrderStatus.SHIPPING);
                notificationService.createOrderNotification(order.getAccount(), order, "ORDER_SHIPPING");
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
    public OrderResponse cancelOrderByUser(Long orderId, Long accountId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getAccount().getId().equals(accountId)) {
            throw new InvalidRequestException("Cannot cancel another user's order");
        }
        // Precondition check is inside order.cancel(reason) — throws
        // InvalidStatusException if not allowed
        order.cancel(reason);
        Order saved = orderRepository.save(order);
        // Auto-create refund if order was paid
        refundService.createOrderCancelRefund(saved);
        notificationService.createOrderNotification(saved.getAccount(), saved, "ORDER_CANCELLED");
        return toResponse(saved);
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
        Long scopedBrandId = staffBrandAccessService.getScopedBrandIdOrNull();
        Page<Order> page = orderRepository.findAll((root, query, cb) -> {
            query.distinct(true);
            if (scopedBrandId == null) {
                return cb.conjunction();
            }
            return cb.equal(root.join("items").join("device").get("brand").get("id"), scopedBrandId);
        }, pageable);
        return toPageResponse(page, scopedBrandId);
    }

    @Transactional
    public void confirmZaloPayPayment(Long orderId, String zpTransId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (order.getStatus() == com.carevia.shared.constant.OrderStatus.PENDING_PAYMENT) {
            order.markPaid(zpTransId);
            for (OrderItem item : order.getItems()) {
                item.getDevice().incrementSold(item.getQuantity());
                deviceRepository.save(item.getDevice());
            }
            orderRepository.save(order);
            notificationService.createOrderNotification(order.getAccount(), order, "ORDER_PAID");
        }
    }

    private OrderResponse toResponse(Order o) {
        return toResponse(o, null);
    }

    private OrderResponse toResponse(Order o, Long scopedBrandId) {
        List<OrderItem> visibleItems = scopedBrandId == null
                ? o.getItems()
                : o.getItems().stream()
                        .filter(item -> item.getDevice() != null
                                && item.getDevice().getBrand() != null
                                && scopedBrandId.equals(item.getDevice().getBrand().getId()))
                        .toList();

        BigDecimal scopedSubtotal = visibleItems.stream()
                .map(OrderItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Client client = clientRepository.findByAccount(o.getAccount()).orElse(null);
        String customerName = client != null && client.getFullName() != null && !client.getFullName().isBlank()
                ? client.getFullName()
                : o.getReceiverName();
        String customerPhone = client != null && client.getPhone() != null && !client.getPhone().isBlank()
                ? client.getPhone()
                : o.getReceiverPhone();

        return OrderResponse.builder()
                .id(o.getId())
                .orderCode(o.getOrderCode())
                .accountId(o.getAccount().getId())
                .customerName(customerName)
                .customerPhone(customerPhone)
                .items(visibleItems.stream().map(i -> OrderResponse.OrderItemInfo.builder()
                        .id(i.getId())
                        .deviceId(i.getDevice().getId())
                        .deviceName(i.getDevice().getName())
                        .deviceImage(i.getDevice().getImage())
                        .quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice())
                        .subtotal(i.getSubtotal())
                        .build()).collect(Collectors.toList()))
                .subtotal(scopedBrandId == null ? o.getSubtotal() : scopedSubtotal)
                .discountAmount(scopedBrandId == null ? o.getDiscountAmount() : BigDecimal.ZERO)
                .shippingFee(scopedBrandId == null ? o.getShippingFee() : BigDecimal.ZERO)
                .taxAmount(scopedBrandId == null ? o.getTaxAmount() : BigDecimal.ZERO)
                .totalAmount(scopedBrandId == null ? o.getTotalAmount() : scopedSubtotal)
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
                .cancelReason(o.getCancelReason())
                .refundStatus(refundRepository.findTopByOrderIdOrderByRequestedAtDesc(o.getId())
                        .map(Refund::getStatus).orElse(null))
                .createdAt(o.getCreatedAt())
                .build();
    }

    private PageResponse<OrderResponse> toPageResponse(Page<Order> page) {
        return toPageResponse(page, null);
    }

    private PageResponse<OrderResponse> toPageResponse(Page<Order> page, Long scopedBrandId) {
        return PageResponse.<OrderResponse>builder()
                .items(page.getContent().stream().map(order -> toResponse(order, scopedBrandId))
                        .collect(Collectors.toList()))
                .page(page.getNumber())
                .size(page.getSize())
                .totalItems(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }

    private OrderResponse toAuthorizedResponse(Order order) {
        Long currentUserId = com.carevia.shared.util.SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new ResourceNotFoundException("User not authenticated"));
        Account currentAccount = accountRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        if (currentAccount.isAdmin()) {
            return toResponse(order);
        }

        if (currentAccount.isStaff()) {
            if (!staffBrandAccessService.canViewOrder(order)) {
                throw new InvalidRequestException("You can only view orders containing your own brand devices");
            }
            return toResponse(order, staffBrandAccessService.requireCurrentStaffBrand().getId());
        }

        if (!order.getAccount().getId().equals(currentAccount.getId())) {
            throw new InvalidRequestException("Cannot view another user's order");
        }

        return toResponse(order);
    }
}
