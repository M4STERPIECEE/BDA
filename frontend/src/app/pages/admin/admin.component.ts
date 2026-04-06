import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AuditEntry, AuditStats } from '../../models/audit.model';
import { AuditService } from '../../services/audit.service';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: false,
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent {
  username = 'ADMIN';
  status = 'ADMIN';
  auditEntries: AuditEntry[] = [];
  auditStats: AuditStats = {
    insertCount: 0,
    updateCount: 0,
    deleteCount: 0,
    totalCount: 0,
  };
  loading = true;
  errorMessage = '';
  filterType: 'ALL' | 'INSERT' | 'UPDATE' | 'DELETE' = 'ALL';
  selectedAudit: AuditEntry | null = null;
  isLogoutModalOpen = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly auditService: AuditService,
  ) {}

  ngOnInit(): void {
    this.loadIdentity();
    this.loadDashboard();
  }

  openLogoutModal(): void {
    this.isLogoutModalOpen = true;
  }

  closeLogoutModal(): void {
    this.isLogoutModalOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.isLogoutModalOpen = false;
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  setFilter(type: 'ALL' | 'INSERT' | 'UPDATE' | 'DELETE'): void {
    this.filterType = type;
    this.loadDashboard();
  }

  refresh(): void {
    this.loadDashboard();
  }

  openAuditDetails(entry: AuditEntry): void {
    this.selectedAudit = entry;
  }

  closeAuditDetails(): void {
    this.selectedAudit = null;
  }

  formatValue(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return '-';
    }

    return Number(value).toFixed(2);
  }

  get filteredEntries(): AuditEntry[] {
    if (this.filterType === 'ALL') {
      return this.auditEntries;
    }

    return this.auditEntries.filter((entry) => entry.operationType === this.filterType);
  }

  get recentEntries(): AuditEntry[] {
    return [...this.filteredEntries].slice(0, 5);
  }

  private loadIdentity(): void {
    const storedUsername = localStorage.getItem('bda_username');
    const storedRole = localStorage.getItem('bda_role');

    this.username = storedUsername && storedUsername.trim().length > 0 ? storedUsername : 'ADMIN';
    this.status = storedRole && storedRole.trim().length > 0 ? storedRole.toUpperCase() : 'ADMIN';
  }

  private loadDashboard(): void {
    this.loading = true;
    this.errorMessage = '';

    const auditType = this.filterType === 'ALL' ? undefined : this.filterType;

    forkJoin({
      entries: this.auditService.getAuditEntries(auditType),
      stats: this.auditService.getAuditStats(),
    }).subscribe({
      next: ({ entries, stats }) => {
        this.auditEntries = Array.isArray(entries) ? entries : [];
        this.auditStats = {
          insertCount: Number(stats.insertCount ?? 0),
          updateCount: Number(stats.updateCount ?? 0),
          deleteCount: Number(stats.deleteCount ?? 0),
          totalCount: Number(stats.totalCount ?? 0),
        };
        this.loading = false;
      },
      error: (error: HttpErrorResponse) => {
        this.auditEntries = [];
        this.loading = false;

        if (error.status === 403) {
          this.errorMessage = 'Acces interdit: la supervision audit est reservee au role ADMIN.';
          return;
        }

        this.errorMessage = 'Impossible de charger les donnees d\'audit.';
      },
    });
  }
}

