package com.bda.bda.service;

import com.bda.bda.dto.request.SubjectRequest;
import com.bda.bda.dto.response.SubjectResponse;
import com.bda.bda.dto.response.SubjectStatsResponse;
import com.bda.bda.exception.ResourceNotFoundException;
import com.bda.bda.exception.SubjectAlreadyExistsException;
import com.bda.bda.model.Subject;
import com.bda.bda.repository.SubjectRepository;
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
public class SubjectService {
    private final SubjectRepository subjectRepository;

    public Page<SubjectResponse> findAll(Pageable pageable, String search, BigDecimal minCoefficient) {
        String normalizedSearch = search == null ? "" : search.trim();

        if (minCoefficient != null) {
            return subjectRepository
                    .findByLabelContainingIgnoreCaseAndCoefficientGreaterThanEqual(normalizedSearch, minCoefficient, pageable)
                    .map(this::toResponse);
        }
        return subjectRepository.findByLabelContainingIgnoreCase(normalizedSearch, pageable).map(this::toResponse);
    }

    public SubjectStatsResponse getStats() {
        Number averageAggregate = subjectRepository.getAverageCoefficient();
        double averageValue = averageAggregate == null ? 0d : averageAggregate.doubleValue();
        return new SubjectStatsResponse(subjectRepository.count(),BigDecimal.valueOf(averageValue).setScale(2, RoundingMode.HALF_UP)
        );
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