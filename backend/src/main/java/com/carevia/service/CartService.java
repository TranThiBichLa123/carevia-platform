package com.carevia.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.carevia.core.domain.*;
import com.carevia.core.repository.*;
import com.carevia.shared.dto.response.cart.CartResponse;
import com.carevia.shared.exception.ResourceNotFoundException;

import java.math.BigDecimal;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final DeviceRepository deviceRepository;
    private final AccountRepository accountRepository;

    public CartService(CartRepository cartRepository, DeviceRepository deviceRepository,
                       AccountRepository accountRepository) {
        this.cartRepository = cartRepository;
        this.deviceRepository = deviceRepository;
        this.accountRepository = accountRepository;
    }

    public CartResponse getCart(Long accountId) {
        Cart cart = getOrCreateCart(accountId);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse addToCart(Long accountId, Long deviceId, int quantity) {
        Cart cart = getOrCreateCart(accountId);
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device not found"));
        cart.addItem(device, quantity);
        cart = cartRepository.save(cart);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse removeFromCart(Long accountId, Long deviceId) {
        Cart cart = getOrCreateCart(accountId);
        cart.removeItem(deviceId);
        cart = cartRepository.save(cart);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse updateQuantity(Long accountId, Long deviceId, int quantity) {
        Cart cart = getOrCreateCart(accountId);
        if (quantity <= 0) {
            cart.removeItem(deviceId);
        } else {
            cart.updateItemQuantity(deviceId, quantity);
        }
        cart = cartRepository.save(cart);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse clearCart(Long accountId) {
        Cart cart = getOrCreateCart(accountId);
        cart.clear();
        cart = cartRepository.save(cart);
        return toResponse(cart);
    }

    private Cart getOrCreateCart(Long accountId) {
        return cartRepository.findByAccountId(accountId)
                .orElseGet(() -> {
                    Account account = accountRepository.findById(accountId)
                            .orElseThrow(() -> new ResourceNotFoundException("Account not found"));
                    Cart newCart = Cart.builder().account(account).build();
                    return cartRepository.save(newCart);
                });
    }

    private CartResponse toResponse(Cart cart) {
        var items = cart.getItems().stream().map(ci -> CartResponse.CartItemInfo.builder()
                .id(ci.getId())
                .deviceId(ci.getDevice().getId())
                .deviceName(ci.getDevice().getName())
                .deviceImage(ci.getDevice().getImage())
                .devicePrice(ci.getDevice().getPrice())
                .originalPrice(ci.getDevice().getOriginalPrice())
                .discountPercentage(ci.getDevice().getDiscountPercentage())
                .stock(ci.getDevice().getStock())
                .quantity(ci.getQuantity())
                .subtotal(ci.getDevice().getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())))
                .build()).collect(Collectors.toList());

        BigDecimal total = items.stream()
                .map(CartResponse.CartItemInfo::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .id(cart.getId())
                .items(items)
                .totalAmount(total)
                .totalItems(items.size())
                .build();
    }
}
