package com.carevia.core.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "audit_log")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "table_name", nullable = false, length = 255)
    private String tableName;

    @Column(name = "record_id", nullable = false, length = 100)
    private String recordId;

    @Column(nullable = false, length = 50)
    private String action;

    @Column(name = "changed_data", columnDefinition = "JSON")
    private String changedData;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_account_id", nullable = false)
    private Account userAccount;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private Instant createdAt = Instant.now();

    public static AuditLog logInsert(String tableName, String recordId, String data,
                                      Account userAccount, String ipAddress) {
        return AuditLog.builder()
                .tableName(tableName)
                .recordId(recordId)
                .action("INSERT")
                .changedData(data)
                .userAccount(userAccount)
                .ipAddress(ipAddress)
                .createdAt(Instant.now())
                .build();
    }

    public static AuditLog logUpdate(String tableName, String recordId, String data,
                                      Account userAccount, String ipAddress) {
        return AuditLog.builder()
                .tableName(tableName)
                .recordId(recordId)
                .action("UPDATE")
                .changedData(data)
                .userAccount(userAccount)
                .ipAddress(ipAddress)
                .createdAt(Instant.now())
                .build();
    }

    public static AuditLog logDelete(String tableName, String recordId,
                                      Account userAccount, String ipAddress) {
        return AuditLog.builder()
                .tableName(tableName)
                .recordId(recordId)
                .action("DELETE")
                .userAccount(userAccount)
                .ipAddress(ipAddress)
                .createdAt(Instant.now())
                .build();
    }
}
