package com.carevia.controller.order;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.carevia.service.ZaloPayService;
import com.carevia.shared.annotation.Authenticated;
import com.carevia.shared.exception.UnauthorizedException;
import com.carevia.shared.util.SecurityUtils;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Payment APIs")
public class PaymentController {

    private final ZaloPayService zaloPayService;

    /**
     * Create a ZaloPay payment order for an existing order.
     * Expects JSON body: { "orderId": 123, "redirectUrl": "http://..." }
     */
    @PostMapping("/zalopay/create")
    @Authenticated
    @Operation(summary = "Create ZaloPay payment URL for an order")
    public ResponseEntity<?> createZaloPayOrder(@RequestBody Map<String, Object> request) {
        Long orderId = Long.parseLong(request.get("orderId").toString());
        String redirectUrl = request.containsKey("redirectUrl") ? (String) request.get("redirectUrl") : null;

        Long accountId = SecurityUtils.getCurrentUserId()
                .orElseThrow(() -> new UnauthorizedException("Authentication required"));

        try {
            Map<String, Object> result = zaloPayService.createZaloPayOrder(orderId, accountId, redirectUrl);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            return ResponseEntity.badRequest().body(Map.of("message", msg));
        }
    }

    /**
     * ZaloPay server-to-server callback.
     * Called by ZaloPay when a payment is completed.
     * Must be publicly accessible (no JWT required).
     */
    @PostMapping("/zalopay/callback")
    @Operation(summary = "ZaloPay payment callback (webhook)")
    public ResponseEntity<?> zaloPayCallback(@RequestBody Map<String, Object> callbackData) {
        Map<String, Object> result = zaloPayService.handleCallback(callbackData);
        return ResponseEntity.ok(result);
    }

    /**
     * Verify ZaloPay payment status by querying ZaloPay API directly.
     * Used as fallback when server-to-server callback cannot reach the server (e.g. localhost dev).
     */
    @GetMapping("/zalopay/verify/{orderId}")
    @Authenticated
    @Operation(summary = "Verify ZaloPay payment status for an order")
    public ResponseEntity<?> verifyZaloPayPayment(@PathVariable Long orderId) {
        try {
            Map<String, Object> result = zaloPayService.verifyAndConfirmPayment(orderId);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            String msg = e.getMessage() != null ? e.getMessage() : e.getClass().getSimpleName();
            return ResponseEntity.badRequest().body(Map.of("message", msg));
        }
    }
}
