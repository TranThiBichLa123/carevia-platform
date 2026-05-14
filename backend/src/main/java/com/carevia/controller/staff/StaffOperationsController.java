package com.carevia.controller.staff;

import com.carevia.service.StaffOperationsService;
import com.carevia.shared.annotation.StaffOnly;
import com.carevia.shared.annotation.StaffOrAdmin;
import com.carevia.shared.dto.request.device.CreateDeviceRequest;
import com.carevia.shared.dto.request.staff.AdjustInventoryRequest;
import com.carevia.shared.dto.request.staff.UpdateMaintenanceRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
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
    @StaffOnly
    @Operation(summary = "Get operational dashboard for staff")
    public ResponseEntity<?> getDashboard() {
        return ResponseEntity.ok(staffOperationsService.getDashboard());
    }

    @GetMapping("/devices")
    @StaffOnly
    @Operation(summary = "Get devices for staff inventory management")
    public ResponseEntity<?> getDevices(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) com.carevia.shared.constant.DeviceStatus status,
            @RequestParam(required = false) Boolean lowStockOnly,
            @RequestParam(required = false) Boolean maintenanceOnly,
            Pageable pageable) {
        return ResponseEntity.ok(staffOperationsService.getStaffDevices(search, status, lowStockOnly, maintenanceOnly, pageable));
    }

    @PostMapping("/devices")
    @StaffOrAdmin
    @Operation(summary = "Create a new device for staff inventory")
    public ResponseEntity<?> createDevice(@Valid @RequestBody CreateDeviceRequest request) {
        return ResponseEntity.ok(staffOperationsService.createDevice(request));
    }

    @PostMapping("/devices/{id}/inventory-adjustments")
    @StaffOnly
    @Operation(summary = "Adjust inventory for a device")
    public ResponseEntity<?> adjustInventory(
            @PathVariable Long id,
            @Valid @RequestBody AdjustInventoryRequest request) {
        return ResponseEntity.ok(staffOperationsService.adjustInventory(id, request));
    }

    @PutMapping("/devices/{id}/maintenance")
    @StaffOnly
    @Operation(summary = "Start or complete maintenance for a device")
    public ResponseEntity<?> updateMaintenance(
            @PathVariable Long id,
            @Valid @RequestBody UpdateMaintenanceRequest request) {
        return ResponseEntity.ok(staffOperationsService.updateMaintenance(id, request));
    }

    @GetMapping("/inventory-transactions")
    @StaffOnly
    @Operation(summary = "Get inventory transaction history")
    public ResponseEntity<?> getInventoryTransactions(
            @RequestParam(required = false) Long deviceId,
            Pageable pageable) {
        return ResponseEntity.ok(staffOperationsService.getInventoryTransactions(deviceId, pageable));
    }
}