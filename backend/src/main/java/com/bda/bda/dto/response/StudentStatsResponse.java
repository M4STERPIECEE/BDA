package com.bda.bda.dto.response;

import java.math.BigDecimal;

public record StudentStatsResponse(
        long totalStudents,
        BigDecimal globalAverage,
        long studentsInAlert
) {}