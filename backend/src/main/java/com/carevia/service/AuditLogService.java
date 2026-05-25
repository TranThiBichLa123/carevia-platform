package com.carevia.service;

import com.carevia.core.domain.AuditLog;
import com.carevia.core.repository.AuditLogRepository;
import com.carevia.shared.dto.PageResponse;
import com.carevia.shared.dto.response.log.AuditLogSuggestionsResponse;
import com.carevia.shared.dto.response.log.AuditLogResponse;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getAuditLogs(String search, String action, String role, String tableName, Pageable pageable) {
        Page<AuditLog> page = auditLogRepository.findAll(buildSpecification(search, action, role, tableName), pageable);

        return PageResponse.<AuditLogResponse>builder()
                .items(page.getContent().stream().map(this::toResponse).toList())
                .page(page.getNumber())
                .size(page.getSize())
                .totalItems(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }

    @Transactional(readOnly = true)
    public AuditLogSuggestionsResponse getAuditLogSuggestions() {
        List<String> searchTerms = Stream.concat(
                        auditLogRepository.findDistinctActorUsernames().stream(),
                        auditLogRepository.findDistinctActorEmails().stream())
                .distinct()
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .toList();

        return AuditLogSuggestionsResponse.builder()
                .searchTerms(searchTerms)
                .tableNames(auditLogRepository.findDistinctTableNames())
                .build();
    }

    private Specification<AuditLog> buildSpecification(String search, String action, String role, String tableName) {
        return (root, query, cb) -> {
            Join<Object, Object> userAccountJoin = root.join("userAccount", JoinType.LEFT);

            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();

            if (action != null && !action.isBlank()) {
                predicates.add(cb.equal(cb.upper(root.get("action")), action.trim().toUpperCase()));
            }

            if (role != null && !role.isBlank()) {
                predicates.add(cb.equal(cb.upper(userAccountJoin.get("role").as(String.class)), role.trim().toUpperCase()));
            }

            if (tableName != null && !tableName.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("tableName")), "%" + tableName.trim().toLowerCase() + "%"));
            }

            if (search != null && !search.isBlank()) {
                String likeValue = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("tableName")), likeValue),
                        cb.like(cb.lower(root.get("recordId")), likeValue),
                        cb.like(cb.lower(root.get("action")), likeValue),
                        cb.like(cb.lower(root.get("changedData")), likeValue),
                        cb.like(cb.lower(userAccountJoin.get("role").as(String.class)), likeValue),
                        cb.like(cb.lower(userAccountJoin.get("username")), likeValue),
                        cb.like(cb.lower(userAccountJoin.get("email")), likeValue)
                ));
            }

            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };
    }

    private AuditLogResponse toResponse(AuditLog auditLog) {
        return AuditLogResponse.builder()
                .id(auditLog.getId())
                .tableName(auditLog.getTableName())
                .recordId(auditLog.getRecordId())
                .action(auditLog.getAction())
                .changedData(auditLog.getChangedData())
                .userAccountId(auditLog.getUserAccount() != null ? auditLog.getUserAccount().getId() : null)
                .username(auditLog.getUserAccount() != null ? auditLog.getUserAccount().getUsername() : null)
                .email(auditLog.getUserAccount() != null ? auditLog.getUserAccount().getEmail() : null)
                .role(auditLog.getUserAccount() != null ? auditLog.getUserAccount().getRole().name() : null)
                .ipAddress(auditLog.getIpAddress())
                .createdAt(auditLog.getCreatedAt())
                .build();
    }
}