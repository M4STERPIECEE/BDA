import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

import { AuthResponse, LoginRequest } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = 'http://localhost:8080/api/v1/auth/login';

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(this.apiUrl, payload)
      .pipe(tap((response) => this.storeSession(response)));
  }

  logout(): void {
    localStorage.removeItem('bda_token');
    localStorage.removeItem('bda_username');
    localStorage.removeItem('bda_role');
  }

  private storeSession(response: AuthResponse): void {
    localStorage.setItem('bda_token', response.token);
    localStorage.setItem('bda_username', response.username);
    localStorage.setItem('bda_role', response.role);
  }
}

