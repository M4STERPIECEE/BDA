package com.bda.bda.dto.response;

import java.math.BigDecimal;

public record SubjectStatsResponse(
        long totalSubjects,
        BigDecimal averageCoefficient
) {}
