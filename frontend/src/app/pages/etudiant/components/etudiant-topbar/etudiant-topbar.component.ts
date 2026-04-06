import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-etudiant-topbar',
  standalone: false,
  templateUrl: './etudiant-topbar.component.html',
  styleUrl: './etudiant-topbar.component.css',
})
export class EtudiantTopbarComponent implements OnInit {
  username = 'ETUDIANT';
  status = 'ETUDIANT';

  ngOnInit(): void {
    const storedUsername = localStorage.getItem('bda_username');
    const storedRole = localStorage.getItem('bda_role');

    this.username = storedUsername && storedUsername.trim().length > 0 ? storedUsername : 'ETUDIANT';
    this.status = this.toStatusLabel(storedRole);
  }

  private toStatusLabel(role: string | null): string {
    if (!role) {
      return 'ETUDIANT';
    }
    if (role.toUpperCase() === 'GESTIONNAIRE') {
      return 'Gestionnaire';
    }
    return role.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'ETUDIANT';
  }
}

