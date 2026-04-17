package com.carevia.controller.wishlist;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.carevia.service.WishlistService;
import com.carevia.shared.annotation.Authenticated;
import com.carevia.shared.exception.UnauthorizedException;
import com.carevia.shared.util.SecurityUtils;

@RestController
@RequestMapping("/api/v1/wishlist")
@Tag(name = "Wishlist", description = "Wishlist APIs")
public class WishlistController {

    private final WishlistService wishlistService;

    public WishlistController(WishlistService wishlistService) {
        this.wishlistService = wishlistService;
    }

    @GetMapping
    @Authenticated
    @Operation(summary = "Get wishlist devices")
    public ResponseEntity<?> getWishlist() {
        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
        return ResponseEntity.ok(wishlistService.getWishlistDevices(accountId));
    }

    @GetMapping("/ids")
    @Authenticated
    @Operation(summary = "Get wishlist device IDs")
    public ResponseEntity<?> getWishlistIds() {
        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
        return ResponseEntity.ok(wishlistService.getWishlistDeviceIds(accountId));
    }

    @PostMapping("/{deviceId}")
    @Authenticated
    @Operation(summary = "Add device to wishlist")
    public ResponseEntity<?> addToWishlist(@PathVariable Long deviceId) {
        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
        wishlistService.addToWishlist(accountId, deviceId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{deviceId}")
    @Authenticated
    @Operation(summary = "Remove device from wishlist")
    public ResponseEntity<?> removeFromWishlist(@PathVariable Long deviceId) {
        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
        wishlistService.removeFromWishlist(accountId, deviceId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check/{deviceId}")
    @Authenticated
    @Operation(summary = "Check if device is in wishlist")
    public ResponseEntity<Boolean> isInWishlist(@PathVariable Long deviceId) {
        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
        return ResponseEntity.ok(wishlistService.isInWishlist(accountId, deviceId));
    }
}
