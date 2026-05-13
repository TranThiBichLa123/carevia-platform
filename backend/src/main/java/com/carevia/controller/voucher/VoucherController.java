package com.carevia.controller.voucher;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.carevia.service.VoucherService;
import com.carevia.shared.annotation.StaffOrAdmin;
import com.carevia.shared.dto.request.voucher.CreateVoucherRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/vouchers")
@Tag(name = "Vouchers", description = "Voucher management APIs")
public class VoucherController {

    private final VoucherService voucherService;

    public VoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    @GetMapping("/active")
    @Operation(summary = "Get active vouchers")
    public ResponseEntity<?> getActiveVouchers() {
        return ResponseEntity.ok(voucherService.getActiveVouchers());
    }

    @GetMapping("/code/{code}")
    @Operation(summary = "Get voucher by code")
    public ResponseEntity<?> getVoucherByCode(@PathVariable String code) {
        return ResponseEntity.ok(voucherService.getVoucherByCode(code));
    }

    @GetMapping("/device/{deviceId}")
    @Operation(summary = "Get vouchers for a device")
    public ResponseEntity<?> getVouchersForDevice(@PathVariable Long deviceId) {
        return ResponseEntity.ok(voucherService.getVouchersForDevice(deviceId));
    }

    // Staff/Admin endpoints
    @GetMapping
    @StaffOrAdmin
    @Operation(summary = "Get all vouchers (Staff/Admin)")
    public ResponseEntity<?> getAllVouchers() {
        return ResponseEntity.ok(voucherService.getAllVouchers());
    }

    @PostMapping
    @StaffOrAdmin
    @Operation(summary = "Create voucher (Staff/Admin)")
    public ResponseEntity<?> createVoucher(@Valid @RequestBody CreateVoucherRequest request) {
        return ResponseEntity.ok(voucherService.createVoucher(request));
    }

    @PutMapping("/{id}/status")
    @StaffOrAdmin
    @Operation(summary = "Update voucher status (Staff/Admin)")
    public ResponseEntity<?> updateVoucherStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(voucherService.updateVoucherStatus(id, status));
    }
}
