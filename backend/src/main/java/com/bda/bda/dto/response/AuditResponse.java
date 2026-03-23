package com.bda.bda.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record AuditResponse(
        Integer auditId,
        String operationType,
        LocalDateTime updatedAt,
        Integer studentId,
        String studentName,
        String subjectLabel,
        BigDecimal oldValue,
        BigDecimal newValue,
        String dbUser
) {}
