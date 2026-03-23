package com.bda.bda.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "subject")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Subject {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subject_id")
    @EqualsAndHashCode.Include
    private Integer subjectId;

    @Column(name = "label", nullable = false, length = 100)
    private String label;

    @Column(name = "coefficient", nullable = false, precision = 4, scale = 2)
    private BigDecimal coefficient;
}