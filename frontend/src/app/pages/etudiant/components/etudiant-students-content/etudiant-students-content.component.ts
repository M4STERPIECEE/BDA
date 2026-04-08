import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, Validators } from '@angular/forms';

import { Student } from '../../../../models/student.model';
import { StudentService } from '../../../../services/student.service';

interface KpiCard {
  label: string;
  value: string;
  icon: string;
  cardClass: string;
  iconClass: string;
  valueClass: string;
  unit?: string;
  unitClass?: string;
}

interface TableHeader {
  label: string;
  className?: string;
}

interface RowAction {
  title: string;
  icon: string;
  className: string;
}

interface StudentStatsResponse {
  totalStudents: number;
  globalAverage: number;
  studentsInAlert: number;
}

@Component({
  selector: 'app-etudiant-students-content',
  standalone: false,
  templateUrl: './etudiant-students-content.component.html',
  styleUrl: './etudiant-students-content.component.css',
})
export class EtudiantStudentsContentComponent implements OnInit, OnDestroy {
  private readonly studentsCacheKey = 'bda_students_cache_v2';
  private readonly pageSize = 5;
  private toastTimeoutId: ReturnType<typeof setTimeout> | null = null;

  students: Student[] = [];
  statsTotalStudents = 0;
  statsGlobalAverage = 0;
  statsStudentsInAlert = 0;
  currentPage = 0;
  totalPages = 0;
  loading = true;
  errorMessage = '';
  isCreateModalOpen = false;
  isDeleteConfirmOpen = false;
  isSubmitting = false;
  isDeletingStudent = false;
  createErrorMessage = '';
  deleteErrorMessage = '';
  successToastMessage = '';
  editingStudentId: number | null = null;
  editingStudentCode = '';
  studentPendingDelete: Student | null = null;
  readonly studentForm;

  readonly tableHeaders: TableHeader[] = [
    { label: 'N° étudiant' },
    { label: 'Nom complet' },
    { label: 'Moyenne (/20)', className: 'text-center' },
    { label: 'Actions', className: 'text-right' },
  ];

  readonly rowActions: RowAction[] = [
    {
      title: 'Voir',
      icon: 'visibility',
      className: 'action-btn action-view',
    },
    {
      title: 'Modifier',
      icon: 'edit',
      className: 'action-btn action-edit',
    },
    {
      title: 'Supprimer',
      icon: 'delete',
      className: 'action-btn action-delete',
    },
  ];

  constructor(
    private readonly studentService: StudentService,
    private readonly formBuilder: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.studentForm = this.formBuilder.nonNullable.group({
      fullName: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }

  ngOnInit(): void {
    const cachedStudents = this.readStudentsCache();
    if (cachedStudents.length > 0) {
      this.students = cachedStudents;
      this.loading = false;
      this.loadStudents(this.currentPage, false);
    } else {
      this.loadStudents(this.currentPage, true);
    }

    this.loadStats();
  }

  ngOnDestroy(): void {
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }
  }

  openCreateModal(): void {
    this.isCreateModalOpen = true;
    this.editingStudentId = null;
    this.editingStudentCode = '';
    this.createErrorMessage = '';
    this.studentForm.reset({ fullName: '' });
  }

  openEditModal(student: Student): void {
    this.isCreateModalOpen = true;
    this.editingStudentId = Number(student.studentId);
    this.editingStudentCode = student.studentCode || ('#' + student.studentId);
    this.createErrorMessage = '';
    this.studentForm.reset({ fullName: (student.fullName ?? '').trim() });
  }

  openDeleteConfirmModal(student: Student): void {
    this.studentPendingDelete = student;
    this.deleteErrorMessage = '';
    this.isDeleteConfirmOpen = true;
  }

  closeDeleteConfirmModal(): void {
    if (this.isDeletingStudent) {
      return;
    }

    this.isDeleteConfirmOpen = false;
    this.studentPendingDelete = null;
    this.deleteErrorMessage = '';
  }

  confirmDeleteStudent(): void {
    if (this.isDeletingStudent || !this.studentPendingDelete) {
      return;
    }

    const target = this.studentPendingDelete;
    this.isDeletingStudent = true;
    this.deleteErrorMessage = '';

    this.studentService.deleteStudent(target.studentId).subscribe({
      next: () => {
        const shouldGoPreviousPage = this.students.length === 1 && this.currentPage > 0;
        this.isDeletingStudent = false;
        this.isDeleteConfirmOpen = false;
        this.studentPendingDelete = null;
        this.showSuccessToast('Etudiant supprime avec succes.');
        this.loadStudents(shouldGoPreviousPage ? this.currentPage - 1 : this.currentPage, false);
        this.loadStats();
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.isDeletingStudent = false;
        if (error.status === 404) {
          this.deleteErrorMessage = 'Etudiant introuvable.';
          this.cdr.detectChanges();
          return;
        }
        this.deleteErrorMessage = "Impossible de supprimer l'etudiant.";
        this.cdr.detectChanges();
      },
    });
  }

  onRowActionClick(action: RowAction, student: Student): void {
    if (action.icon === 'edit') {
      this.openEditModal(student);
      return;
    }

    if (action.icon === 'delete') {
      this.openDeleteConfirmModal(student);
      return;
    }

    this.showSuccessToast('Visualisation non implémentée pour le moment.');
  }

  closeCreateModal(): void {
    if (this.isSubmitting) {
      return;
    }

    this.isCreateModalOpen = false;
    this.editingStudentId = null;
    this.editingStudentCode = '';
    this.createErrorMessage = '';
    this.studentForm.reset({ fullName: '' });
  }

  submitCreateStudent(): void {
    if (this.studentForm.invalid || this.isSubmitting) {
      this.studentForm.markAllAsTouched();
      return;
    }

    const fullName = this.studentForm.controls.fullName.value.trim();
    if (!fullName) {
      this.studentForm.controls.fullName.setErrors({ required: true });
      return;
    }

    this.isSubmitting = true;
    this.createErrorMessage = '';

    const isEditMode = this.editingStudentId !== null;
    const request$ = isEditMode
      ? this.studentService.updateStudent(this.editingStudentId as number, { fullName })
      : this.studentService.createStudent({ fullName });

    request$.subscribe({
      next: (resultStudent: Student) => {
        this.isSubmitting = false;
        this.isCreateModalOpen = false;
        this.editingStudentId = null;
        this.editingStudentCode = '';
        this.studentForm.reset({ fullName: '' });

        this.showSuccessToast(isEditMode ? 'Etudiant modifie avec succes.' : 'Etudiant ajoute avec succes.');

        if (isEditMode) {
          this.students = this.students.map((s) =>
            s.studentId === resultStudent.studentId ? resultStudent : s,
          );
        } else {
          this.students = [resultStudent, ...this.students].slice(0, this.pageSize);
          this.statsTotalStudents = Math.max(this.statsTotalStudents + 1, this.students.length);
          this.currentPage = 0;
        }

        this.totalPages = Math.max(this.totalPages, Math.ceil(this.statsTotalStudents / this.pageSize));
        this.writeStudentsCache(this.students);
        this.loadStudents(this.currentPage, false);
        this.loadStats();
        this.cdr.detectChanges();
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        if (error.status === 409) {
          this.createErrorMessage = 'Cet etudiant existe deja.';
          this.cdr.detectChanges();
          return;
        }

        if (error.status === 404 && isEditMode) {
          this.createErrorMessage = 'Etudiant introuvable.';
          this.cdr.detectChanges();
          return;
        }

        this.createErrorMessage = isEditMode
          ? "Impossible de modifier l'etudiant."
          : "Impossible d'ajouter l'etudiant.";
        this.cdr.detectChanges();
      },
    });
  }

  loadPage(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.currentPage) {
      return;
    }

    this.loadStudents(page, true);
  }

  refreshStudents(): void {
    this.loadStudents(this.currentPage, true);
    this.loadStats();
  }

  get pages(): number[] {
    const visiblePageCount = this.totalPages > 0 ? this.totalPages : (this.students.length > 0 ? 1 : 0);
    return Array.from({ length: visiblePageCount }, (_, index) => index);
  }

  get displayedTotalStudents(): number {
    return Math.max(this.statsTotalStudents, this.students.length);
  }

  get kpiCards(): KpiCard[] {
    return [
      {
        label: 'Total Étudiants',
        value: String(this.displayedTotalStudents),
        icon: 'groups',
        cardClass: 'kpi-card kpi-blue',
        iconClass: 'material-symbols-outlined',
        valueClass: 'kpi-value',
      },
      {
        label: 'Moyenne Générale',
        value: this.formatAverage(this.statsGlobalAverage),
        unit: '/20',
        icon: 'trending_up',
        cardClass: 'kpi-card kpi-violet',
        iconClass: 'material-symbols-outlined',
        valueClass: 'kpi-value',
        unitClass: 'kpi-unit',
      },
      {
        label: 'En Alerte',
        value: String(this.statsStudentsInAlert),
        icon: 'warning',
        cardClass: 'kpi-card kpi-red',
        iconClass: 'material-symbols-outlined',
        valueClass: 'kpi-value',
      },
    ];
  }

  formatAverage(value: number): string {
    return Number(value ?? 0).toFixed(2);
  }

  private loadStudents(page: number, showLoader: boolean): void {
    this.loading = showLoader;
    if (showLoader) {
      this.errorMessage = '';
    }

    this.studentService.getStudents(page, this.pageSize).subscribe({
      next: (response) => {
        this.students = response.content;
        this.currentPage = Number.isInteger(response.number) ? response.number : page;
        this.statsTotalStudents = Number(response.totalElements ?? response.content.length ?? 0);
        const hasStudents = response.content.length > 0;
        this.totalPages = Math.max(Number(response.totalPages ?? 0), hasStudents ? 1 : 0);
        this.writeStudentsCache(response.content);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.statsTotalStudents = Math.max(this.statsTotalStudents, this.students.length);
        if (this.students.length > 0) {
          this.totalPages = Math.max(this.totalPages, 1);
        }
        if (this.students.length === 0) {
          this.errorMessage = 'Impossible de charger les etudiants.';
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  private loadStats(): void {
    this.studentService.getStudentStats().subscribe({
      next: (stats: StudentStatsResponse) => {
        this.statsTotalStudents = Number(stats.totalStudents ?? this.statsTotalStudents);
        this.statsGlobalAverage = Number(stats.globalAverage ?? 0);
        this.statsStudentsInAlert = Number(stats.studentsInAlert ?? 0);
        this.totalPages = Math.max(this.totalPages, Math.ceil(this.statsTotalStudents / this.pageSize));
        this.cdr.detectChanges();
      },
      error: () => {
        this.cdr.detectChanges();
      },
    });
  }

  private readStudentsCache(): Student[] {
    const rawCache = localStorage.getItem(this.studentsCacheKey);
    if (!rawCache) {
      return [];
    }

    try {
      const parsed = JSON.parse(rawCache) as { timestamp: number; students: Student[] };
      const tenMinutesMs = 10 * 60 * 1000;
      if (!parsed?.timestamp || Date.now() - parsed.timestamp > tenMinutesMs) {
        localStorage.removeItem(this.studentsCacheKey);
        return [];
      }

      return Array.isArray(parsed.students) ? parsed.students : [];
    } catch {
      localStorage.removeItem(this.studentsCacheKey);
      return [];
    }
  }

  private writeStudentsCache(students: Student[]): void {
    localStorage.setItem(
      this.studentsCacheKey,
      JSON.stringify({
        timestamp: Date.now(),
        students,
      }),
    );
  }

  private showSuccessToast(message: string): void {
    this.successToastMessage = message;
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }

    this.toastTimeoutId = setTimeout(() => {
      this.successToastMessage = '';
      this.toastTimeoutId = null;
    }, 1500);
  }
}
