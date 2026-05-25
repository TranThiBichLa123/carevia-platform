package com.carevia.shared.dto.response.log;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AuditLogSuggestionsResponse {
    private List<String> searchTerms;
    private List<String> tableNames;
}