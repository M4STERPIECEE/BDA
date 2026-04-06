package com.bda.bda.dto.response;

import java.math.BigDecimal;

public record SubjectResponse(
        String subjectId,
        String label,
        BigDecimal coefficient
) {
    public static String formatSubjectId(Integer id) {
        return String.format("MAT%03d", id);
    }
}
