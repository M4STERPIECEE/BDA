package com.bda.bda.dto.response;

public record AuditStatsResponse(
        long insertCount,
        long updateCount,
        long deleteCount,
        long totalCount
) {}
