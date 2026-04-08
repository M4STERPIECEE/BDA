import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject, forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { Grade } from '../../../../models/grade.model';
import { Student } from '../../../../models/student.model';
import { Subject as SubjectModel } from '../../../../models/subject.model';
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
export class EtudiantGradeContentComponent implements OnInit, OnDestroy {
  readonly gradeForm;
  readonly pageSize = 5;
  readonly studentCodeYear = new Date().getFullYear();

  grades: Grade[] = [];
  students: Student[] = [];
  subjects: SubjectModel[] = [];

  loadingGrades = true;
  searchTerm = '';
  gradesErrorMessage = '';
  refDataErrorMessage = '';

  isModalOpen = false;
  isSubmitting = false;
  modalErrorMessage = '';
  successToastMessage = '';
  isDeleteConfirmOpen = false;
  isDeletingGrade = false;
  deleteErrorMessage = '';
  editingGrade: Grade | null = null;
  gradePendingDelete: Grade | null = null;

  isStudentDropdownOpen = false;
  isSubjectDropdownOpen = false;

  totalStudents = 0;
  totalSubjects = 0;
  globalAverage = 0;

  currentPage = 0;
  totalPages = 0;
  totalElements = 0;

  // ✅ FIX: Subject de destruction pour annuler tous les observables
  private readonly destroy$ = new Subject<void>();
  private toastTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly gradeService: GradeService,
    private readonly studentService: StudentService,
    private readonly subjectService: SubjectService,
    private readonly cdr: ChangeDetectorRef,
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

  // ✅ FIX: Nettoyage propre à la destruction du composant
  ngOnDestroy(): void {
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }
    this.destroy$.next();
    this.destroy$.complete();
  }

  get displayedGrades(): Grade[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.grades;

    return this.grades.filter((g) =>
      String(g.studentId).toLowerCase().includes(term) ||
      this.formatStudentDisplayId(g.studentId).toLowerCase().includes(term) ||
      (g.studentName ?? '').toLowerCase().includes(term) ||
      String(g.subjectId).toLowerCase().includes(term) ||
      this.formatSubjectDisplayId(g.subjectId).toLowerCase().includes(term) ||
      (g.subjectLabel ?? '').toLowerCase().includes(term)
    );
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
  }

  getSubjectCoefficient(subjectId: number): string {
    const expectedId = Number(subjectId);
    const subject = this.subjects.find(
      (item) => this.parseSubjectId(item.subjectId) === expectedId
    );
    if (!subject || subject.coefficient == null) return '-';
    return Number(subject.coefficient).toFixed(2);
  }

  get selectedSubjectCoefficient(): string {
    const selectedSubjectId = this.gradeForm.controls.subjectId.value;
    if (!selectedSubjectId || Number(selectedSubjectId) <= 0) return '-';
    return this.getSubjectCoefficient(Number(selectedSubjectId));
  }

  loadPage(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.currentPage) return;
    this.loadGrades(page);
  }

  get pages(): number[] {
    const count = this.totalPages > 0 ? this.totalPages : this.grades.length > 0 ? 1 : 0;
    return Array.from({ length: count }, (_, i) => i);
  }

  refreshAll(): void {
    this.loadGrades(this.currentPage);
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

  get selectedStudentLabel(): string {
    const id = Number(this.gradeForm.controls.studentId.value);
    if (!id || id <= 0) return 'Choisir un étudiant';
    const s = this.students.find((x) => Number(x.studentId) === id);
    return s ? s.fullName : 'Choisir un étudiant';
  }

  get selectedSubjectLabel(): string {
    const id = Number(this.gradeForm.controls.subjectId.value);
    if (!id || id <= 0) return 'Choisir une matière';
    const s = this.subjects.find((x) => this.parseSubjectId(x.subjectId) === id);
    return s ? s.label : 'Choisir une matière';
  }

  toggleStudentDropdown(): void {
    if (this.gradeForm.controls.studentId.disabled) return;
    this.isStudentDropdownOpen = !this.isStudentDropdownOpen;
    this.isSubjectDropdownOpen = false;
  }

  toggleSubjectDropdown(): void {
    if (this.gradeForm.controls.subjectId.disabled) return;
    this.isSubjectDropdownOpen = !this.isSubjectDropdownOpen;
    this.isStudentDropdownOpen = false;
  }

  selectStudent(id: number): void {
    this.gradeForm.patchValue({ studentId: id });
    this.gradeForm.controls.studentId.markAsTouched();
    this.isStudentDropdownOpen = false;
  }

  selectSubject(id: string | number): void {
    const subjectId = typeof id === 'string' ? this.parseSubjectId(id) : id;
    this.gradeForm.patchValue({ subjectId });
    this.gradeForm.controls.subjectId.markAsTouched();
    this.isSubjectDropdownOpen = false;
  }

  isSubjectActive(id: string | number): boolean {
    const subjectId = typeof id === 'string' ? this.parseSubjectId(id) : id;
    return this.gradeForm.controls.subjectId.value === subjectId;
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

    // ✅ FIX: finalize() garantit que isSubmitting repasse à false TOUJOURS
    const request$ = this.editingGrade
      ? this.gradeService.updateGrade(
          this.editingGrade.studentId,
          this.editingGrade.subjectId,
          payload
        )
      : this.gradeService.createGrade(payload);

    request$
      .pipe(
        finalize(() => {
          this.isSubmitting = false; // ✅ toujours exécuté, succès ou erreur
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => this.onSubmitSuccess(),
        error: (err: HttpErrorResponse) => this.onSubmitError(err),
      });
  }

  deleteGrade(grade: Grade): void {
    this.gradePendingDelete = grade;
    this.deleteErrorMessage = '';
    this.isDeleteConfirmOpen = true;
  }

  closeDeleteConfirmModal(): void {
    if (this.isDeletingGrade) return;

    this.isDeleteConfirmOpen = false;
    this.gradePendingDelete = null;
    this.deleteErrorMessage = '';
  }

  confirmDeleteGrade(): void {
    if (this.isDeletingGrade || !this.gradePendingDelete) return;

    const target = this.gradePendingDelete;
    this.isDeletingGrade = true;
    this.deleteErrorMessage = '';

    this.gradeService
      .deleteGrade(target.studentId, target.subjectId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          const shouldGoPreviousPage = this.grades.length === 1 && this.currentPage > 0;

          this.isDeletingGrade = false;
          this.isDeleteConfirmOpen = false;
          this.gradePendingDelete = null;
          this.successToastMessage = 'Note supprimée avec succès.';
          if (this.toastTimeoutId) {
            clearTimeout(this.toastTimeoutId);
          }
          this.toastTimeoutId = setTimeout(() => {
            this.successToastMessage = '';
          }, 2600);

          this.loadGrades(shouldGoPreviousPage ? this.currentPage - 1 : this.currentPage, false);
          this.loadRefData();
        },
        error: (error: HttpErrorResponse) => {
          this.isDeletingGrade = false;

          if (error.status === 404) {
            this.deleteErrorMessage = 'Note introuvable.';
            return;
          }

          this.deleteErrorMessage = 'Impossible de supprimer la note.';
        },
      });
  }

  private loadInitialData(): void {
    this.refDataErrorMessage = '';

    forkJoin({
      studentStats: this.studentService.getStudentStats(),
      students: this.studentService.getStudents(0, 200),
      subjectsResponse: this.subjectService.getSubjects(0, 200),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
              subjectsResponse.totalElements ?? this.subjects.length
            );
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.students = [];
          this.subjects = [];
          this.totalSubjects = 0;
          this.refDataErrorMessage =
            "Certaines données de référence n'ont pas pu être chargées.";
          this.cdr.detectChanges();
        },
      });

    // ✅ FIX: loadGrades gère son propre loadingGrades avec finalize
    this.loadGrades();
  }

  private loadRefData(): void {
    this.refDataErrorMessage = '';

    forkJoin({
      studentStats: this.studentService.getStudentStats(),
      students: this.studentService.getStudents(0, 200),
      subjectsResponse: this.subjectService.getSubjects(0, 200),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
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
              subjectsResponse.totalElements ?? this.subjects.length
            );
          }
          this.cdr.detectChanges();
        },
        error: () => {
          this.refDataErrorMessage =
            "Certaines données de référence n'ont pas pu être actualisées.";
          this.cdr.detectChanges();
        },
      });
  }

  // ✅ FIX: finalize() garantit que loadingGrades repasse à false TOUJOURS
  private loadGrades(page: number = 0, showLoader: boolean = true): void {
    if (showLoader) {
      this.loadingGrades = true;
    }
    this.gradesErrorMessage = '';

    this.gradeService
      .getGrades(page, this.pageSize)
      .pipe(
        finalize(() => {
          this.loadingGrades = false; // ✅ toujours exécuté même si erreur réseau
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          this.grades = Array.isArray(response.content) ? response.content : [];
          this.currentPage = Number(response.number ?? 0);
          this.totalPages = Number(response.totalPages ?? 0);
          this.totalElements = Number(response.totalElements ?? 0);
          this.cdr.detectChanges();
        },
        error: () => {
          this.grades = [];
          this.gradesErrorMessage = 'Impossible de charger les notes.';
          this.cdr.detectChanges();
        },
      });
  }

  private onSubmitSuccess(): void {
    const wasEdit = !!this.editingGrade;

    // isSubmitting est déjà géré par finalize()
    this.isModalOpen = false;
    this.editingGrade = null;
    this.gradeForm.controls.studentId.enable();
    this.gradeForm.controls.subjectId.enable();

    this.successToastMessage = wasEdit
      ? 'Note modifiée avec succès.'
      : 'Note ajoutée avec succès.';
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }
    this.toastTimeoutId = setTimeout(() => {
      this.successToastMessage = '';
    }, 2600);

    this.loadGrades(this.currentPage, false);
    this.loadRefData();
  }

  private onSubmitError(error: HttpErrorResponse): void {
    // isSubmitting est déjà géré par finalize()
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

  private parseSubjectId(subjectId: string | number): number {
    const normalized = String(subjectId ?? '').trim().toUpperCase();
    const match = normalized.match(/^(?:MAT)?0*(\d+)$/);
    if (!match) return Number.NaN;
    return Number(match[1]);
  }

  formatStudentDisplayId(studentId: string | number): string {
    const id = Number(studentId);
    if (!Number.isFinite(id) || id <= 0) {
      return String(studentId ?? '-');
    }

    return `ETU${this.studentCodeYear}${Math.trunc(id).toString().padStart(3, '0')}`;
  }

  formatSubjectDisplayId(subjectId: string | number): string {
    const id = this.parseSubjectId(subjectId);
    if (!Number.isFinite(id) || id <= 0) {
      const fallback = String(subjectId ?? '').trim();
      return fallback || '-';
    }

    return `MAT${Math.trunc(id).toString().padStart(3, '0')}`;
  }
}