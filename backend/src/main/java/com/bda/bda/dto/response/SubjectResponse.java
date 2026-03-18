package com.bda.bda.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SubjectResponse {
    private Integer    subjectId;
    private String     label;
    private BigDecimal coefficient;
}