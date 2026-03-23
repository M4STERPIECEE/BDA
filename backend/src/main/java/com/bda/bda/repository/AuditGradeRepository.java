package com.bda.bda.repository;

import com.bda.bda.model.AuditGrade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditGradeRepository extends JpaRepository<AuditGrade, Integer> {
    List<AuditGrade> findAllByOrderByUpdatedAtDesc();
    List<AuditGrade> findByStudentIdOrderByUpdatedAtDesc(Integer studentId);
    List<AuditGrade> findByOperationTypeOrderByUpdatedAtDesc(String operationType);
    long countByOperationType(String operationType);
}