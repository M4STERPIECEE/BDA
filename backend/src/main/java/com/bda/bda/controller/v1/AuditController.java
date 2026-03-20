package com.bda.bda.controller.v1;

import com.bda.bda.dto.response.AuditResponse;
import com.bda.bda.dto.response.AuditStatsResponse;
import com.bda.bda.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/${version.path}/audit")
@RequiredArgsConstructor
@Tag(name = "Audit")
public class AuditController {

    private final AuditService auditService;

    @GetMapping
    @Operation(summary = "List audit entries")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Audit entries returned",
                    content = @Content(mediaType = "application/json",
                            array = @ArraySchema(schema = @Schema(implementation = AuditResponse.class))))
    })
    public ResponseEntity<List<AuditResponse>> getAll() {
        return ResponseEntity.ok(auditService.findAll());
    }

    @GetMapping("/student/{studentId}")
    @Operation(summary = "List audit entries by student")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Audit entries returned",
                    content = @Content(mediaType = "application/json",
                            array = @ArraySchema(schema = @Schema(implementation = AuditResponse.class)))),
            @ApiResponse(responseCode = "404", description = "Student not found")
    })
    public ResponseEntity<List<AuditResponse>> getByStudent(@PathVariable Integer studentId) {
        return ResponseEntity.ok(auditService.findByStudent(studentId));
    }

    @GetMapping("/stats")
    @Operation(summary = "Get audit statistics")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Audit stats returned",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = AuditStatsResponse.class)))
    })
    public ResponseEntity<AuditStatsResponse> getStats() {
        return ResponseEntity.ok(auditService.getStats());
    }
}