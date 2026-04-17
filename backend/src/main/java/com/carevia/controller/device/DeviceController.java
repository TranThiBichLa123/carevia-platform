package com.carevia.controller.device;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.carevia.service.DeviceService;
import com.carevia.service.UserBehaviorService;
import com.carevia.shared.annotation.AdminOnly;
import com.carevia.shared.annotation.Authenticated;
import com.carevia.shared.constant.BehaviorType;
import com.carevia.shared.dto.request.device.CreateDeviceRequest;
import com.carevia.shared.dto.request.device.UpdateDeviceRequest;
import com.carevia.shared.dto.response.device.DeviceResponse;
import com.carevia.shared.util.SecurityUtils;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/devices")
@Tag(name = "Devices", description = "Device management APIs")
public class DeviceController {

    private final DeviceService deviceService;
    private final UserBehaviorService userBehaviorService;

    public DeviceController(DeviceService deviceService, UserBehaviorService userBehaviorService) {
        this.deviceService = deviceService;
        this.userBehaviorService = userBehaviorService;
    }

    @GetMapping
    @Operation(summary = "Get all devices with pagination and search")
    public ResponseEntity<?> getAllDevices(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "brandId", required = false) Long brandId,
            @RequestParam(value = "skinType", required = false) String skinType,
            Pageable pageable) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(deviceService.searchDevices(search, pageable));
        } else if (categoryId != null) {
            return ResponseEntity.ok(deviceService.getDevicesByCategory(categoryId, pageable));
        } else if (brandId != null) {
            return ResponseEntity.ok(deviceService.getDevicesByBrand(brandId, pageable));
        }
        return ResponseEntity.ok(deviceService.getAllDevices(pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get device by ID")
    public ResponseEntity<DeviceResponse> getDeviceById(@PathVariable("id") Long id) {
        DeviceResponse device = deviceService.getDeviceById(id);
        // Track view behavior
        SecurityUtils.getCurrentUserId()
                .ifPresent(userId -> userBehaviorService.trackBehavior(userId, id, BehaviorType.VIEW, null));
        return ResponseEntity.ok(device);
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get device by slug")
    public ResponseEntity<DeviceResponse> getDeviceBySlug(@PathVariable("slug") String slug) {
        return ResponseEntity.ok(deviceService.getDeviceBySlug(slug));
    }

    @GetMapping("/popular")
    @Operation(summary = "Get popular devices")
    public ResponseEntity<?> getPopularDevices(@RequestParam(value = "limit", defaultValue = "8") int limit) {
        return ResponseEntity.ok(deviceService.getPopularDevices(limit));
    }

    @GetMapping("/{id}/similar")
    @Operation(summary = "Get similar devices")
    public ResponseEntity<?> getSimilarDevices(@PathVariable("id") Long id, 
        @RequestParam(value = "limit", defaultValue = "4") int limit) {
        return ResponseEntity.ok(deviceService.getSimilarDevices(id, limit));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get all categories")
    public ResponseEntity<?> getCategories() {
        return ResponseEntity.ok(deviceService.getAllCategories());
    }

    @GetMapping("/brands")
    @Operation(summary = "Get all brands")
    public ResponseEntity<?> getBrands() {
        return ResponseEntity.ok(deviceService.getAllBrands());
    }

    @GetMapping("/brands/featured")
    @Operation(summary = "Get featured brands")
    public ResponseEntity<?> getFeaturedBrands() {
        return ResponseEntity.ok(deviceService.getFeaturedBrands());
    }

    // Admin endpoints
    @PostMapping
    @AdminOnly
    @Operation(summary = "Create a new device (Admin)")
    public ResponseEntity<DeviceResponse> createDevice(@Valid @RequestBody CreateDeviceRequest request) {
        return ResponseEntity.ok(deviceService.createDevice(request));
    }

    @PutMapping("/{id}")
    @AdminOnly
    @Operation(summary = "Update a device (Admin)")
    public ResponseEntity<DeviceResponse> updateDevice( @PathVariable("id") Long id, 
        @Valid @RequestBody UpdateDeviceRequest request) {
        return ResponseEntity.ok(deviceService.updateDevice(id, request));
    }

    @DeleteMapping("/{id}")
    @AdminOnly
    @Operation(summary = "Delete a device (Admin)")
    public ResponseEntity<Void> deleteDevice(@PathVariable("id") Long id) {
        deviceService.deleteDevice(id);
        return ResponseEntity.noContent().build();
    }
}
