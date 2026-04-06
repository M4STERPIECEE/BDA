import { Routes } from '@angular/router';

import { LoginComponent } from './pages/login/login.component';
import { AdminComponent } from './pages/admin/admin.component';
import { EtudiantComponent } from './pages/etudiant/etudiant.component';
import { EtudiantDashboardContentComponent } from './pages/etudiant/components/etudiant-dashboard-content/etudiant-dashboard-content.component';
import { EtudiantStudentsContentComponent } from './pages/etudiant/components/etudiant-students-content/etudiant-students-content.component';
import { EtudiantSubjectsContentComponent } from './pages/etudiant/components/etudiant-subjects-content/etudiant-subjects-content.component';
import { EtudiantGradeContentComponent } from './pages/etudiant/components/etudiant-grade-content/etudiant-grade-content.component';
import { adminGuard, etudiantGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  {
    path: 'etudiant',
    component: EtudiantComponent,
    canActivate: [etudiantGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: EtudiantDashboardContentComponent },
      { path: 'students', component: EtudiantStudentsContentComponent },
      { path: 'matieres', component: EtudiantSubjectsContentComponent },
      { path: 'note', redirectTo: 'notes', pathMatch: 'full' },
      { path: 'notes', component: EtudiantGradeContentComponent },
      { path: 'audit', component: EtudiantGradeContentComponent },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
