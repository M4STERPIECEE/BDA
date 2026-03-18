package com.bda.bda.controller.v1;

import com.bda.bda.dto.request.GradeRequest;
import com.bda.bda.dto.response.GradeResponse;
import com.bda.bda.service.GradeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/${version.path}/grades")
@RequiredArgsConstructor
@Tag(name = "Grades")
public class GradeController {
    private final GradeService gradeService;

    @GetMapping
    public ResponseEntity<List<GradeResponse>> getAll() {
        return ResponseEntity.ok(gradeService.findAll());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<GradeResponse>> getByStudent(@PathVariable Integer studentId) {
        return ResponseEntity.ok(gradeService.findByStudent(studentId));
    }

    @GetMapping("/student/{studentId}/subject/{subjectId}")
    public ResponseEntity<GradeResponse> getById(@PathVariable Integer studentId, @PathVariable Integer subjectId) {
        return ResponseEntity.ok(gradeService.findById(studentId, subjectId));
    }

    @PostMapping
    public ResponseEntity<GradeResponse> create(@Valid @RequestBody GradeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gradeService.create(request));
    }

    @PutMapping("/student/{studentId}/subject/{subjectId}")
    public ResponseEntity<GradeResponse> update(@PathVariable Integer studentId, @PathVariable Integer subjectId,
            @Valid @RequestBody GradeRequest request) {
        return ResponseEntity.ok(gradeService.update(studentId, subjectId, request));
    }

    @DeleteMapping("/student/{studentId}/subject/{subjectId}")
    public ResponseEntity<Void> delete(@PathVariable Integer studentId,
            @PathVariable Integer subjectId) {
        gradeService.delete(studentId, subjectId);
        return ResponseEntity.noContent().build();
    }
}