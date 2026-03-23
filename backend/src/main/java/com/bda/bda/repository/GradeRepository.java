package com.bda.bda.repository;

import com.bda.bda.model.Grade;
import com.bda.bda.model.GradeId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface GradeRepository extends JpaRepository<Grade, GradeId> {

    @Query("SELECT g FROM Grade g JOIN FETCH g.student JOIN FETCH g.subject WHERE g.student.studentId = :studentId")
    List<Grade> findAllByStudentId(@Param("studentId") Integer studentId);

    @Query("SELECT g FROM Grade g JOIN FETCH g.student JOIN FETCH g.subject WHERE g.subject.subjectId = :subjectId")
    List<Grade> findAllBySubjectId(@Param("subjectId") Integer subjectId);

    @Query("SELECT g FROM Grade g JOIN FETCH g.student JOIN FETCH g.subject")
    List<Grade> findAllWithDetails();
}