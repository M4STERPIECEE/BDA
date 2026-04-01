package com.bda.bda.controller.v1;

import com.bda.bda.dto.request.StudentRequest;
import com.bda.bda.dto.response.StudentResponse;
import com.bda.bda.dto.response.StudentStatsResponse;
import com.bda.bda.service.StudentService;
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

@RestController
@RequestMapping("/${version.path}/students")
@RequiredArgsConstructor
@Tag(name = "Students")
public class StudentController {
    private static final int PAGE_SIZE = 5;

    private final StudentService studentService;

    @GetMapping
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Students returned", content = @Content(mediaType = "application/json", array = @ArraySchema(schema = @Schema(implementation = StudentResponse.class))))
    })
    public ResponseEntity<Page<StudentResponse>> getAll(@RequestParam(defaultValue = "0") int page) {
        return ResponseEntity.ok(studentService.findAll(PageRequest.of(page, PAGE_SIZE, Sort.by(Sort.Direction.DESC, "studentId"))));
    }

    @GetMapping("/stats")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Student stats returned", content = @Content(mediaType = "application/json", schema = @Schema(implementation = StudentStatsResponse.class)))
    })
    public ResponseEntity<StudentStatsResponse> getStats() {
        return ResponseEntity.ok(studentService.getStats());
    }

    @GetMapping("/{id}")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Student found", content = @Content(mediaType = "application/json", schema = @Schema(implementation = StudentResponse.class))), @ApiResponse(responseCode = "404", description = "Student not found")
    })
    public ResponseEntity<StudentResponse> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(studentService.findById(id));
    }

    @PostMapping
    @ApiResponses(value = {@ApiResponse(responseCode = "201", description = "Student created", content = @Content(mediaType = "application/json", schema = @Schema(implementation = StudentResponse.class))), @ApiResponse(responseCode = "400", description = "Invalid request body")
    })
    public ResponseEntity<StudentResponse> create(@Valid @RequestBody StudentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studentService.create(request));
    }

    @PutMapping("/{id}")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Student updated", content = @Content(mediaType = "application/json", schema = @Schema(implementation = StudentResponse.class))), @ApiResponse(responseCode = "400", description = "Invalid request body"), @ApiResponse(responseCode = "404", description = "Student not found")
    })
    public ResponseEntity<StudentResponse> update(@PathVariable Integer id, @Valid @RequestBody StudentRequest request) {
        return ResponseEntity.ok(studentService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ApiResponses(value = {@ApiResponse(responseCode = "204", description = "Student deleted"), @ApiResponse(responseCode = "404", description = "Student not found")
    })
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        studentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}