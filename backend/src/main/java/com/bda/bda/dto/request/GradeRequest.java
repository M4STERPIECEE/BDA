package com.bda.bda.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record GradeRequest(
        @NotNull(message = "Student ID is required")
        Integer studentId,

        @NotNull(message = "Subject ID is required")
        Integer subjectId,

        @NotNull(message = "Grade value is required")
        @DecimalMin(value = "0.00", message = "Grade must be at least 0")
        @DecimalMax(value = "20.00", message = "Grade must not exceed 20")
        BigDecimal value
) {}
