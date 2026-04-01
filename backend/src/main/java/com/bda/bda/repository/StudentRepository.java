package com.bda.bda.repository;

import com.bda.bda.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;

@Repository
public interface StudentRepository extends JpaRepository<Student, Integer> {
    boolean existsByFullNameIgnoreCase(String fullName);

    @Query("select coalesce(avg(s.average), 0) from Student s")
    Number getAverageOfAllStudents();

    long countByAverageLessThan(BigDecimal average);
}