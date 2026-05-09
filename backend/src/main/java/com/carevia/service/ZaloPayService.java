package com.carevia.service;

import com.carevia.config.gateway.ZaloPayConfig;
import com.carevia.core.domain.Order;
import com.carevia.core.domain.PaymentTransaction;
import com.carevia.core.repository.OrderRepository;
import com.carevia.core.repository.PaymentTransactionRepository;
import com.carevia.shared.constant.PaymentMethod;
import com.carevia.shared.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ZaloPayService {

    private final ZaloPayConfig config;
    private final OrderRepository orderRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final OrderService orderService;
    private final ObjectMapper objectMapper;

    private static final String HMAC_SHA256 = "HmacSHA256";

    // ----------------------------------------------------------------
    // HMAC-SHA256 helper
    // ----------------------------------------------------------------
    private String computeHmac(String data, String key) throws Exception {
        Mac mac = Mac.getInstance(HMAC_SHA256);
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
        mac.init(secretKey);
        byte[] bytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder();
        for (byte b : bytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    // ----------------------------------------------------------------
    // Load order data within a short transaction (no lazy init issues)
    // ----------------------------------------------------------------
    @Transactional(readOnly = true)
    public ZaloPayOrderData loadOrderData(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (order.getTotalAmount() == null) {
            throw new RuntimeException("Order totalAmount is null for orderId=" + orderId);
        }

        // Force-load lazy collections while still in session
        List<Map<String, Object>> itemsList = new ArrayList<>();
        for (var item : order.getItems()) {
            Map<String, Object> itemMap = new LinkedHashMap<>();
            String itemId   = item.getDevice() != null ? String.valueOf(item.getDevice().getId())
                            : (item.getService() != null ? "svc-" + item.getService().getId() : "unknown");
            String itemName = item.getDevice() != null ? item.getDevice().getName()
                            : (item.getService() != null ? item.getService().getName() : "Service");
            itemMap.put("itemid",       itemId);
            itemMap.put("itemname",     itemName);
            itemMap.put("itemprice",    item.getUnitPrice() != null ? item.getUnitPrice().longValue() : 0L);
            itemMap.put("itemquantity", item.getQuantity());
            itemsList.add(itemMap);
        }

        return new ZaloPayOrderData(
                order.getId(),
                order.getOrderCode(),
                order.getTotalAmount().longValue(),
                itemsList
        );
    }

    public record ZaloPayOrderData(Long orderId, String orderCode, long totalAmount, List<Map<String, Object>> items) {}

    // ----------------------------------------------------------------
    // Persist PaymentTransaction after ZaloPay confirms
    // ----------------------------------------------------------------
    @Transactional
    public void persistPaymentTransaction(Long orderId, String appTransId, long amount) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        PaymentTransaction tx = PaymentTransaction.builder()
                .order(order)
                .externalTransactionId(appTransId)
                .amount(java.math.BigDecimal.valueOf(amount))
                .currency("VND")
                .paymentMethod(PaymentMethod.E_WALLET)
                .build();
        paymentTransactionRepository.save(tx);

        order.setPaymentMethod("ZALOPAY");
        order.setPaymentTransactionId(appTransId);
        orderRepository.save(order);
    }

    // ----------------------------------------------------------------
    // Create ZaloPay order and return the payment URL
    // ----------------------------------------------------------------
    public Map<String, Object> createZaloPayOrder(Long orderId, Long accountId, String redirectUrl) throws Exception {
        log.info("Creating ZaloPay order for orderId={}, accountId={}", orderId, accountId);

        // Step 1: Load order data in its own transaction (avoids LazyInitializationException)
        ZaloPayOrderData data = loadOrderData(orderId);

        long appTime = System.currentTimeMillis();
        String date = new SimpleDateFormat("yyMMdd").format(new Date());
        String uniquePart = UUID.randomUUID().toString().replace("-", "").substring(0, 8);
        String appTransId = date + "_" + orderId + "_" + uniquePart;

        long amount = data.totalAmount();
        if (amount < 1000) {
            amount = amount * 1000;
        }
        log.info("ZaloPay amount={}, appTransId={}", amount, appTransId);

        String appUser = String.valueOf(accountId);
        String appId   = config.getAppId();
        log.info("ZaloPay config: appId={}, endpoint={}, callbackUrl={}", appId, config.getEndpoint(), config.getCallbackUrl());

        String itemJson = objectMapper.writeValueAsString(data.items());

        String finalRedirectUrl = (redirectUrl != null && !redirectUrl.isBlank())
                ? redirectUrl
                : "http://localhost:3000/client/success?orderId=" + orderId;

        Map<String, String> embedDataMap = new LinkedHashMap<>();
        embedDataMap.put("redirecturl", finalRedirectUrl);
        String embedData = objectMapper.writeValueAsString(embedDataMap);

        // Compute MAC: app_id|app_trans_id|app_user|amount|app_time|embed_data|item
        String macData = appId + "|" + appTransId + "|" + appUser + "|" + amount + "|"
                + appTime + "|" + embedData + "|" + itemJson;
        String mac = computeHmac(macData, config.getKey1());
        log.info("ZaloPay MAC data: {}", macData);

        // Step 2: Call ZaloPay API (outside any transaction)
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("app_id",       appId);
        params.add("app_user",     appUser);
        params.add("app_trans_id", appTransId);
        params.add("app_time",     String.valueOf(appTime));
        params.add("amount",       String.valueOf(amount));
        params.add("item",         itemJson);
        params.add("description",  "Carevia - Thanh toan don hang #" + data.orderCode());
        params.add("embed_data",   embedData);
        params.add("callback_url", config.getCallbackUrl() != null ? config.getCallbackUrl() : "");
        params.add("mac",          mac);
        params.add("bank_code",    "");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(params, headers);

        RestTemplate restTemplate = new RestTemplate();
        String url = config.getEndpoint() + "/v2/create";
        log.info("Calling ZaloPay API: POST {}", url);

        @SuppressWarnings("unchecked")
        ResponseEntity<Map<String, Object>> response;
        try {
            response = (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) restTemplate.postForEntity(url, entity, Map.class);
        } catch (Exception e) {
            log.error("ZaloPay API network error: {}", e.getMessage(), e);
            throw new RuntimeException("Khong ket noi duoc ZaloPay: " + e.getMessage());
        }

        Map<String, Object> body = response.getBody();
        log.info("ZaloPay createorder response: {}", body);

        if (body == null) {
            throw new RuntimeException("ZaloPay returned empty response");
        }

        Object returnCodeObj = body.get("return_code");
        int returnCode = returnCodeObj != null ? Integer.parseInt(returnCodeObj.toString()) : -1;
        if (returnCode != 1) {
            String msg = body.getOrDefault("return_message", "Unknown ZaloPay error").toString();
            String subMsg = body.containsKey("sub_return_message")
                    ? " [" + body.get("sub_return_message") + "]"
                    : "";
            log.error("ZaloPay rejected order: returnCode={}, message={}{}", returnCode, msg, subMsg);
            throw new RuntimeException("ZaloPay: " + msg + subMsg);
        }

        // Step 3: Persist PaymentTransaction in its own transaction
        persistPaymentTransaction(orderId, appTransId, amount);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("orderUrl",   body.get("order_url"));
        result.put("appTransId", appTransId);
        result.put("returnCode", returnCode);
        return result;
    }

    // ----------------------------------------------------------------
    // Verify ZaloPay payment status by querying ZaloPay API
    // Used when server-to-server callback cannot reach localhost (dev)
    // ----------------------------------------------------------------
    @Transactional
    public Map<String, Object> verifyAndConfirmPayment(Long orderId) throws Exception {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        // If already paid, return immediately
        if (order.getStatus() == com.carevia.shared.constant.OrderStatus.PAID) {
            return Map.of("status", "PAID", "message", "Order already paid");
        }

        // Find the PaymentTransaction to get appTransId
        PaymentTransaction tx = paymentTransactionRepository
                .findTopByOrderIdOrderByTransactionAtDesc(orderId)
                .orElse(null);

        if (tx == null) {
            return Map.of("status", "NO_TRANSACTION", "message", "No payment transaction found");
        }

        String appTransId = tx.getExternalTransactionId();

        // Query ZaloPay for payment status
        String appId = config.getAppId();
        String macData = appId + "|" + appTransId + "|" + config.getKey1();
        String mac = computeHmac(macData, config.getKey1());

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("app_id", appId);
        params.add("app_trans_id", appTransId);
        params.add("mac", mac);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(params, headers);

        RestTemplate restTemplate = new RestTemplate();
        String queryUrl = config.getEndpoint() + "/v2/query";
        log.info("Querying ZaloPay status: POST {} for appTransId={}", queryUrl, appTransId);

        @SuppressWarnings("unchecked")
        ResponseEntity<Map<String, Object>> response =
                (ResponseEntity<Map<String, Object>>) (ResponseEntity<?>) restTemplate.postForEntity(queryUrl, entity, Map.class);

        Map<String, Object> body = response.getBody();
        log.info("ZaloPay query response: {}", body);

        if (body == null) {
            return Map.of("status", "ERROR", "message", "ZaloPay returned empty response");
        }

        int returnCode = Integer.parseInt(body.getOrDefault("return_code", -1).toString());

        if (returnCode == 1) {
            // Payment confirmed — mark order as PAID
            String zpTransId = body.getOrDefault("zp_trans_id", "").toString();
            orderService.confirmZaloPayPayment(orderId, zpTransId);
            log.info("Order {} confirmed PAID via verify endpoint", orderId);
            return Map.of("status", "PAID", "message", "Payment verified and confirmed");
        } else if (returnCode == 2) {
            return Map.of("status", "PENDING", "message", "Payment is still pending");
        } else {
            return Map.of("status", "FAILED", "message",
                    body.getOrDefault("return_message", "Payment failed").toString());
        }
    }

    // ----------------------------------------------------------------
    // Handle callback from ZaloPay (server-to-server)
    // ----------------------------------------------------------------
    @Transactional
    public Map<String, Object> handleCallback(Map<String, Object> callbackData) {
        Map<String, Object> result = new LinkedHashMap<>();
        try {
            String dataStr    = (String) callbackData.get("data");
            String receivedMac = (String) callbackData.get("mac");

            // Verify HMAC using key2
            String expectedMac = computeHmac(dataStr, config.getKey2());
            if (!expectedMac.equalsIgnoreCase(receivedMac)) {
                log.warn("ZaloPay callback MAC mismatch");
                result.put("return_code",    -1);
                result.put("return_message", "mac not equal");
                return result;
            }

            JsonNode data      = objectMapper.readTree(dataStr);
            String appTransId  = data.get("app_trans_id").asText();
            String zpTransId   = data.get("zp_trans_id").asText();

            // Find the PaymentTransaction by appTransId
            PaymentTransaction tx = paymentTransactionRepository
                    .findByExternalTransactionId(appTransId)
                    .orElse(null);

            if (tx == null) {
                log.warn("ZaloPay callback: no PaymentTransaction found for appTransId={}", appTransId);
                result.put("return_code",    0);
                result.put("return_message", "Transaction not found");
                return result;
            }

            // Mark transaction success and save provider response
            tx.markSuccess();
            tx.saveProviderResponse(dataStr);
            paymentTransactionRepository.save(tx);

            // Confirm payment on the order (idempotent - checks PENDING_PAYMENT)
            orderService.confirmZaloPayPayment(tx.getOrder().getId(), zpTransId);

            result.put("return_code",    1);
            result.put("return_message", "success");
        } catch (Exception e) {
            log.error("ZaloPay callback processing error", e);
            result.put("return_code",    0);
            result.put("return_message", e.getMessage());
        }
        return result;
    }
}
