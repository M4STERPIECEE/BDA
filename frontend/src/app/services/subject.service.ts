import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timeout } from 'rxjs';
import { Subject } from '../models/subject.model';
import { API_ENDPOINTS } from '../utils/api-config';

interface CreateSubjectRequest {
  label: string;
  coefficient: number;
}

interface PageResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export type SubjectsApiResponse = PageResponse<Subject> | Subject[];

interface SubjectStatsResponse {
  totalSubjects: number;
  averageCoefficient: number;
}

@Injectable({ providedIn: 'root' })
export class SubjectService {
  private readonly apiUrl = API_ENDPOINTS.subjects.list;
  private readonly statsUrl = `${API_ENDPOINTS.subjects.list}/stats`;

  constructor(private readonly http: HttpClient) {}

  getSubjects(page = 0, size = 5, search = '', minCoefficient?: number): Observable<SubjectsApiResponse> {
    const params: Record<string, string | number> = {
      page: page,
      size: size,
    };
        if (search && search.trim()) {
      params['search'] = search.trim();
    }
        if (minCoefficient !== undefined && minCoefficient !== null) {
      params['minCoefficient'] = minCoefficient;
    }

    console.log('[SubjectService] getSubjects API call with params:', params);
    
    return this.http.get<SubjectsApiResponse>(this.apiUrl, {
      params,
      headers: this.buildAuthHeaders(),
    }).pipe(
      timeout(15000)
    );
  }

  getSubjectStats(): Observable<SubjectStatsResponse> {
    console.log('[SubjectService] getSubjectStats API call');
    return this.http.get<SubjectStatsResponse>(this.statsUrl, {
      headers: this.buildAuthHeaders(),
    }).pipe(
      timeout(15000)
    );
  }

  createSubject(payload: CreateSubjectRequest): Observable<Subject> {
    return this.http.post<Subject>(this.apiUrl, payload, {
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
