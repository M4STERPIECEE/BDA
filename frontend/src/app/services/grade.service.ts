import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../utils/api-config';
import { Grade } from '../models/grade.model';

interface UpsertGradeRequest {
  studentId: number;
  subjectId: number;
  value: number;
}

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

@Injectable({ providedIn: 'root' })
export class GradeService {
  private readonly apiUrl = API_ENDPOINTS.grades.list;

  constructor(private readonly http: HttpClient) {}

  getGrades(page: number = 0, size: number = 10): Observable<PagedResponse<Grade>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PagedResponse<Grade>>(this.apiUrl, {
      headers: this.buildAuthHeaders(),
      params,
    });
  }

  createGrade(payload: UpsertGradeRequest): Observable<Grade> {
    return this.http.post<Grade>(this.apiUrl, payload, {
      headers: this.buildAuthHeaders(),
    });
  }

  updateGrade(studentId: number, subjectId: number, payload: UpsertGradeRequest): Observable<Grade> {
    return this.http.put<Grade>(`${this.apiUrl}/student/${studentId}/subject/${subjectId}`, payload, {
      headers: this.buildAuthHeaders(),
    });
  }

  deleteGrade(studentId: number, subjectId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/student/${studentId}/subject/${subjectId}`, {
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
