package com.bda.bda.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class GradeResponse {
    private Integer    studentId;
    private String     studentName;
    private Integer    subjectId;
    private String     subjectLabel;
    private BigDecimal value;
}