package com.bda.bda.dto.response;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AuditStatsResponse {
    private long insertCount;
    private long updateCount;
    private long deleteCount;
    private long totalCount;
}