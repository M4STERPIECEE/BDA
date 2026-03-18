package com.bda.bda.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class GradeRequest {

    @NotNull(message = "Student ID is required")
    private Integer studentId;

    @NotNull(message = "Subject ID is required")
    private Integer subjectId;

    @NotNull(message = "Grade value is required")
    @DecimalMin(value = "0.00", message = "Grade must be at least 0")
    @DecimalMax(value = "20.00", message = "Grade must not exceed 20")
    private BigDecimal value;
}