import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { AuthResponse, UserRole } from '../../models/auth.model';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loginForm = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
    role: ['ETUDIANT' as UserRole, [Validators.required]],
  });

  showError = false;
  isLoading = false;
  errorMessage = '';

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.showError = false;
    this.errorMessage = '';
    this.isLoading = true;

    this.authService.login(this.loginForm.getRawValue()).subscribe({
      next: (response) => this.redirectByRole(response),
      error: () => {
        this.isLoading = false;
        this.showError = true;
        this.errorMessage =
          'Connexion refusee. Verifie username, mot de passe et role.';
      },
    });
  }

  private redirectByRole(response: AuthResponse): void {
    this.isLoading = false;
    if (response.role === 'ADMIN') {
      this.router.navigate(['/admin']);
      return;
    }
    this.router.navigate(['/etudiant']);
  }
}
