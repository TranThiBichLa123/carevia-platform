package com.carevia.controller.order;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.carevia.core.domain.Account;
import com.carevia.core.repository.AccountRepository;
import com.carevia.service.RefundService;
import com.carevia.shared.annotation.AdminOnly;
import com.carevia.shared.annotation.Authenticated;
import com.carevia.shared.exception.ResourceNotFoundException;
import com.carevia.shared.exception.UnauthorizedException;
import com.carevia.shared.util.SecurityUtils;

@RestController
@RequestMapping("/api/v1/refunds")
@Tag(name = "Refunds", description = "Refund and return management APIs")
public class RefundController {

    private final RefundService refundService;
    private final AccountRepository accountRepository;

    public RefundController(RefundService refundService, AccountRepository accountRepository) {
        this.refundService = refundService;
        this.accountRepository = accountRepository;
    }

    @GetMapping("/my")
    @Authenticated
    @Operation(summary = "Get current user's refund list")
    public ResponseEntity<?> getMyRefunds() {
        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
        return ResponseEntity.ok(refundService.getUserRefunds(accountId));
    }

    @GetMapping("/order/{orderId}")
    @Authenticated
    @Operation(summary = "Get refunds for a specific order")
    public ResponseEntity<?> getRefundsByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(refundService.getRefundsByOrder(orderId));
    }

    @GetMapping("/booking/{bookingId}")
    @Authenticated
    @Operation(summary = "Get refunds for a specific booking")
    public ResponseEntity<?> getRefundsByBooking(@PathVariable Long bookingId) {
        return ResponseEntity.ok(refundService.getRefundsByBooking(bookingId));
    }

    @PostMapping("/order/{orderId}/return")
    @Authenticated
    @Operation(summary = "Request a return for a completed order")
    public ResponseEntity<?> requestReturn(@PathVariable Long orderId,
                                           @RequestParam(required = false, defaultValue = "") String reason) {
        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
        return ResponseEntity.ok(refundService.requestOrderReturn(orderId, accountId, reason));
    }

    // ---- Admin endpoints ----

    @GetMapping
    @AdminOnly
    @Operation(summary = "Get all refunds (admin)")
    public ResponseEntity<?> getAllRefunds() {
        return ResponseEntity.ok(refundService.getAllRefunds());
    }

    @PutMapping("/{id}/approve")
    @AdminOnly
    @Operation(summary = "Approve a refund (admin)")
    public ResponseEntity<?> approveRefund(@PathVariable Long id) {
        Long adminId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));
        Account admin = accountRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin account not found"));
        return ResponseEntity.ok(refundService.approveRefund(id, admin));
    }

    @PutMapping("/{id}/success")
    @AdminOnly
    @Operation(summary = "Mark refund as successfully processed (admin)")
    public ResponseEntity<?> markSuccess(@PathVariable Long id) {
        return ResponseEntity.ok(refundService.markRefundSuccess(id));
    }

    @PutMapping("/{id}/failed")
    @AdminOnly
    @Operation(summary = "Mark refund as failed (admin)")
    public ResponseEntity<?> markFailed(@PathVariable Long id,
                                        @RequestParam(required = false, defaultValue = "") String reason) {
        return ResponseEntity.ok(refundService.markRefundFailed(id, reason));
    }
}
