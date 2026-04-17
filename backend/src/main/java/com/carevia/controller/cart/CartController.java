package com.carevia.controller.cart;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.carevia.service.CartService;
import com.carevia.shared.annotation.Authenticated;
import com.carevia.shared.exception.UnauthorizedException;
import com.carevia.shared.util.SecurityUtils;

@RestController
@RequestMapping("/api/v1/cart")
@Tag(name = "Cart", description = "Shopping cart APIs")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    @Authenticated
    @Operation(summary = "Get current user's cart")
    public ResponseEntity<?> getCart() {
        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
        return ResponseEntity.ok(cartService.getCart(accountId));
    }

    @PostMapping("/items")
    @Authenticated
    @Operation(summary = "Add item to cart")
    public ResponseEntity<?> addToCart(@RequestParam Long deviceId, @RequestParam(defaultValue = "1") int quantity) {
        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
        return ResponseEntity.ok(cartService.addToCart(accountId, deviceId, quantity));
    }

    @PutMapping("/items/{deviceId}")
    @Authenticated
    @Operation(summary = "Update cart item quantity")
    public ResponseEntity<?> updateQuantity(@PathVariable Long deviceId, @RequestParam int quantity) {
        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
        return ResponseEntity.ok(cartService.updateQuantity(accountId, deviceId, quantity));
    }

    @DeleteMapping("/items/{deviceId}")
    @Authenticated
    @Operation(summary = "Remove item from cart")
    public ResponseEntity<?> removeFromCart(@PathVariable Long deviceId) {
        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
        return ResponseEntity.ok(cartService.removeFromCart(accountId, deviceId));
    }

    @DeleteMapping("/clear")
    @Authenticated
    @Operation(summary = "Clear cart")
    public ResponseEntity<?> clearCart() {
        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
        return ResponseEntity.ok(cartService.clearCart(accountId));
    }
}
