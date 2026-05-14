package com.carevia.config.audit;

import com.carevia.core.domain.Account;
import com.carevia.core.domain.AuditLog;
import com.carevia.core.repository.AccountRepository;
import com.carevia.core.repository.AuditLogRepository;
import com.carevia.shared.annotation.Audit;
import com.carevia.shared.util.SecurityUtils;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.multipart.MultipartFile;

import java.lang.reflect.Method;
import java.time.Instant;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Aspect
@Component
public class AuditLoggingAspect {

    private static final List<String> ID_GETTERS = List.of(
            "getId",
            "getAccountId",
            "getClientId",
            "getStaffId",
            "getOrderId",
            "getBookingId"
    );

    private final AuditLogRepository auditLogRepository;
    private final AccountRepository accountRepository;
    private final ObjectMapper objectMapper;

    public AuditLoggingAspect(
            AuditLogRepository auditLogRepository,
            AccountRepository accountRepository,
            ObjectMapper objectMapper
    ) {
        this.auditLogRepository = auditLogRepository;
        this.accountRepository = accountRepository;
        this.objectMapper = objectMapper;
    }

    @AfterReturning(pointcut = "@annotation(audit)", returning = "result")
    public void logAuditAction(JoinPoint joinPoint, Audit audit, Object result) {
        Long currentUserId = SecurityUtils.getCurrentUserId().orElse(null);
        if (currentUserId == null) {
            return;
        }

        Account account = accountRepository.findById(currentUserId).orElse(null);
        if (account == null) {
            return;
        }

        AuditLog auditLog = AuditLog.builder()
                .tableName(audit.table())
                .recordId(extractRecordId(joinPoint.getArgs(), result))
                .action(audit.action().name())
                .changedData(buildChangedData(joinPoint, result))
                .userAccount(account)
                .ipAddress(resolveIpAddress())
                .createdAt(Instant.now())
                .build();

        auditLogRepository.save(auditLog);
    }

    private String extractRecordId(Object[] args, Object result) {
        for (Object arg : args) {
            if (arg instanceof Number number) {
                return String.valueOf(number.longValue());
            }
        }

        String resultId = extractIdFromObject(result);
        return resultId != null ? resultId : "N/A";
    }

    private String extractIdFromObject(Object source) {
        if (source == null) {
            return null;
        }

        for (String getterName : ID_GETTERS) {
            try {
                Method getter = source.getClass().getMethod(getterName);
                Object value = getter.invoke(source);
                if (value != null) {
                    return String.valueOf(value);
                }
            } catch (ReflectiveOperationException ignored) {
                // Try the next known getter name.
            }
        }

        return null;
    }

    private String buildChangedData(JoinPoint joinPoint, Object result) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("method", joinPoint.getSignature().toShortString());
        payload.put("arguments", sanitizeArguments(joinPoint.getArgs()));
        payload.put("result", sanitizeValue(result));

        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException exception) {
            return "{\"serializationError\":\"" + exception.getMessage().replace("\"", "'") + "\"}";
        }
    }

    private List<Object> sanitizeArguments(Object[] args) {
        return Arrays.stream(args)
                .map(this::sanitizeValue)
                .toList();
    }

    private Object sanitizeValue(Object value) {
        if (value == null) {
            return null;
        }

        if (value instanceof Pageable pageable) {
            return Map.of(
                    "page", pageable.getPageNumber(),
                    "size", pageable.getPageSize(),
                    "sort", pageable.getSort().toString()
            );
        }

        if (value instanceof MultipartFile multipartFile) {
            return Map.of(
                    "fileName", multipartFile.getOriginalFilename(),
                    "size", multipartFile.getSize(),
                    "contentType", multipartFile.getContentType()
            );
        }

        if (value instanceof HttpServletRequest request) {
            return Map.of(
                    "method", request.getMethod(),
                    "uri", request.getRequestURI()
            );
        }

        if (value.getClass().getName().startsWith("org.springframework")) {
            return value.getClass().getSimpleName();
        }

        return value;
    }

    private String resolveIpAddress() {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes == null) {
            return null;
        }

        HttpServletRequest request = attributes.getRequest();
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}