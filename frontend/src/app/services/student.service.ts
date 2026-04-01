import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../utils/api-config';
import { Student } from '../models/student.model';

interface CreateStudentRequest {
  fullName: string;
}

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly apiUrl = API_ENDPOINTS.students.list;

  constructor(private readonly http: HttpClient) {}

  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(this.apiUrl, {
      headers: this.buildAuthHeaders(),
    });
  }

  createStudent(payload: CreateStudentRequest): Observable<Student> {
    return this.http.post<Student>(this.apiUrl, payload, {
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

