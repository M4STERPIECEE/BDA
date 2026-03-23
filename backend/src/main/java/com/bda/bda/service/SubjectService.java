package com.bda.bda.service;

import com.bda.bda.dto.request.SubjectRequest;
import com.bda.bda.dto.response.SubjectResponse;
import com.bda.bda.exception.ResourceNotFoundException;
import com.bda.bda.exception.SubjectAlreadyExistsException;
import com.bda.bda.model.Subject;
import com.bda.bda.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubjectService {
    private final SubjectRepository subjectRepository;

    public List<SubjectResponse> findAll() {
        return subjectRepository.findAll().stream().map(this::toResponse).toList();
    }

    public SubjectResponse findById(Integer id) {
        return toResponse(getOrThrow(id));
    }

    @Transactional
    public SubjectResponse create(SubjectRequest request) {
        if (subjectRepository.existsByLabelIgnoreCase(request.label())) {
            throw new SubjectAlreadyExistsException("Subject already exists with label: " + request.label());
        }
        Subject subject = Subject.builder().label(request.label()).coefficient(request.coefficient()).build();
        return toResponse(subjectRepository.save(subject));
    }

    @Transactional
    public SubjectResponse update(Integer id, SubjectRequest request) {
        Subject subject = getOrThrow(id);
        if (!subject.getLabel().equalsIgnoreCase(request.label()) && subjectRepository.existsByLabelIgnoreCase(request.label())) {
            throw new SubjectAlreadyExistsException("Another subject already exists with label: " + request.label());
        }
        subject.setLabel(request.label());
        subject.setCoefficient(request.coefficient());
        return toResponse(subjectRepository.save(subject));
    }

    @Transactional
    public void delete(Integer id) {
        subjectRepository.delete(getOrThrow(id));
    }

    private Subject getOrThrow(Integer id) {
        return subjectRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Subject not found with id: " + id));
    }

    private SubjectResponse toResponse(Subject s) {
        return new SubjectResponse(s.getSubjectId(), s.getLabel(), s.getCoefficient());
    }
}