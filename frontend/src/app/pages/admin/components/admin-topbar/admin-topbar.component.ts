import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-topbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-topbar.component.html',
  styleUrl: './admin-topbar.component.css',
})
export class AdminTopbarComponent implements OnInit {
  username = 'ADMIN';
  status = 'ADMIN';

  ngOnInit(): void {
    const storedUsername = localStorage.getItem('bda_username');
    const storedRole = localStorage.getItem('bda_role');

    this.username = storedUsername && storedUsername.trim().length > 0 ? storedUsername : 'ADMIN';
    this.status = storedRole && storedRole.trim().length > 0 ? storedRole.toUpperCase() : 'ADMIN';
  }
}
