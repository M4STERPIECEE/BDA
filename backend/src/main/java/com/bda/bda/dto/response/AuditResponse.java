package com.bda.bda.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class AuditResponse {
    private Integer       auditId;
    private String        operationType;
    private LocalDateTime updatedAt;
    private Integer       studentId;
    private String        studentName;
    private String        subjectLabel;
    private BigDecimal    oldValue;
    private BigDecimal    newValue;
    private String        dbUser;
}