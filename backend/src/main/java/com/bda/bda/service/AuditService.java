package com.bda.bda.service;

import com.bda.bda.dto.response.AuditResponse;
import com.bda.bda.dto.response.AuditStatsResponse;
import com.bda.bda.model.AuditGrade;
import com.bda.bda.repository.AuditGradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuditService {
    private final AuditGradeRepository auditGradeRepository;

    public List<AuditResponse> findAll() {
        return auditGradeRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<AuditResponse> findByStudent(Integer studentId) {
        return auditGradeRepository.findAll().stream()
                .filter(audit -> audit.getStudentId() != null && studentId.equals(audit.getStudentId()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public AuditStatsResponse getStats() {
        long inserts = auditGradeRepository.findAll().stream().filter(a -> "INSERT".equalsIgnoreCase(a.getOperationType())).count();
        long updates = auditGradeRepository.findAll().stream().filter(a -> "UPDATE".equalsIgnoreCase(a.getOperationType())).count();
        long deletes = auditGradeRepository.findAll().stream().filter(a -> "DELETE".equalsIgnoreCase(a.getOperationType())).count();
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