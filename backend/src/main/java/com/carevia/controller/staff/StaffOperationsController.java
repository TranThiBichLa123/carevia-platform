package com.carevia.controller.staff;

import com.carevia.service.StaffOperationsService;
import com.carevia.shared.annotation.StaffOnly;
import com.carevia.shared.annotation.StaffOrAdmin;
import com.carevia.shared.dto.request.device.CreateDeviceRequest;
import com.carevia.shared.dto.request.device.UpdateDeviceRequest;
import com.carevia.shared.dto.request.staff.AdjustInventoryRequest;
import com.carevia.shared.dto.request.staff.UpdateMaintenanceRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/staff")
@Tag(name = "Staff Operations", description = "Operational APIs for staff dashboard, inventory, and maintenance")
public class StaffOperationsController {

    private final StaffOperationsService staffOperationsService;

    public StaffOperationsController(StaffOperationsService staffOperationsService) {
        this.staffOperationsService = staffOperationsService;
    }

    @GetMapping("/dashboard")
    @StaffOrAdmin
    @Operation(summary = "Get operational dashboard for staff")
    public ResponseEntity<?> getDashboard() {
        return ResponseEntity.ok(staffOperationsService.getDashboard());
    }

    @GetMapping("/devices")
    @StaffOrAdmin
    @Operation(summary = "Get devices for staff inventory management")
    public ResponseEntity<?> getDevices(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) com.carevia.shared.constant.DeviceStatus status,
            @RequestParam(required = false) Boolean lowStockOnly,
            @RequestParam(required = false) Boolean maintenanceOnly,
            Pageable pageable) {
        return ResponseEntity.ok(staffOperationsService.getStaffDevices(search, status, lowStockOnly, maintenanceOnly, pageable));
    }

    @GetMapping("/device-categories")
    @StaffOrAdmin
    @Operation(summary = "Get device categories for staff operations")
    public ResponseEntity<?> getDeviceCategories() {
        return ResponseEntity.ok(staffOperationsService.getDeviceCategories());
    }

    @GetMapping("/device-brands")
    @StaffOrAdmin
    @Operation(summary = "Get device brands for staff operations")
    public ResponseEntity<?> getDeviceBrands() {
        return ResponseEntity.ok(staffOperationsService.getDeviceBrands());
    }

    @GetMapping("/vouchers")
    @StaffOrAdmin
    @Operation(summary = "Get vouchers for staff operations")
    public ResponseEntity<?> getVouchers() {
        return ResponseEntity.ok(staffOperationsService.getVouchers());
    }

    @PostMapping("/devices")
    @StaffOrAdmin
    @Operation(summary = "Create a new device for staff inventory")
    public ResponseEntity<?> createDevice(@Valid @RequestBody CreateDeviceRequest request) {
        return ResponseEntity.ok(staffOperationsService.createDevice(request));
    }

    @PutMapping("/devices/{id}")
    @StaffOrAdmin
    @Operation(summary = "Update a device for staff operations")
    public ResponseEntity<?> updateDevice(
            @PathVariable Long id,
            @Valid @RequestBody UpdateDeviceRequest request) {
        return ResponseEntity.ok(staffOperationsService.updateDevice(id, request));
    }

    @DeleteMapping("/devices/{id}")
    @StaffOrAdmin
    @Operation(summary = "Soft delete a device for staff operations")
    public ResponseEntity<Void> deleteDevice(@PathVariable Long id) {
        staffOperationsService.deleteDevice(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/devices/{deviceId}/vouchers/{voucherId}")
    @StaffOrAdmin
    @Operation(summary = "Assign a voucher to a device")
    public ResponseEntity<?> assignVoucherToDevice(
            @PathVariable Long deviceId,
            @PathVariable Long voucherId) {
        return ResponseEntity.ok(staffOperationsService.assignVoucherToDevice(deviceId, voucherId));
    }

    @DeleteMapping("/devices/{deviceId}/vouchers/{voucherId}")
    @StaffOrAdmin
    @Operation(summary = "Remove a voucher from a device")
    public ResponseEntity<?> removeVoucherFromDevice(
            @PathVariable Long deviceId,
            @PathVariable Long voucherId) {
        return ResponseEntity.ok(staffOperationsService.removeVoucherFromDevice(deviceId, voucherId));
    }

    @PostMapping("/devices/{id}/inventory-adjustments")
    @StaffOrAdmin
    @Operation(summary = "Adjust inventory for a device")
    public ResponseEntity<?> adjustInventory(
            @PathVariable Long id,
            @Valid @RequestBody AdjustInventoryRequest request) {
        return ResponseEntity.ok(staffOperationsService.adjustInventory(id, request));
    }

    @PutMapping("/devices/{id}/maintenance")
    @StaffOrAdmin
    @Operation(summary = "Start or complete maintenance for a device")
    public ResponseEntity<?> updateMaintenance(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMaintenanceRequest request) {
        return ResponseEntity.ok(staffOperationsService.updateMaintenance(id, request));
    }

    @GetMapping("/inventory-transactions")
    @StaffOrAdmin
    @Operation(summary = "Get inventory transaction history")
    public ResponseEntity<?> getInventoryTransactions(
            @RequestParam(required = false) Long deviceId,
            Pageable pageable) {
        return ResponseEntity.ok(staffOperationsService.getInventoryTransactions(deviceId, pageable));
    }
}