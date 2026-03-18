package com.bda.bda.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SubjectRequest {

    @NotBlank(message = "Label is required")
    @Size(max = 100, message = "Label must not exceed 100 characters")
    private String label;

    @NotNull(message = "Coefficient is required")
    @DecimalMin(value = "0.01", message = "Coefficient must be greater than 0")
    private BigDecimal coefficient;
}