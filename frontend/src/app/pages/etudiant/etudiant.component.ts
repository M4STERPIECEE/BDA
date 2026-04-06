import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-etudiant',
  standalone: false,
  templateUrl: './etudiant.component.html',
  styleUrl: './etudiant.component.css',
})
export class EtudiantComponent {
  isLogoutModalOpen = false;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
  ) {}

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
}