import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, forkJoin, of, Subject, takeUntil, timeout } from 'rxjs';
import { Grade } from '../../../../models/grade.model';
import { Student } from '../../../../models/student.model';
import { Subject as SubjectModel } from '../../../../models/subject.model';
import { GradeService } from '../../../../services/grade.service';
import { StudentService } from '../../../../services/student.service';
import { SubjectService, SubjectsApiResponse } from '../../../../services/subject.service';

interface DashboardStatCard {
  label: string;
  value: string;
  accentClass: string;
  footerIcon?: string;
  footerText?: string;
  footerTrend?: string;
  cornerIcon?: string;
  suffix?: string;
}

interface QuickAction {
  label: string;
  icon: string;
  ariaLabel: string;
  route: string;
}

interface ResultBucket {
  range: string;
  count: number;
}

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Component({
  selector: 'app-etudiant-dashboard-content',
  standalone: false,
  templateUrl: './etudiant-dashboard-content.component.html',
  styleUrl: './etudiant-dashboard-content.component.css',
})
export class EtudiantDashboardContentComponent implements OnInit, OnDestroy {
  private readonly pageSize = 200;
  private readonly destroy$ = new Subject<void>();

  statCards: DashboardStatCard[] = [
    {
      label: "Nombre d'étudiants",
      value: '0',
      accentClass: 'stat-accent-blue',
      footerIcon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-3.svg',
      footerText: 'Chargement...',
      footerTrend: 'trend-neutral',
      cornerIcon: 'groups',
    },
    {
      label: 'Nombre de matières',
      value: '0',
      accentClass: 'stat-accent-violet',
      footerText: 'Chargement...',
      footerTrend: 'trend-neutral',
      cornerIcon: 'menu_book',
    },
    {
      label: 'Nombre de notes',
      value: '0',
      accentClass: 'stat-accent-teal',
      footerIcon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-5.svg',
      footerText: 'Données synchronisées',
      footerTrend: 'trend-neutral',
      cornerIcon: 'assignment',
    },
    {
      label: 'Moyenne globale',
      value: '0.0',
      accentClass: 'stat-accent-amber',
      footerIcon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-8.svg',
      footerText: 'Calculée en temps réel',
      footerTrend: 'trend-neutral',
      cornerIcon: 'monitoring',
      suffix: '/20',
    },
  ];

  resultBuckets: ResultBucket[] = [
    { range: '0–5', count: 0 },
    { range: '5–10', count: 0 },
    { range: '10–15', count: 0 },
    { range: '15–20', count: 0 },
  ];

  gridLines = this.buildGridLines();

  readonly quickActions: QuickAction[] = [
    {
      label: 'Ajouter étudiant',
      icon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-1.svg',
      ariaLabel: 'Ajouter un étudiant',
      route: '/etudiant/students',
    },
    {
      label: 'Ajouter matière',
      icon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-6.svg',
      ariaLabel: 'Ajouter une matière',
      route: '/etudiant/matieres',
    },
    {
      label: 'Ajouter note',
      icon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-9.svg',
      ariaLabel: 'Ajouter une note',
      route: '/etudiant/notes',
    },
  ];

  constructor(
    private readonly studentService: StudentService,
    private readonly subjectService: SubjectService,
    private readonly gradeService: GradeService,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.loadStudentsAndAverage();
    this.loadSubjectsData();
    this.loadGradeDistribution();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToAction(action: QuickAction): void {
    void this.router.navigate([action.route]);
  }

  get chartBuckets(): Array<ResultBucket & { height: string }> {
    const maxCount = Math.max(...this.resultBuckets.map((bucket) => bucket.count), 1);

    return this.resultBuckets.map((bucket) => ({
      ...bucket,
      height: `${Math.max((bucket.count / maxCount) * 100, 12)}%`,
    }));
  }

  private buildGridLines(): string[] {
    const maxCount = Math.max(...this.resultBuckets.map((bucket) => bucket.count), 10);
    const step = Math.ceil(maxCount / 5);

    return Array.from({ length: 5 }, (_, index) => String(step * (5 - index)));
  }

  private loadStudentsAndAverage(): void {
    this.studentService.getStudents(0, this.pageSize)
      .pipe(
        timeout(15000),
        takeUntil(this.destroy$),
        catchError(() => of(this.emptyPagedResponse<Student>(0, this.pageSize))),
      )
      .subscribe((firstPage) => {
        const firstContent = firstPage.content ?? [];

        if (firstPage.totalPages <= 1) {
          this.applyStudentMetrics(firstPage.totalElements, firstContent);
          return;
        }

        const remainingRequests = Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
          this.studentService.getStudents(index + 1, this.pageSize).pipe(
            timeout(15000),
            catchError(() => of(this.emptyPagedResponse<Student>(index + 1, this.pageSize))),
          ),
        );

        forkJoin(remainingRequests)
          .pipe(takeUntil(this.destroy$))
          .subscribe((pages) => {
            const allStudents = [...firstContent, ...pages.flatMap((page) => page.content ?? [])];
            this.applyStudentMetrics(firstPage.totalElements || allStudents.length, allStudents);
          });
      });
  }

  private loadSubjectsData(): void {
    this.subjectService.getSubjects(0, this.pageSize)
      .pipe(
        timeout(15000),
        takeUntil(this.destroy$),
        catchError(() => of(this.emptyPagedResponse<SubjectModel>(0, this.pageSize))),
      )
      .subscribe((firstPayload) => {
        const firstPage = this.normalizeSubjectsResponse(firstPayload, 0);
        const latestSubjectLabel = firstPage.content[0]?.label ?? '';

        if (firstPage.totalPages <= 1) {
          this.applySubjectMetrics(firstPage.totalElements, firstPage.content, latestSubjectLabel);
          return;
        }

        const remainingRequests = Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
          this.subjectService.getSubjects(index + 1, this.pageSize).pipe(
            timeout(15000),
            catchError(() => of(this.emptyPagedResponse<SubjectModel>(index + 1, this.pageSize))),
          ),
        );

        forkJoin(remainingRequests)
          .pipe(takeUntil(this.destroy$))
          .subscribe((responses) => {
            const pages = responses.map((response, index) => this.normalizeSubjectsResponse(response, index + 1));
            const allSubjects = [...firstPage.content, ...pages.flatMap((page) => page.content ?? [])];
            this.applySubjectMetrics(firstPage.totalElements || allSubjects.length, allSubjects, latestSubjectLabel);
          });
      });
  }

  private loadGradeDistribution(): void {
    this.gradeService.getGrades(0, this.pageSize)
      .pipe(
        timeout(15000),
        takeUntil(this.destroy$),
        catchError(() => of(this.emptyPagedResponse<Grade>(0, this.pageSize))),
      )
      .subscribe((firstPage) => {
        const bucketCounts = [0, 0, 0, 0];
        this.accumulateBucketCounts(firstPage.content ?? [], bucketCounts);
        this.statCards[2] = {
          ...this.statCards[2],
          value: this.formatInteger(firstPage.totalElements),
        };
        this.cdr.detectChanges();

        if (firstPage.totalPages <= 1) {
          this.applyBucketCounts(bucketCounts);
          return;
        }

        const remainingRequests = Array.from({ length: firstPage.totalPages - 1 }, (_, index) =>
          this.gradeService.getGrades(index + 1, this.pageSize).pipe(
            timeout(15000),
            catchError(() => of(this.emptyPagedResponse<Grade>(index + 1, this.pageSize))),
          ),
        );

        forkJoin(remainingRequests)
          .pipe(takeUntil(this.destroy$))
          .subscribe((pages) => {
            for (const page of pages) {
              this.accumulateBucketCounts(page.content ?? [], bucketCounts);
            }

            this.applyBucketCounts(bucketCounts);
          });
      });
  }

  private applyStudentMetrics(totalStudents: number, students: Student[]): void {
    const safeStudents = students ?? [];
    const averages = safeStudents
      .map((student) => Number(student.average))
      .filter((value) => Number.isFinite(value));

    const studentsInAlert = averages.filter((value) => value < 10).length;
    const globalAverage = averages.length > 0
      ? averages.reduce((sum, value) => sum + value, 0) / averages.length
      : 0;

    this.statCards[0] = {
      ...this.statCards[0],
      value: this.formatInteger(totalStudents),
      footerText: `${studentsInAlert} en alerte`,
      footerTrend: studentsInAlert > 0 ? 'trend-down' : 'trend-up',
    };

    this.statCards[3] = {
      ...this.statCards[3],
      value: this.formatDecimal(globalAverage),
      footerText: globalAverage >= 10 ? 'Niveau global satisfaisant' : 'Niveau global à améliorer',
      footerTrend: globalAverage >= 10 ? 'trend-up' : 'trend-down',
    };

    this.cdr.detectChanges();
  }

  private applySubjectMetrics(totalSubjects: number, subjects: SubjectModel[], latestSubjectLabel: string): void {
    const safeSubjects = subjects ?? [];
    const coefficients = safeSubjects
      .map((subject) => Number(subject.coefficient))
      .filter((value) => Number.isFinite(value));

    const averageCoefficient = coefficients.length > 0
      ? coefficients.reduce((sum, value) => sum + value, 0) / coefficients.length
      : 0;

    this.statCards[1] = {
      ...this.statCards[1],
      value: this.formatInteger(totalSubjects),
      footerText: `Coeff. moyen: ${this.formatDecimal(averageCoefficient)}`,
      footerTrend: 'trend-neutral',
    };

    this.statCards[2] = {
      ...this.statCards[2],
      footerText: latestSubjectLabel ? `Dernière: ${latestSubjectLabel}` : 'Aucune matière',
      footerTrend: 'trend-neutral',
    };

    this.cdr.detectChanges();
  }

  private accumulateBucketCounts(grades: Grade[], bucketCounts: number[]): void {
    for (const grade of grades) {
      const value = Number(grade.value);
      if (Number.isNaN(value)) {
        continue;
      }

      if (value < 5) {
        bucketCounts[0] += 1;
      } else if (value < 10) {
        bucketCounts[1] += 1;
      } else if (value < 15) {
        bucketCounts[2] += 1;
      } else {
        bucketCounts[3] += 1;
      }
    }
  }

  private applyBucketCounts(bucketCounts: number[]): void {
    this.resultBuckets = this.resultBuckets.map((bucket, index) => ({
      ...bucket,
      count: bucketCounts[index] ?? 0,
    }));

    this.gridLines = this.buildGridLines();
    this.cdr.detectChanges();
  }

  private normalizeSubjectsResponse(response: SubjectsApiResponse | PagedResponse<SubjectModel>, page: number): PagedResponse<SubjectModel> {
    if (Array.isArray(response)) {
      return {
        content: response,
        totalElements: response.length,
        totalPages: 1,
        number: page,
        size: response.length,
      };
    }

    return {
      content: response.content ?? [],
      totalElements: response.totalElements ?? response.content?.length ?? 0,
      totalPages: response.totalPages ?? 1,
      number: response.number ?? page,
      size: response.size ?? this.pageSize,
    };
  }

  private emptyPagedResponse<T>(page: number, size: number): PagedResponse<T> {
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: page,
      size,
    };
  }

  private formatInteger(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      maximumFractionDigits: 0,
    }).format(value);
  }

  private formatDecimal(value: number): string {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    }).format(value);
  }
}