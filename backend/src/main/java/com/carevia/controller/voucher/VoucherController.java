package com.carevia.controller.voucher;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.carevia.service.VoucherService;
import com.carevia.shared.annotation.AdminOnly;
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

    // Admin endpoints
    @GetMapping
    @AdminOnly
    @Operation(summary = "Get all vouchers (Admin)")
    public ResponseEntity<?> getAllVouchers() {
        return ResponseEntity.ok(voucherService.getAllVouchers());
    }

    @PostMapping
    @AdminOnly
    @Operation(summary = "Create voucher (Admin)")
    public ResponseEntity<?> createVoucher(@Valid @RequestBody CreateVoucherRequest request) {
        return ResponseEntity.ok(voucherService.createVoucher(request));
    }

    @PutMapping("/{id}/status")
    @AdminOnly
    @Operation(summary = "Update voucher status (Admin)")
    public ResponseEntity<?> updateVoucherStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(voucherService.updateVoucherStatus(id, status));
    }
}
