package com.bda.bda.repository;

import com.bda.bda.model.Grade;
import com.bda.bda.model.GradeId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GradeRepository extends JpaRepository<Grade, GradeId> {
}
