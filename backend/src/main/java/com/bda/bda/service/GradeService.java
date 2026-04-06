package com.bda.bda.service;

import com.bda.bda.dto.request.GradeRequest;
import com.bda.bda.dto.response.GradeResponse;
import com.bda.bda.exception.GradeAlreadyExistsException;
import com.bda.bda.exception.ResourceNotFoundException;
import com.bda.bda.model.Grade;
import com.bda.bda.model.GradeId;
import com.bda.bda.model.Student;
import com.bda.bda.model.Subject;
import com.bda.bda.repository.GradeRepository;
import com.bda.bda.repository.StudentRepository;
import com.bda.bda.repository.SubjectRepository;
import com.bda.bda.security.DbUserContext;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GradeService {
    private final GradeRepository    gradeRepository;
    private final StudentRepository  studentRepository;
    private final SubjectRepository  subjectRepository;
    private final DbUserContext      dbUserContext;

    public List<GradeResponse> findAll() {
        return gradeRepository.findAllWithDetails().stream().map(this::toResponse).toList();
    }

    public Page<GradeResponse> findAll(Pageable pageable) {
        return gradeRepository.findAll(pageable).map(grade -> new GradeResponse(
            grade.getStudent().getStudentId(),
            grade.getStudent().getFullName(),
            grade.getSubject().getSubjectId(),
            grade.getSubject().getLabel(),
            grade.getValue()
        ));
    }

    public List<GradeResponse> findByStudent(Integer studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new ResourceNotFoundException("student not found with id: " + studentId);
        }
        return gradeRepository.findAllByStudentId(studentId).stream().map(this::toResponse).toList();
    }

    public GradeResponse findById(Integer studentId, Integer subjectId) {
        return toResponse(getOrThrow(studentId, subjectId));
    }

    @Transactional
    public GradeResponse create(GradeRequest request) {
        dbUserContext.propagate();
        Student student = studentRepository.findById(request.studentId()).orElseThrow(() -> new ResourceNotFoundException("student not found with id: " + request.studentId()));
        Subject subject = subjectRepository.findById(request.subjectId()).orElseThrow(() -> new ResourceNotFoundException("subject not found with id: " + request.subjectId()));
        GradeId id = new GradeId(student.getStudentId(), subject.getSubjectId());
        if (gradeRepository.existsById(id)) {
            throw new GradeAlreadyExistsException("grade already exists for student " + request.studentId() + " and subject " + request.subjectId() + ". Use PUT to update");
        }

        Grade grade = Grade.builder().id(id).student(student).subject(subject).value(request.value()).build();
        return toResponse(gradeRepository.save(grade));
    }

    @Transactional
    public GradeResponse update(Integer studentId, Integer subjectId, GradeRequest request) {
        dbUserContext.propagate();
        Grade grade = getOrThrow(studentId, subjectId);
        grade.setValue(request.value());
        return toResponse(gradeRepository.save(grade));
    }

    @Transactional
    public void delete(Integer studentId, Integer subjectId) {
        dbUserContext.propagate();
        gradeRepository.delete(getOrThrow(studentId, subjectId));
    }
    private Grade getOrThrow(Integer studentId, Integer subjectId) {
        return gradeRepository.findByStudentIdAndSubjectId(studentId, subjectId).orElseThrow(() -> new ResourceNotFoundException("Grade not found for student " + studentId + " and subject " + subjectId));
    }


    private GradeResponse toResponse(Grade grade) {
        return new GradeResponse(grade.getStudent().getStudentId(), grade.getStudent().getFullName(), grade.getSubject().getSubjectId(), grade.getSubject().getLabel(), grade.getValue()
        );
    }
}