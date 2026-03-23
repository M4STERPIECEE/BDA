package com.bda.bda.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record SubjectRequest(
        @NotBlank(message = "Label is required")
        @Size(max = 100, message = "Label must not exceed 100 characters")
        String label,

        @NotNull(message = "Coefficient is required")
        @DecimalMin(value = "0.01", message = "Coefficient must be greater than 0")
        BigDecimal coefficient
) {}
