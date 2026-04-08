import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { catchError, of, timeout } from 'rxjs';
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
  private readonly auditCacheKey = 'bda_admin_audit_cache_v1';
  private requestVersion = 0;
  readonly studentCodeYear = new Date().getFullYear();

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

  constructor(
    private readonly auditService: AuditService,
    private readonly cdr: ChangeDetectorRef // ✅ Ajout pour forcer le rendu
  ) {}

  ngOnInit(): void {
    const hasCache = this.hydrateFromCache();
    this.refresh(!hasCache);
  }

  refresh(forceLoader = this.entries.length === 0): void {
    this.loading = forceLoader;
    this.errorMessage = '';
    this.fetchEntriesForActiveFilter(forceLoader);
    this.fetchStats();
  }

  setFilter(type: '' | 'INSERT' | 'UPDATE' | 'DELETE'): void {
    this.activeFilter = type;
    this.searchTerm = '';
    this.errorMessage = '';
    
    // ✅ CORRECTION PRINCIPALE : Vider immédiatement pour éviter d'afficher les anciennes données
    this.displayedEntries = [];
    this.loading = true; // ✅ Forcer l'état de chargement
    
    // ✅ Toujours fetch avec loader actif lors d'un changement de filtre
    this.fetchEntriesForActiveFilter(true);
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

  formatOperationLabel(operationType: string | null | undefined): string {
    const normalized = String(operationType ?? '').toUpperCase();
    if (normalized === 'INSERT') return 'AJOUT';
    if (normalized === 'UPDATE') return 'MODIFICATION';
    if (normalized === 'DELETE') return 'SUPPRESSION';
    return normalized || '-';
  }

  getOperationClass(operationType: string | null | undefined): string {
    const normalized = String(operationType ?? '').toUpperCase();
    if (normalized === 'INSERT') return 'op-insert';
    if (normalized === 'UPDATE') return 'op-update';
    if (normalized === 'DELETE') return 'op-delete';
    return '';
  }

  formatStudentDisplayId(studentId: number | null | undefined): string {
    const id = Number(studentId);
    if (!Number.isFinite(id) || id <= 0) return '-';
    return `ETU${this.studentCodeYear}${id.toString().padStart(3, '0')}`;
  }

  trackById(_: number, entry: AuditEntry): number {
    return entry.auditId;
  }

  private applySearch(): void {
    const source = this.entries;
    const term = this.searchTerm.trim().toLowerCase();
    
    if (!term) {
      // ✅ Créer une nouvelle référence pour déclencher le change detection
      this.displayedEntries = [...source];
      this.cdr.detectChanges(); // ✅ Force le rendu immédiat
      return;
    }

    this.displayedEntries = source.filter((entry) => {
      const studentId = String(entry.studentId ?? '').toLowerCase();
      const studentCode = this.formatStudentDisplayId(entry.studentId).toLowerCase();
      const operationType = String(entry.operationType ?? '').toLowerCase();
      const studentName = String(entry.studentName ?? '').toLowerCase();
      const subjectLabel = String(entry.subjectLabel ?? '').toLowerCase();
      const dbUser = String(entry.dbUser ?? '').toLowerCase();
      const updatedAt = String(entry.updatedAt ?? '').toLowerCase();
      
      return (
        studentId.includes(term) ||
        studentCode.includes(term) ||
        operationType.includes(term) ||
        studentName.includes(term) ||
        subjectLabel.includes(term) ||
        dbUser.includes(term) ||
        updatedAt.includes(term)
      );
    });
    this.cdr.detectChanges(); // ✅ Force le rendu immédiat
  }

  private normalizeEntries(entries: AuditEntry[] | null | undefined): AuditEntry[] {
    if (!Array.isArray(entries)) return [];
    return entries.map((entry) => ({
      ...entry,
      operationType: String(entry.operationType ?? '').toUpperCase(),
      studentName: entry.studentName ?? '-',
      subjectLabel: entry.subjectLabel ?? '-',
      dbUser: entry.dbUser ?? '-',
    }));
  }

  private computeStatsFromEntries(entries: AuditEntry[]): AuditStats {
    const insertCount = entries.filter((entry) => entry.operationType === 'INSERT').length;
    const updateCount = entries.filter((entry) => entry.operationType === 'UPDATE').length;
    const deleteCount = entries.filter((entry) => entry.operationType === 'DELETE').length;
    return {
      insertCount,
      updateCount,
      deleteCount,
      totalCount: entries.length,
    };
  }

  private hydrateFromCache(): boolean {
    const raw = localStorage.getItem(this.auditCacheKey);
    if (!raw) return false;

    try {
      const parsed = JSON.parse(raw) as { 
        entries?: AuditEntry[]; 
        stats?: AuditStats; 
        filter?: '' | 'INSERT' | 'UPDATE' | 'DELETE' 
      };
      
      // Ne pas utiliser le cache si un filtre est actif
      if ((parsed.filter ?? '') !== '') return false;

      const cachedEntries = this.normalizeEntries(parsed.entries ?? []);
      const cachedStats = parsed.stats;

      if (cachedEntries.length === 0) return false;

      this.entries = cachedEntries;
      this.stats = {
        insertCount: Number(cachedStats?.insertCount ?? 0),
        updateCount: Number(cachedStats?.updateCount ?? 0),
        deleteCount: Number(cachedStats?.deleteCount ?? 0),
        totalCount: Number(cachedStats?.totalCount ?? cachedEntries.length),
      };
      this.applySearch();
      this.loading = false;
      return true;
    } catch {
      localStorage.removeItem(this.auditCacheKey);
      return false;
    }
  }

  private writeCache(): void {
    // Ne cacher que pour le filtre "Tous"
    if (this.activeFilter !== '') return;

    try {
      localStorage.setItem(
        this.auditCacheKey,
        JSON.stringify({
          filter: this.activeFilter,
          entries: this.entries,
          stats: this.stats,
        }),
      );
    } catch {
      // Ignorer les erreurs de cache (quota/privacy mode)
    }
  }

  private fetchEntriesForActiveFilter(showLoader: boolean): void {
    const requestId = ++this.requestVersion;
    const type = this.activeFilter || undefined;

    if (showLoader) {
      this.loading = true;
    }

    this.auditService.getAuditEntries(type)
      .pipe(timeout(10000))
      .subscribe({
        next: (entries) => {
          // Ignorer les réponses obsolètes (race condition)
          if (requestId !== this.requestVersion) return;

          const normalized = this.normalizeEntries(entries);
          this.entries = normalized;
          
          // ✅ Appliquer le filtrage recherche sur les nouvelles données
          this.applySearch();
          
          this.writeCache();
          this.loading = false;
          this.cdr.detectChanges(); // ✅ Force le rendu après mise à jour
        },
        error: (error: HttpErrorResponse) => {
          if (requestId !== this.requestVersion) return;
          
          this.loading = false;
          this.errorMessage = error.status === 403 
            ? 'Accès interdit: la supervision audit est réservée au rôle ADMIN.'
            : 'Impossible de charger les données d\'audit.';
          this.cdr.detectChanges();
        },
      });
  }

  private fetchStats(): void {
    this.auditService.getAuditStats()
      .pipe(
        timeout(8000),
        catchError(() => of(this.computeStatsFromEntries(this.entries))),
      )
      .subscribe((stats) => {
        this.stats = {
          insertCount: Number(stats.insertCount ?? 0),
          updateCount: Number(stats.updateCount ?? 0),
          deleteCount: Number(stats.deleteCount ?? 0),
          totalCount: Number(stats.totalCount ?? 0),
        };

        if (this.activeFilter === '') {
          this.writeCache();
        }
      });
  }
}