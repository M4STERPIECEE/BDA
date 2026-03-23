package com.bda.bda.controller.v1;

import com.bda.bda.dto.request.SubjectRequest;
import com.bda.bda.dto.response.SubjectResponse;
import com.bda.bda.service.SubjectService;
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
@RequestMapping("/${version.path}/subjects")
@RequiredArgsConstructor
@Tag(name = "Subjects")
public class SubjectController {

    private final SubjectService subjectService;

    @GetMapping
    @Operation(summary = "List subjects")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Subjects returned", content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = SubjectResponse.class))))})
    public ResponseEntity<List<SubjectResponse>> getAll() {
        return ResponseEntity.ok(subjectService.findAll());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get subject by id")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Subject found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = SubjectResponse.class))), @ApiResponse(responseCode = "404", description = "Subject not found")
    })
    public ResponseEntity<SubjectResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(subjectService.findById(id));
    }

    @PostMapping
    @Operation(summary = "Create a subject")
    @ApiResponses(value = {@ApiResponse(responseCode = "201", description = "Subject created", content = @Content(mediaType = "application/json", schema = @Schema(implementation = SubjectResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request body"),
            @ApiResponse(responseCode = "409", description = "Subject already exists")
    })
    public ResponseEntity<SubjectResponse> create(@Valid @RequestBody SubjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subjectService.create(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a subject")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Subject updated", content = @Content(mediaType = "application/json", schema = @Schema(implementation = SubjectResponse.class))), @ApiResponse(responseCode = "400", description = "Invalid request body"), @ApiResponse(responseCode = "404", description = "Subject not found"), @ApiResponse(responseCode = "409", description = "Subject already exists")
    })
    public ResponseEntity<SubjectResponse> update(@PathVariable Integer id, @Valid @RequestBody SubjectRequest request) {
        return ResponseEntity.ok(subjectService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a subject")
    @ApiResponses(value = {@ApiResponse(responseCode = "204", description = "Subject deleted"), @ApiResponse(responseCode = "404", description = "Subject not found")
    })
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        subjectService.delete(id);
        return ResponseEntity.noContent().build();
    }
}