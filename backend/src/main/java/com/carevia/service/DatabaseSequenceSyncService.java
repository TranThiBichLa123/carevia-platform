package com.carevia.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class DatabaseSequenceSyncService {

    private static final Set<String> ALLOWED_TABLES = Set.of(
            "accounts",
            "staffs",
            "clients",
            "bookings");

    private final JdbcTemplate jdbcTemplate;

    public DatabaseSequenceSyncService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void syncIdSequence(String tableName) {
        if (!ALLOWED_TABLES.contains(tableName)) {
            throw new IllegalArgumentException("Sequence sync is not allowed for table: " + tableName);
        }

        String sql = String.format(
                "SELECT setval(pg_get_serial_sequence('public.%1$s', 'id'), COALESCE((SELECT MAX(id) FROM public.%1$s), 0) + 1, false)",
                tableName);
        jdbcTemplate.execute(sql);
    }
}