package com.bda.bda.dto.response;

import java.math.BigDecimal;

public record StudentResponse(
        Integer studentId,
        String studentCode,
        String fullName,
        BigDecimal average
) {}
