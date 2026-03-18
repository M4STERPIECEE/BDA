package com.bda.bda.service;

import com.bda.bda.repository.AuditGradeRepository;
import org.springframework.stereotype.Service;

@Service
public class AuditService {
    private final AuditGradeRepository auditGradeRepository;

    public AuditService(AuditGradeRepository auditGradeRepository) {
        this.auditGradeRepository = auditGradeRepository;
    }

    public long count() {
        return auditGradeRepository.count();
    }
}
