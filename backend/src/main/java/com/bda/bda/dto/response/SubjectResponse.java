package com.bda.bda.dto.response;

import java.math.BigDecimal;

public record SubjectResponse(
        Integer subjectId,
        String label,
        BigDecimal coefficient
) {}
