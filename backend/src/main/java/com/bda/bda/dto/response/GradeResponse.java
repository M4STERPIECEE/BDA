package com.bda.bda.dto.response;

import java.math.BigDecimal;

public record GradeResponse(
        Integer studentId,
        String studentName,
        Integer subjectId,
        String subjectLabel,
        BigDecimal value
) {}
