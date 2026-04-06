import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Grade } from '../../../../models/grade.model';
import { Student } from '../../../../models/student.model';
import { Subject } from '../../../../models/subject.model';
import { GradeService } from '../../../../services/grade.service';
import { StudentService } from '../../../../services/student.service';
import { SubjectService } from '../../../../services/subject.service';

interface GradeFormValue {
  studentId: number;
  subjectId: number;
  value: number;
}

@Component({
  selector: 'app-etudiant-grade-content',
  standalone: false,
  templateUrl: './etudiant-grade-content.component.html',
  styleUrl: './etudiant-grade-content.component.css',
})
export class EtudiantGradeContentComponent implements OnInit {
  readonly gradeForm;

  grades: Grade[] = [];
  students: Student[] = [];
  subjects: Subject[] = [];

  loadingGrades = true;
  searchTerm = '';
  gradesErrorMessage = '';

  isModalOpen = false;
  isSubmitting = false;
  modalErrorMessage = '';
  editingGrade: Grade | null = null;

  totalStudents = 0;
  totalSubjects = 0;
  globalAverage = 0;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly gradeService: GradeService,
    private readonly studentService: StudentService,
    private readonly subjectService: SubjectService,
  ) {
    this.gradeForm = this.formBuilder.nonNullable.group({
      studentId: [0, [Validators.required, Validators.min(1)]],
      subjectId: [0, [Validators.required, Validators.min(1)]],
      value: [
        0,
        [Validators.required, Validators.min(0), Validators.max(20)],
      ],
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  get displayedGrades(): Grade[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.grades;

    return this.grades.filter((g) => {
      return (
        String(g.studentId).toLowerCase().includes(term) ||
        (g.studentName ?? '').toLowerCase().includes(term) ||
        String(g.subjectId).toLowerCase().includes(term) ||
        (g.subjectLabel ?? '').toLowerCase().includes(term)
      );
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
  }

  refreshAll(): void {
    this.loadGrades();
    this.loadRefData();
  }

  openCreateModal(): void {
    this.editingGrade = null;
    this.modalErrorMessage = '';
    this.gradeForm.reset({ studentId: 0, subjectId: 0, value: 0 });
    this.gradeForm.controls.studentId.enable();
    this.gradeForm.controls.subjectId.enable();
    this.isModalOpen = true;
  }

  openEditModal(grade: Grade): void {
    this.editingGrade = grade;
    this.modalErrorMessage = '';
    this.gradeForm.reset({
      studentId: grade.studentId,
      subjectId: grade.subjectId,
      value: Number(grade.value),
    });
    this.gradeForm.controls.studentId.disable();
    this.gradeForm.controls.subjectId.disable();
    this.isModalOpen = true;
  }

  closeModal(): void {
    if (this.isSubmitting) return;
    this.isModalOpen = false;
    this.modalErrorMessage = '';
    this.gradeForm.controls.studentId.enable();
    this.gradeForm.controls.subjectId.enable();
  }

  submitGrade(): void {
    if (this.gradeForm.invalid || this.isSubmitting) {
      this.gradeForm.markAllAsTouched();
      return;
    }

    const raw = this.gradeForm.getRawValue() as GradeFormValue;
    const payload = {
      studentId: Number(raw.studentId),
      subjectId: Number(raw.subjectId),
      value: Number(raw.value),
    };

    if (!Number.isFinite(payload.value) || payload.value < 0 || payload.value > 20) {
      this.modalErrorMessage = 'La note doit être comprise entre 0 et 20.';
      return;
    }

    this.isSubmitting = true;
    this.modalErrorMessage = '';

    if (this.editingGrade) {
      this.gradeService
        .updateGrade(this.editingGrade.studentId, this.editingGrade.subjectId, payload)
        .subscribe({
          next: () => this.onSubmitSuccess(),
          error: (err: HttpErrorResponse) => this.onSubmitError(err),
        });
      return;
    }

    this.gradeService.createGrade(payload).subscribe({
      next: () => this.onSubmitSuccess(),
      error: (err: HttpErrorResponse) => this.onSubmitError(err),
    });
  }

  deleteGrade(grade: Grade): void {
    const confirmed = window.confirm(
      `Supprimer la note de ${grade.studentName} en ${grade.subjectLabel} ?`,
    );
    if (!confirmed) return;

    this.gradeService.deleteGrade(grade.studentId, grade.subjectId).subscribe({
      next: () => {
        this.loadGrades();
        this.loadRefData();
      },
      error: () => {
        this.gradesErrorMessage = 'Impossible de supprimer la note.';
      },
    });
  }

  private loadInitialData(): void {
    this.loadingGrades = true;

    forkJoin({
      studentStats: this.studentService.getStudentStats(),
      students: this.studentService.getStudents(0, 200),
      subjectsResponse: this.subjectService.getSubjects(0, 200),
    }).subscribe({
      next: ({ studentStats, students, subjectsResponse }) => {
        this.totalStudents = Number(studentStats.totalStudents ?? 0);
        this.globalAverage = Number(studentStats.globalAverage ?? 0);
        this.students = Array.isArray(students.content) ? students.content : [];

        if (Array.isArray(subjectsResponse)) {
          this.subjects = subjectsResponse;
          this.totalSubjects = subjectsResponse.length;
        } else {
          this.subjects = Array.isArray(subjectsResponse.content)
            ? subjectsResponse.content
            : [];
          this.totalSubjects = Number(
            subjectsResponse.totalElements ?? this.subjects.length,
          );
        }
      },
      error: () => {
        this.gradesErrorMessage = 'Impossible de charger les données de référence.';
      },
    });

    this.loadGrades();
  }

  private loadRefData(): void {
    forkJoin({
      studentStats: this.studentService.getStudentStats(),
      students: this.studentService.getStudents(0, 200),
      subjectsResponse: this.subjectService.getSubjects(0, 200),
    }).subscribe({
      next: ({ studentStats, students, subjectsResponse }) => {
        this.totalStudents = Number(studentStats.totalStudents ?? 0);
        this.globalAverage = Number(studentStats.globalAverage ?? 0);
        this.students = Array.isArray(students.content) ? students.content : [];

        if (Array.isArray(subjectsResponse)) {
          this.subjects = subjectsResponse;
          this.totalSubjects = subjectsResponse.length;
        } else {
          this.subjects = Array.isArray(subjectsResponse.content)
            ? subjectsResponse.content
            : [];
          this.totalSubjects = Number(
            subjectsResponse.totalElements ?? this.subjects.length,
          );
        }
      },
    });
  }

  private loadGrades(): void {
    this.loadingGrades = true;
    this.gradesErrorMessage = '';

    this.gradeService.getGrades().subscribe({
      next: (grades) => {
        this.grades = Array.isArray(grades) ? grades : [];
        this.loadingGrades = false;
      },
      error: () => {
        this.grades = [];
        this.loadingGrades = false;
        this.gradesErrorMessage = 'Impossible de charger les notes.';
      },
    });
  }

  private onSubmitSuccess(): void {
    this.isSubmitting = false;
    this.isModalOpen = false;
    this.editingGrade = null;
    this.gradeForm.controls.studentId.enable();
    this.gradeForm.controls.subjectId.enable();
    this.loadGrades();
    this.loadRefData();
  }

  private onSubmitError(error: HttpErrorResponse): void {
    this.isSubmitting = false;

    if (error.status === 409) {
      this.modalErrorMessage =
        'Cette note existe déjà pour cet étudiant et cette matière.';
      return;
    }
    if (error.status === 400) {
      this.modalErrorMessage = 'La note doit être comprise entre 0 et 20.';
      return;
    }
    this.modalErrorMessage = "Impossible d'enregistrer la note.";
  }
}