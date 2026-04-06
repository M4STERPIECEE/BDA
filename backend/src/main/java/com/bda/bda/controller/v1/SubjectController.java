package com.bda.bda.controller.v1;

import com.bda.bda.dto.request.SubjectRequest;
import com.bda.bda.dto.response.SubjectResponse;
import com.bda.bda.dto.response.SubjectStatsResponse;
import com.bda.bda.service.SubjectService;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;

@RestController
@RequestMapping("/${version.path}/subjects")
@RequiredArgsConstructor
@Tag(name = "Subjects")
public class SubjectController {
    private static final int PAGE_SIZE = 5;

    private final SubjectService subjectService;

    @GetMapping
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Subjects returned", content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = SubjectResponse.class))))
    })
    public ResponseEntity<Page<SubjectResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "") String search,
            @RequestParam(required = false) BigDecimal minCoefficient
    ) {
        int effectiveSize = size > 0 ? size : PAGE_SIZE;
        return ResponseEntity.ok(subjectService.findAll(
                PageRequest.of(page, effectiveSize, Sort.by(Sort.Direction.DESC, "subjectId")),
                search,
                minCoefficient
        ));
    }

    @GetMapping("/stats")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Subject stats returned", content = @Content(mediaType = "application/json", schema = @Schema(implementation = SubjectStatsResponse.class)))
    })
    public ResponseEntity<SubjectStatsResponse> getStats() {
        return ResponseEntity.ok(subjectService.getStats());
    }

    @GetMapping("/{id}")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "subject found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = SubjectResponse.class))),
            @ApiResponse(responseCode = "404", description = "subject not found")
    })
    public ResponseEntity<SubjectResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(subjectService.findById(id));
    }

    @PostMapping
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "subject created", content = @Content(mediaType = "application/json", schema = @Schema(implementation = SubjectResponse.class))),
            @ApiResponse(responseCode = "400", description = "request invalid"),
            @ApiResponse(responseCode = "409", description = "subject already exists")
    })
    public ResponseEntity<SubjectResponse> create(@Valid @RequestBody SubjectRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subjectService.create(request));
    }

    @PutMapping("/{id}")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "subject updated", content = @Content(mediaType = "application/json", schema = @Schema(implementation = SubjectResponse.class))),
            @ApiResponse(responseCode = "400", description = "request invalid"),
            @ApiResponse(responseCode = "404", description = "subject not found"),
            @ApiResponse(responseCode = "409", description = "subject already exists")
    })
    public ResponseEntity<SubjectResponse> update(@PathVariable Integer id, @Valid @RequestBody SubjectRequest request) {
        return ResponseEntity.ok(subjectService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "subject deleted"),
            @ApiResponse(responseCode = "404", description = "Subject not found")
    })
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        subjectService.delete(id);
        return ResponseEntity.noContent().build();
    }
}