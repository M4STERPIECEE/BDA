import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
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

@Component({
  selector: 'app-etudiant-students-content',
  standalone: false,
  templateUrl: './etudiant-students-content.component.html',
  styleUrl: './etudiant-students-content.component.css',
})
export class EtudiantStudentsContentComponent implements OnInit, OnDestroy {
  private readonly studentsCacheKey = 'bda_students_cache_v1';
  private toastTimeoutId: ReturnType<typeof setTimeout> | null = null;

  students: Student[] = [];
  loading = true;
  errorMessage = '';
  isCreateModalOpen = false;
  isSubmitting = false;
  createErrorMessage = '';
  successToastMessage = '';
  readonly studentForm;

  readonly tableHeaders: TableHeader[] = [
    { label: 'ID étudiant' },
    { label: 'Nom complet' },
    { label: 'Moyenne (/20)' },
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
      this.loadStudents(false);
      return;
    }

    this.loadStudents(true);
  }

  ngOnDestroy(): void {
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }
  }

  private loadStudents(showLoader: boolean): void {
    this.loading = showLoader;
    if (showLoader) {
      this.errorMessage = '';
    }

    this.studentService.getStudents().subscribe({
      next: (data: Student[]) => {
        this.students = data;
        this.writeStudentsCache(data);
        this.loading = false;
      },
      error: () => {
        if (this.students.length === 0) {
          this.errorMessage = 'Impossible de charger les etudiants.';
        }
        this.loading = false;
      },
    });
  }

  openCreateModal(): void {
    this.isCreateModalOpen = true;
    this.createErrorMessage = '';
    this.studentForm.reset({ fullName: '' });
  }

  closeCreateModal(): void {
    if (this.isSubmitting) {
      return;
    }

    this.isCreateModalOpen = false;
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

    this.studentService.createStudent({ fullName }).subscribe({
      next: (createdStudent: Student) => {
        this.isSubmitting = false;
        this.isCreateModalOpen = false;
        this.studentForm.reset({ fullName: '' });

        // Instant feedback in table, then silent sync with backend ordering/state.
        this.students = [createdStudent, ...this.students];
        this.writeStudentsCache(this.students);
        this.showSuccessToast('Etudiant ajoute avec succes.');
        this.loadStudents(false);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        if (error.status === 409) {
          this.createErrorMessage = 'Cet etudiant existe deja.';
          return;
        }

        this.createErrorMessage = "Impossible d'ajouter l'etudiant.";
      },
    });
  }

  get totalStudents(): number {
    return this.students.length;
  }

  get globalAverage(): number {
    if (this.students.length === 0) {
      return 0;
    }
    const sum = this.students.reduce((acc, student) => acc + Number(student.average ?? 0), 0);
    return sum / this.students.length;
  }

  get studentsInAlert(): number {
    return this.students.filter((student) => Number(student.average ?? 0) < 10).length;
  }

  get kpiCards(): KpiCard[] {
    return [
      {
        label: 'Total Étudiants',
        value: String(this.totalStudents),
        icon: 'groups',
        cardClass: 'kpi-card kpi-blue',
        iconClass: 'material-symbols-outlined',
        valueClass: 'kpi-value',
      },
      {
        label: 'Moyenne Générale',
        value: this.formatAverage(this.globalAverage),
        unit: '/20',
        icon: 'trending_up',
        cardClass: 'kpi-card kpi-violet',
        iconClass: 'material-symbols-outlined',
        valueClass: 'kpi-value',
        unitClass: 'kpi-unit',
      },
      {
        label: 'En Alerte',
        value: String(this.studentsInAlert),
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
    }, 2600);
  }
}

