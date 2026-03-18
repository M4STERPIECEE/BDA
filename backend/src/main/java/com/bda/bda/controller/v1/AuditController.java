package com.bda.bda.controller.v1;

import com.bda.bda.dto.response.AuditResponse;
import com.bda.bda.dto.response.AuditStatsResponse;
import com.bda.bda.service.AuditService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/${version.path}/audit")
@RequiredArgsConstructor
@Tag(name = "Audit")
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    public ResponseEntity<List<AuditResponse>> getAll() {
        return ResponseEntity.ok(auditService.findAll());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AuditResponse>> getByStudent(@PathVariable Integer studentId) {
        return ResponseEntity.ok(auditService.findByStudent(studentId));
    }

    @GetMapping("/stats")
    public ResponseEntity<AuditStatsResponse> getStats() {
        return ResponseEntity.ok(auditService.getStats());
    }
}