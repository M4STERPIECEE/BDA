package com.bda.bda.service;

import com.bda.bda.dto.request.StudentRequest;
import com.bda.bda.dto.response.StudentResponse;
import com.bda.bda.dto.response.StudentStatsResponse;
import com.bda.bda.exception.ResourceNotFoundException;
import com.bda.bda.exception.StudentAlreadyExistsException;
import com.bda.bda.model.Student;
import com.bda.bda.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentService {

    private final StudentRepository studentRepository;

    public Page<StudentResponse> findAll(Pageable pageable) {
        return studentRepository.findAll(pageable).map(this::toResponse);
    }

    public StudentStatsResponse getStats() {
        Number averageAggregate = studentRepository.getAverageOfAllStudents();
        double averageValue = averageAggregate == null ? 0d : averageAggregate.doubleValue();

        return new StudentStatsResponse(
                studentRepository.count(),
            BigDecimal.valueOf(averageValue).setScale(2, RoundingMode.HALF_UP),
                studentRepository.countByAverageLessThan(BigDecimal.TEN)
        );
    }

    public StudentResponse findById(Integer id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public StudentResponse create(StudentRequest request) {
        if (studentRepository.existsByFullNameIgnoreCase(request.fullName())) {
            throw new StudentAlreadyExistsException(
                    "student already exists with name: " + request.fullName()
            );
        }
        Student student = Student.builder()
                .fullName(request.fullName())
                .build();
        return toResponse(studentRepository.save(student));
    }

    @Transactional
    public StudentResponse update(Integer id, StudentRequest request) {
        Student student = getOrThrow(id);
        if (!student.getFullName().equalsIgnoreCase(request.fullName())
                && studentRepository.existsByFullNameIgnoreCase(request.fullName())) {
            throw new StudentAlreadyExistsException(
                    "another student already exists with name: " + request.fullName()
            );
        }
        student.setFullName(request.fullName());
        return toResponse(studentRepository.save(student));
    }

    @Transactional
    public void delete(Integer id) {
        studentRepository.delete(getOrThrow(id));
    }

    private Student getOrThrow(Integer id) {
        return studentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("student not found with id: " + id));
    }

    private StudentResponse toResponse(Student s) {
        return new StudentResponse(s.getStudentId(), s.getFullName(), s.getAverage());
    }
}