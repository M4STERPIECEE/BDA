import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AuditEntry, AuditStats } from '../../../../models/audit.model';
import { Grade } from '../../../../models/grade.model';
import { Student } from '../../../../models/student.model';
import { Subject } from '../../../../models/subject.model';
import { AuditService } from '../../../../services/audit.service';
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
  auditEntries: AuditEntry[] = [];
  auditStats: AuditStats = {
    insertCount: 0,
    updateCount: 0,
    deleteCount: 0,
    totalCount: 0,
  };

  students: Student[] = [];
  subjects: Subject[] = [];

  loadingGrades = true;
  loadingAudit = true;
  searchTerm = '';
  gradesErrorMessage = '';
  auditErrorMessage = '';

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
    private readonly auditService: AuditService,
    private readonly studentService: StudentService,
    private readonly subjectService: SubjectService,
  ) {
    this.gradeForm = this.formBuilder.nonNullable.group({
      studentId: [0, [Validators.required, Validators.min(1)]],
      subjectId: [0, [Validators.required, Validators.min(1)]],
      value: [0, [Validators.required, Validators.min(0), Validators.max(20)]],
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  get displayedGrades(): Grade[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      return this.grades;
    }

    return this.grades.filter((grade) => {
      const studentId = String(grade.studentId).toLowerCase();
      const studentName = (grade.studentName ?? '').toLowerCase();
      const subjectId = String(grade.subjectId).toLowerCase();
      const subjectLabel = (grade.subjectLabel ?? '').toLowerCase();
      return (
        studentId.includes(term) ||
        studentName.includes(term) ||
        subjectId.includes(term) ||
        subjectLabel.includes(term)
      );
    });
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
  }

  refreshAll(): void {
    this.loadGrades();
    this.loadAudit();
    this.loadStats();
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
    if (this.isSubmitting) {
      return;
    }
    this.isModalOpen = false;
    this.modalErrorMessage = '';
  }

  submitGrade(): void {
    if (this.gradeForm.invalid || this.isSubmitting) {
      this.gradeForm.markAllAsTouched();
      return;
    }

    const formValue = this.gradeForm.getRawValue() as GradeFormValue;
    const payload = {
      studentId: Number(formValue.studentId),
      subjectId: Number(formValue.subjectId),
      value: Number(formValue.value),
    };

    if (!Number.isFinite(payload.value) || payload.value < 0 || payload.value > 20) {
      this.modalErrorMessage = 'La note doit etre comprise entre 0 et 20.';
      return;
    }

    this.isSubmitting = true;
    this.modalErrorMessage = '';

    if (this.editingGrade) {
      this.gradeService
        .updateGrade(this.editingGrade.studentId, this.editingGrade.subjectId, payload)
        .subscribe({
          next: () => this.onSubmitSuccess(),
          error: (error: HttpErrorResponse) => this.onSubmitError(error),
        });
      return;
    }

    this.gradeService.createGrade(payload).subscribe({
      next: () => this.onSubmitSuccess(),
      error: (error: HttpErrorResponse) => this.onSubmitError(error),
    });
  }

  deleteGrade(grade: Grade): void {
    const confirmed = window.confirm(
      `Supprimer la note de ${grade.studentName} pour ${grade.subjectLabel} ?`,
    );
    if (!confirmed) {
      return;
    }

    this.gradeService.deleteGrade(grade.studentId, grade.subjectId).subscribe({
      next: () => {
        this.loadGrades();
        this.loadAudit();
        this.loadStats();
      },
      error: () => {
        this.gradesErrorMessage = 'Impossible de supprimer la note.';
      },
    });
  }

  formatNote(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return '-';
    }
    return Number(value).toFixed(2);
  }

  trackAuditById(_: number, item: AuditEntry): number {
    return item.auditId;
  }

  private loadInitialData(): void {
    this.loadingGrades = true;
    this.loadingAudit = true;

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
          this.totalSubjects = Number(subjectsResponse.totalElements ?? this.subjects.length);
        }
      },
      error: () => {
        this.gradesErrorMessage = 'Impossible de charger les donnees de reference.';
      },
    });

    this.loadGrades();
    this.loadAudit();
    this.loadStats();
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

  private loadAudit(): void {
    this.loadingAudit = true;
    this.auditErrorMessage = '';

    this.auditService.getAuditEntries().subscribe({
      next: (entries) => {
        this.auditEntries = Array.isArray(entries) ? entries : [];
        this.loadingAudit = false;
      },
      error: (error: HttpErrorResponse) => {
        this.auditEntries = [];
        this.loadingAudit = false;
        if (error.status === 403) {
          this.auditErrorMessage = 'Audit reserve au role ADMIN.';
          return;
        }
        this.auditErrorMessage = 'Impossible de charger les traces d\'audit.';
      },
    });
  }

  private loadStats(): void {
    this.auditService.getAuditStats().subscribe({
      next: (stats) => {
        this.auditStats = {
          insertCount: Number(stats.insertCount ?? 0),
          updateCount: Number(stats.updateCount ?? 0),
          deleteCount: Number(stats.deleteCount ?? 0),
          totalCount: Number(stats.totalCount ?? 0),
        };
      },
      error: (error: HttpErrorResponse) => {
        this.auditStats = {
          insertCount: 0,
          updateCount: 0,
          deleteCount: 0,
          totalCount: 0,
        };

        if (error.status === 403) {
          this.auditErrorMessage = 'Audit reserve au role ADMIN.';
        }
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
    this.loadAudit();
    this.loadStats();
  }

  private onSubmitError(error: HttpErrorResponse): void {
    this.isSubmitting = false;

    if (error.status === 409) {
      this.modalErrorMessage = 'Cette note existe deja pour cet etudiant et cette matiere.';
      return;
    }

    if (error.status === 400) {
      this.modalErrorMessage = 'La note doit etre comprise entre 0 et 20.';
      return;
    }

    this.modalErrorMessage = 'Impossible d\'enregistrer la note.';
  }
}
