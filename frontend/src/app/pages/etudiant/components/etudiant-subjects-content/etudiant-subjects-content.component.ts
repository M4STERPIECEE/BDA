import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Subject } from '../../../../models/subject.model';
import { SubjectService, SubjectsApiResponse } from '../../../../services/subject.service';

interface KpiCard {
  label: string;
  value: string;
  icon: string;
  cardClass: string;
  iconClass: string;
  valueClass: string;
  footerIcon?: string;
  footerText?: string;
  footerClass?: string;
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
  selector: 'app-etudiant-subjects-content',
  standalone: false,
  templateUrl: './etudiant-subjects-content.component.html',
  styleUrl: './etudiant-subjects-content.component.css',
})
export class EtudiantSubjectsContentComponent implements OnInit, OnDestroy {
  private readonly pageSize = 5;
  private toastTimeoutId: ReturnType<typeof setTimeout> | null = null;
  subjects: Subject[] = [];
  currentPage = 0;
  totalPages = 0;
  loading = true;
  errorMessage = '';
  searchTerm = '';
  filterHighCoefficientOnly = false;
  isCreateModalOpen = false;
  editingSubjectId: number | null = null;
  editingSubjectCode = '';
  isSubmitting = false;
  createErrorMessage = '';
  successToastMessage = '';
  readonly subjectForm;
  statsTotalSubjects = 0;
  statsAverageCoefficient = 0;
  statsLastAudit = '03/04/2026';
  readonly tableHeaders: TableHeader[] = [
    { label: 'N° Matière' },
    { label: 'Désignation' },
    { label: 'Coefficient', className: 'text-center' },
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
    private readonly subjectService: SubjectService,
    private readonly formBuilder: FormBuilder,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.subjectForm = this.formBuilder.nonNullable.group({
      label: ['', [Validators.required, Validators.maxLength(100)]],
      coefficient: [1, [Validators.required, Validators.min(0.01)]],
    });
  }

  ngOnInit(): void {
    const token = localStorage.getItem('bda_token');
    if (!token) {
      console.warn('[WARNING] No authentication token found in localStorage');
      this.errorMessage = 'Authentification requise. Veuillez vous reconnecter.';
      this.loading = false;
      return;
    }
    console.log('[DEBUG] Token found, initializing subjects...');
    
    // Charger les stats en premier (généralement plus rapide)
    console.log('[DEBUG] Loading stats first...');
    this.loadStats();
    
    // Puis charger les sujets avec un léger délai pour ne pas surcharger le serveur
    setTimeout(() => {
      console.log('[DEBUG] Now loading subjects...');
      this.loadSubjects(0, true);
    }, 100);
  }

  ngOnDestroy(): void {
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, index) => index);
  }

  get displayedTotalSubjects(): number {
    return this.statsTotalSubjects;
  }

  get kpiCards(): KpiCard[] {
    return [
      {
        label: 'Total Matières',
        value: String(this.displayedTotalSubjects),
        icon: 'library_books',
        cardClass: 'kpi-card kpi-blue',
        iconClass: 'material-symbols-outlined',
        valueClass: 'kpi-value',
        footerIcon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-3.svg',
        footerText: '+3 ce semestre',
        footerClass: 'kpi-footer-positive',
      },
      {
        label: 'Moyenne coeff',
        value: this.formatCoefficient(this.statsAverageCoefficient),
        icon: 'calculate',
        cardClass: 'kpi-card kpi-violet',
        iconClass: 'material-symbols-outlined',
        valueClass: 'kpi-value',
        footerText: 'Pondération équilibrée',
      },
      {
        label: 'Dernier audit',
        value: this.statsLastAudit,
        icon: 'history',
        cardClass: 'kpi-card kpi-red',
        iconClass: 'material-symbols-outlined',
        valueClass: 'kpi-value kpi-value-date',
        footerText: 'Mis à jour le 3 Avr',
      },
    ];
  }

  loadPage(page: number): void {
    if (page < 0 || page >= this.totalPages || page === this.currentPage) {
      return;
    }

    this.loadSubjects(page, true);
  }

  refreshSubjects(resetPage = false): void {
    const targetPage = resetPage ? 0 : this.currentPage;
    this.loadSubjects(targetPage, true);
    this.loadStats();
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.loadSubjects(0, true);
  }

  toggleFilter(): void {
    this.filterHighCoefficientOnly = !this.filterHighCoefficientOnly;
    this.loadSubjects(0, true);
  }

  openCreateModal(): void {
    this.isCreateModalOpen = true;
    this.editingSubjectId = null;
    this.editingSubjectCode = '';
    this.createErrorMessage = '';
    this.subjectForm.reset({ label: '', coefficient: 1 });
  }

  openEditModal(subject: Subject): void {
    const subjectId = this.extractSubjectNumericId(subject.subjectId);
    if (subjectId === null) {
      this.showSuccessToast('ID matière invalide. Impossible de modifier.');
      return;
    }

    this.editingSubjectId = subjectId;
    this.editingSubjectCode = String(subject.subjectId ?? '');
    this.isCreateModalOpen = true;
    this.createErrorMessage = '';
    this.subjectForm.reset({
      label: (subject.label ?? '').trim(),
      coefficient: Number(subject.coefficient ?? 1),
    });
  }

  onRowActionClick(action: RowAction, subject: Subject): void {
    if (action.icon === 'edit') {
      this.openEditModal(subject);
      return;
    }

    if (action.icon === 'delete') {
      this.showSuccessToast('Suppression non implémentée pour le moment.');
      return;
    }

    this.showSuccessToast('Visualisation non implémentée pour le moment.');
  }

  closeCreateModal(): void {
    if (this.isSubmitting) {
      return;
    }

    this.isCreateModalOpen = false;
    this.editingSubjectId = null;
    this.editingSubjectCode = '';
    this.createErrorMessage = '';
    this.subjectForm.reset({ label: '', coefficient: 1 });
  }

  submitCreateSubject(): void {
    if (this.subjectForm.invalid || this.isSubmitting) {
      this.subjectForm.markAllAsTouched();
      return;
    }

    const label = this.subjectForm.controls.label.value.trim();
    const coefficient = Number(this.subjectForm.controls.coefficient.value);
    if (!label) {
      this.subjectForm.controls.label.setErrors({ required: true });
      return;
    }

    if (!Number.isFinite(coefficient) || coefficient <= 0) {
      this.subjectForm.controls.coefficient.setErrors({ min: true });
      return;
    }

    this.isSubmitting = true;
    this.createErrorMessage = '';

    const isEditMode = this.editingSubjectId !== null;
    const request$ = !isEditMode
      ? this.subjectService.createSubject({ label, coefficient })
      : this.subjectService.updateSubject(this.editingSubjectId as number, { label, coefficient });

    request$.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.isCreateModalOpen = false;
        this.editingSubjectId = null;
        this.editingSubjectCode = '';
        this.subjectForm.reset({ label: '', coefficient: 1 });
        this.showSuccessToast(isEditMode ? 'Matière modifiée avec succès.' : 'Matière ajoutée avec succès.');
        this.refreshSubjects(true);
      },
      error: (error: HttpErrorResponse) => {
        this.isSubmitting = false;
        if (error.status === 409) {
          this.createErrorMessage = 'Cette matière existe déjà.';
          return;
        }

        if (error.status === 404 && isEditMode) {
          this.createErrorMessage = 'Matière introuvable.';
          return;
        }

        this.createErrorMessage = !isEditMode
          ? "Impossible d'ajouter la matière."
          : "Impossible de modifier la matière.";
      },
    });
  }

  formatCoefficient(value: number): string {
    return Number(value ?? 0).toFixed(2);
  }

  private loadSubjects(page: number, showLoader: boolean): void {
    this.loading = showLoader;
    if (showLoader) {
      this.errorMessage = '';
    }

    const minCoefficient = this.filterHighCoefficientOnly ? 3 : undefined;
    console.log('[DEBUG] loadSubjects called:', { page, pageSize: this.pageSize, search: this.searchTerm, minCoefficient, filterActive: this.filterHighCoefficientOnly });
    
    this.subjectService.getSubjects(page, this.pageSize, this.searchTerm.trim(), minCoefficient).subscribe({
      next: (response) => {
        console.log('[DEBUG] API response received:', response);
        const normalized = this.normalizeSubjectsResponse(response, page);
        console.log('[DEBUG] Normalized response:', normalized);
        this.subjects = normalized.subjects;
        this.currentPage = normalized.currentPage;
        this.totalPages = normalized.totalPages;
        this.loading = false;
        this.cdr.markForCheck();
        console.log('[DEBUG] Component state updated:', { subjects: this.subjects.length, currentPage: this.currentPage, totalPages: this.totalPages });
      },
      error: (error) => {
        console.error('[DEBUG] API error:', error);
        this.subjects = Array.isArray(this.subjects) ? this.subjects : [];
        if (this.subjects.length === 0) {
          this.errorMessage = 'Impossible de charger les matières.';
        }
        this.loading = false;
        this.cdr.markForCheck();
      },
    });
  }

  private loadStats(): void {
    console.log('[DEBUG] loadStats called');
    this.subjectService.getSubjectStats().subscribe({
      next: (stats) => {
        console.log('[DEBUG] Stats response received:', stats);
        this.statsTotalSubjects = Number(stats.totalSubjects ?? 0);
        this.statsAverageCoefficient = Number(stats.averageCoefficient ?? 0);
        this.cdr.markForCheck();
        console.log('[DEBUG] Stats updated:', { totalSubjects: this.statsTotalSubjects, avgCoeff: this.statsAverageCoefficient });
      },
      error: (error) => {
        console.error('[DEBUG] Stats error:', error);
        this.cdr.markForCheck();
      },
    });
  }

  private normalizeSubjectsResponse(response: SubjectsApiResponse, requestedPage: number): { subjects: Subject[]; currentPage: number; totalPages: number } {
    if (Array.isArray(response)) {
      const subjects = response;
      return {
        subjects,
        currentPage: 0,
        totalPages: subjects.length > 0 ? 1 : 0,
      };
    }

    const subjects = Array.isArray(response?.content) ? response.content : [];
    const currentPage = Number.isInteger(response?.number) ? response.number : requestedPage;
    const rawTotalPages = Number(response?.totalPages ?? 0);
    const totalPages = Number.isFinite(rawTotalPages)
      ? Math.max(rawTotalPages, subjects.length > 0 ? 1 : 0)
      : (subjects.length > 0 ? 1 : 0);

    return { subjects, currentPage, totalPages };
  }

  private showSuccessToast(message: string): void {
    this.successToastMessage = message;
    if (this.toastTimeoutId) {
      clearTimeout(this.toastTimeoutId);
    }

    this.toastTimeoutId = setTimeout(() => {
      this.successToastMessage = '';
      this.toastTimeoutId = null;
    }, 1100);
  }

  private extractSubjectNumericId(subjectId: string): number | null {
    const raw = String(subjectId ?? '').trim();
    if (!raw) {
      return null;
    }

    const direct = Number(raw);
    if (Number.isInteger(direct) && direct > 0) {
      return direct;
    }

    const match = raw.match(/(\d+)$/);
    if (!match) {
      return null;
    }

    const parsed = Number(match[1]);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }
}
