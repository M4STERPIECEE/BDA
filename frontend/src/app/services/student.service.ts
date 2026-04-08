import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../utils/api-config';
import { Student } from '../models/student.model';

interface CreateStudentRequest {
  fullName: string;
}

type UpsertStudentRequest = CreateStudentRequest;

interface PageResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface StudentStatsResponse {
  totalStudents: number;
  globalAverage: number;
  studentsInAlert: number;
}

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly apiUrl = API_ENDPOINTS.students.list;
  private readonly statsUrl = `${API_ENDPOINTS.students.list}/stats`;

  constructor(private readonly http: HttpClient) {}

  getStudents(page = 0, size = 5): Observable<PageResponse<Student>> {
    return this.http.get<PageResponse<Student>>(this.apiUrl, {
      params: { page: page.toString(), size: size.toString() },
      headers: this.buildAuthHeaders(),
    });
  }

  getStudentStats(): Observable<StudentStatsResponse> {
    return this.http.get<StudentStatsResponse>(this.statsUrl, {
      headers: this.buildAuthHeaders(),
    });
  }

  createStudent(payload: CreateStudentRequest): Observable<Student> {
    return this.http.post<Student>(this.apiUrl, payload, {
      headers: this.buildAuthHeaders(),
    });
  }

  updateStudent(studentId: number, payload: UpsertStudentRequest): Observable<Student> {
    return this.http.put<Student>(`${this.apiUrl}/${studentId}`, payload, {
      headers: this.buildAuthHeaders(),
    });
  }

  deleteStudent(studentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${studentId}`, {
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

