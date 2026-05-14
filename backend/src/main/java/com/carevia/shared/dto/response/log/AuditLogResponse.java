package com.carevia.shared.dto.response.log;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class AuditLogResponse {
    private Long id;
    private String tableName;
    private String recordId;
    private String action;
    private String changedData;
    private Long userAccountId;
    private String username;
    private String email;
    private String ipAddress;
    private Instant createdAt;
}