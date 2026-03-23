package com.bda.bda.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "grade_audit")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class AuditGrade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "audit_id")
    @EqualsAndHashCode.Include
    private Integer auditId;

    @Column(name = "operation_type", nullable = false, length = 10)
    private String operationType;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "student_id")
    private Integer studentId;

    @Column(name = "student_name", length = 100)
    private String studentName;

    @Column(name = "subject_label", length = 100)
    private String subjectLabel;

    @Column(name = "old_value", precision = 4, scale = 2)
    private BigDecimal oldValue;

    @Column(name = "new_value", precision = 4, scale = 2)
    private BigDecimal newValue;

    @Column(name = "db_user", nullable = false, length = 100)
    private String dbUser;
}