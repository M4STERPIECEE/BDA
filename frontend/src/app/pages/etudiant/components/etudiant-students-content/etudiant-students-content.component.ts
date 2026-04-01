import { Component, OnInit } from '@angular/core';
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
export class EtudiantStudentsContentComponent implements OnInit {
  students: Student[] = [];
  loading = true;
  errorMessage = '';

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

  constructor(private readonly studentService: StudentService) {}

  ngOnInit(): void {
    this.studentService.getStudents().subscribe({
      next: (data: Student[]) => {
        this.students = data;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Impossible de charger les etudiants.';
        this.loading = false;
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
}

