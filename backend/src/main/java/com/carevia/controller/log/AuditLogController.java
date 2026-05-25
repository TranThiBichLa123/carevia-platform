package com.carevia.controller.log;

import com.carevia.service.AuditLogService;
import com.carevia.shared.annotation.AdminOnly;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/audit-logs")
@Tag(name = "Audit Logs", description = "Administrative audit log APIs")
public class AuditLogController {

    private final AuditLogService auditLogService;

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
    }

    @GetMapping
    @AdminOnly
    @Operation(summary = "Get audit logs for admin monitoring")
    public ResponseEntity<?> getAuditLogs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String tableName,
            Pageable pageable
    ) {
        return ResponseEntity.ok(auditLogService.getAuditLogs(search, action, role, tableName, pageable));
    }

    @GetMapping("/suggestions")
    @AdminOnly
    @Operation(summary = "Get audit log filter suggestions")
    public ResponseEntity<?> getAuditLogSuggestions() {
        return ResponseEntity.ok(auditLogService.getAuditLogSuggestions());
    }
}