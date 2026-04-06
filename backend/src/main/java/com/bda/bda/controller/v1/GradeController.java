package com.bda.bda.controller.v1;

import com.bda.bda.dto.request.GradeRequest;
import com.bda.bda.dto.response.GradeResponse;
import com.bda.bda.service.GradeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/${version.path}/grades")
@RequiredArgsConstructor
@Tag(name = "Grades")
public class GradeController {
    private final GradeService gradeService;

    @GetMapping
    @Operation(summary = "List grades")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Grades returned", content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = GradeResponse.class))))
    })
    public ResponseEntity<List<GradeResponse>> getAll() {
        return ResponseEntity.ok(gradeService.findAll());
    }

    @GetMapping("/student/{studentId}")
    @Operation(summary = "List grades by student")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Grades returned",content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = GradeResponse.class)))),
            @ApiResponse(responseCode = "404", description = "Student not found")
    })
    public ResponseEntity<List<GradeResponse>> getByStudent(@PathVariable Integer studentId) {
        return ResponseEntity.ok(gradeService.findByStudent(studentId));
    }

    @GetMapping("/student/{studentId}/subject/{subjectId}")
    @Operation(summary = "Get grade by student and subject")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Grade found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = GradeResponse.class))),
            @ApiResponse(responseCode = "404", description = "Grade not found")
    })
    public ResponseEntity<GradeResponse> getById(@PathVariable Integer studentId, @PathVariable Integer subjectId) {
        return ResponseEntity.ok(gradeService.findById(studentId, subjectId));
    }

    @PostMapping
    @Operation(summary = "Create a grade")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Grade created", content = @Content(mediaType = "application/json", schema = @Schema(implementation = GradeResponse.class)))
    })
    public ResponseEntity<GradeResponse> create(@Valid @RequestBody GradeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(gradeService.create(request));
    }

    @PutMapping("/student/{studentId}/subject/{subjectId}")
    @Operation(summary = "Update a grade")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Grade updated", content = @Content(mediaType = "application/json", schema = @Schema(implementation = GradeResponse.class)))
    })
    public ResponseEntity<GradeResponse> update(@PathVariable Integer studentId, @PathVariable Integer subjectId, @Valid @RequestBody GradeRequest request) {
        return ResponseEntity.ok(gradeService.update(studentId, subjectId, request));
    }

    @DeleteMapping("/student/{studentId}/subject/{subjectId}")
    @Operation(summary = "Delete a grade")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Grade deleted"), 
        @ApiResponse(responseCode = "404", description = "Grade not found")
    })
    public ResponseEntity<Void> delete(@PathVariable Integer studentId, @PathVariable Integer subjectId) {
        gradeService.delete(studentId, subjectId);
        return ResponseEntity.noContent().build();
    }
}