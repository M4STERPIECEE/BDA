package com.bda.bda.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class StudentResponse {
    private Integer studentId;
    private String  fullName;
    private BigDecimal average;
}