package com.bda.bda.repository;

import com.bda.bda.model.Subject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Integer> {
    boolean existsByLabelIgnoreCase(String label);

    Page<Subject> findByLabelContainingIgnoreCase(String label, Pageable pageable);

    Page<Subject> findByLabelContainingIgnoreCaseAndCoefficientGreaterThanEqual(String label, BigDecimal minCoefficient, Pageable pageable);

    @Query("select coalesce(avg(s.coefficient), 0) from Subject s")
    Number getAverageCoefficient();
}