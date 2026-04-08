import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../utils/api-config';
import { AuditEntry, AuditStats } from '../models/audit.model';

@Injectable({ providedIn: 'root' })
export class AuditService {
  private readonly apiUrl = API_ENDPOINTS.audit.list;
  private readonly statsUrl = `${API_ENDPOINTS.audit.list}/stats`;

  constructor(private readonly http: HttpClient) {}

  getAuditEntries(operationType?: string): Observable<AuditEntry[]> {
    const uniqueTs = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    let params = new HttpParams().set('_ts', uniqueTs);
    if (operationType) {
      params = params.set('type', operationType);
    }

    return this.http.get<AuditEntry[]>(this.apiUrl, {
      params,
      headers: this.buildAuthHeaders(),
    });
  }

  getAuditStats(): Observable<AuditStats> {
    return this.http.get<AuditStats>(this.statsUrl, {
      headers: this.buildAuthHeaders(),
    });
  }

  private buildAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('bda_token');
    if (!token) {
      return new HttpHeaders();
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
}
