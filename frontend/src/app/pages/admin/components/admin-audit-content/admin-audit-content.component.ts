import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AuditEntry, AuditStats } from '../../../../models/audit.model';
import { AuditService } from '../../../../services/audit.service';

@Component({
  selector: 'app-admin-audit-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-audit-content.component.html',
  styleUrl: './admin-audit-content.component.css',
})
export class AdminAuditContentComponent implements OnInit {
  stats: AuditStats = {
    insertCount: 0,
    updateCount: 0,
    deleteCount: 0,
    totalCount: 0,
  };

  entries: AuditEntry[] = [];
  displayedEntries: AuditEntry[] = [];

  loading = true;
  errorMessage = '';
  activeFilter: '' | 'INSERT' | 'UPDATE' | 'DELETE' = '';
  searchTerm = '';

  constructor(private readonly auditService: AuditService) {}

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.loading = true;
    this.errorMessage = '';

    const type = this.activeFilter || undefined;

    forkJoin({
      entries: this.auditService.getAuditEntries(type),
      stats: this.auditService.getAuditStats(),
    }).subscribe({
      next: ({ entries, stats }) => {
        this.entries = Array.isArray(entries) ? entries : [];
        this.stats = {
          insertCount: Number(stats.insertCount ?? 0),
          updateCount: Number(stats.updateCount ?? 0),
          deleteCount: Number(stats.deleteCount ?? 0),
          totalCount: Number(stats.totalCount ?? 0),
        };
        this.applySearch();
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.entries = [];
        this.displayedEntries = [];
        this.loading = false;

        if (error.status === 403) {
          this.errorMessage = 'Acces interdit: la supervision audit est reservee au role ADMIN.';
          return;
        }

        this.errorMessage = 'Impossible de charger les donnees d\'audit.';
      },
    });
  }

  setFilter(type: '' | 'INSERT' | 'UPDATE' | 'DELETE'): void {
    this.activeFilter = type;
    this.refresh();
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.applySearch();
  }

  formatNote(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return '-';
    }

    return Number(value).toFixed(2);
  }

  trackById(_: number, entry: AuditEntry): number {
    return entry.auditId;
  }

  private applySearch(): void {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) {
      this.displayedEntries = [...this.entries];
      return;
    }

    this.displayedEntries = this.entries.filter((entry) => {
      const studentId = String(entry.studentId ?? '').toLowerCase();
      const studentName = String(entry.studentName ?? '').toLowerCase();
      const subjectLabel = String(entry.subjectLabel ?? '').toLowerCase();
      const dbUser = String(entry.dbUser ?? '').toLowerCase();
      return (
        studentId.includes(term) ||
        studentName.includes(term) ||
        subjectLabel.includes(term) ||
        dbUser.includes(term)
      );
    });
  }
}
