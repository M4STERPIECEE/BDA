package com.bda.bda.service;

import com.bda.bda.dto.request.StudentRequest;
import com.bda.bda.dto.response.StudentResponse;
import com.bda.bda.exception.ResourceNotFoundException;
import com.bda.bda.model.Student;
import com.bda.bda.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentService {
    private final StudentRepository studentRepository;

    public List<StudentResponse> findAll() {
        return studentRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    public StudentResponse findById(Integer id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public StudentResponse create(StudentRequest request) {
        Student student = Student.builder()
                .fullName(request.fullName())
                .build();
        return toResponse(studentRepository.save(student));
    }

    @Transactional
    public StudentResponse update(Integer id, StudentRequest request) {
        Student student = getOrThrow(id);
        student.setFullName(request.fullName());
        return toResponse(studentRepository.save(student));
    }

    @Transactional
    public void delete(Integer id) {
        Student student = getOrThrow(id);
        studentRepository.delete(student);
    }

    private Student getOrThrow(Integer id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }

    public StudentResponse toResponse(Student s) {
        return new StudentResponse(s.getStudentId(), s.getFullName(), s.getAverage());
    }
}