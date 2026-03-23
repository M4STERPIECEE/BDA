package com.bda.bda.service;

import com.bda.bda.dto.response.AuditResponse;
import com.bda.bda.dto.response.AuditStatsResponse;
import com.bda.bda.exception.ResourceNotFoundException;
import com.bda.bda.model.AuditGrade;
import com.bda.bda.repository.AuditGradeRepository;
import com.bda.bda.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditService {

    private final AuditGradeRepository auditGradeRepository;
    private final StudentRepository    studentRepository;

    public List<AuditResponse> findAll() {
        return auditGradeRepository.findAllByOrderByUpdatedAtDesc()
                .stream().map(this::toResponse).toList();
    }

    public List<AuditResponse> findByType(String operationType) {
        return auditGradeRepository.findByOperationTypeOrderByUpdatedAtDesc(operationType).stream().map(this::toResponse).toList();
    }

    public List<AuditResponse> findByStudent(Integer studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("Student not found with id: " + studentId);
        }
        return auditGradeRepository.findByStudentIdOrderByUpdatedAtDesc(studentId).stream().map(this::toResponse).toList();
    }

    public AuditStatsResponse getStats() {
        long inserts = auditGradeRepository.countByOperationType("INSERT");
        long updates = auditGradeRepository.countByOperationType("UPDATE");
        long deletes = auditGradeRepository.countByOperationType("DELETE");
        return new AuditStatsResponse(inserts, updates, deletes, inserts + updates + deletes);
    }

    private AuditResponse toResponse(AuditGrade audit) {
        return new AuditResponse(
                audit.getAuditId(),
                audit.getOperationType(),
                audit.getUpdatedAt(),
                audit.getStudentId(),
                audit.getStudentName(),
                audit.getSubjectLabel(),
                audit.getOldValue(),
                audit.getNewValue(),
                audit.getDbUser()
        );
    }
}