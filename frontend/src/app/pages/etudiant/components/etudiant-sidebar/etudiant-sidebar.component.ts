import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-etudiant-sidebar',
  standalone: false,
  templateUrl: './etudiant-sidebar.component.html',
  styleUrl: './etudiant-sidebar.component.css',
})
export class EtudiantSidebarComponent {
  @Output() readonly logoutRequested = new EventEmitter<void>();

  onLogout(): void {
    this.logoutRequested.emit();
  }
}

