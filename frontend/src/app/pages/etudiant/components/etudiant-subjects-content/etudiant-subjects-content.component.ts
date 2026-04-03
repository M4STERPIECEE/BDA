import { Component, OnInit } from '@angular/core';

interface SubjectRow {
  subjectId: string;
  designation: string;
  coefficient: number;
}

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
export class EtudiantSubjectsContentComponent implements OnInit {
  private readonly pageSize = 5;

  private readonly allSubjects: SubjectRow[] = [
    { subjectId: 'MAT-101', designation: 'Mathématiques discrètes', coefficient: 3 },
    { subjectId: 'INF-102', designation: 'Algorithmique', coefficient: 4 },
    { subjectId: 'INF-103', designation: 'Programmation Web', coefficient: 3 },
    { subjectId: 'INF-104', designation: 'Base de Données', coefficient: 4 },
    { subjectId: 'INF-105', designation: 'Réseaux', coefficient: 2 },
    { subjectId: 'INF-106', designation: 'Architecture logicielle', coefficient: 3 },
    { subjectId: 'INF-107', designation: 'Systèmes d\'exploitation', coefficient: 2 },
    { subjectId: 'INF-108', designation: 'Sécurité applicative', coefficient: 3 },
    { subjectId: 'INF-109', designation: 'Cloud Computing', coefficient: 2 },
    { subjectId: 'INF-110', designation: 'DevOps', coefficient: 2 },
    { subjectId: 'INF-111', designation: 'Intelligence Artificielle', coefficient: 4 },
  ];

  subjects: SubjectRow[] = [];
  currentPage = 0;
  totalPages = 0;
  loading = true;
  errorMessage = '';

  statsTotalSubjects = 0;
  statsAverageCoefficient = 0;
  statsLastAudit = '03/04/2026';

  readonly tableHeaders: TableHeader[] = [
    { label: 'ID Matière' },
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

  ngOnInit(): void {
    this.refreshSubjects();
  }

  get pages(): number[] {
    const visiblePageCount = this.totalPages > 0 ? this.totalPages : (this.subjects.length > 0 ? 1 : 0);
    return Array.from({ length: visiblePageCount }, (_, index) => index);
  }

  get displayedTotalSubjects(): number {
    return Math.max(this.statsTotalSubjects, this.subjects.length);
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

    this.loading = true;
    this.errorMessage = '';

    const start = page * this.pageSize;
    this.subjects = this.allSubjects.slice(start, start + this.pageSize);
    this.currentPage = page;
    this.loading = false;
  }

  refreshSubjects(): void {
    this.loading = true;
    this.errorMessage = '';

    try {
      this.statsTotalSubjects = this.allSubjects.length;
      const coefficientsSum = this.allSubjects.reduce((sum, subject) => sum + subject.coefficient, 0);
      this.statsAverageCoefficient = coefficientsSum / Math.max(this.allSubjects.length, 1);
      this.totalPages = Math.max(Math.ceil(this.allSubjects.length / this.pageSize), 1);

      const start = this.currentPage * this.pageSize;
      this.subjects = this.allSubjects.slice(start, start + this.pageSize);
      this.loading = false;
    } catch {
      this.errorMessage = 'Impossible de charger les matières.';
      this.loading = false;
    }
  }

  formatCoefficient(value: number): string {
    return Number(value ?? 0).toFixed(2);
  }
}
