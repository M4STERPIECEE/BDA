import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { AdminComponent } from './pages/admin/admin.component';
import { EtudiantComponent } from './pages/etudiant/etudiant.component';
import { EtudiantSidebarComponent } from './pages/etudiant/components/etudiant-sidebar/etudiant-sidebar.component';
import { EtudiantTopbarComponent } from './pages/etudiant/components/etudiant-topbar/etudiant-topbar.component';
import { EtudiantDashboardContentComponent } from './pages/etudiant/components/etudiant-dashboard-content/etudiant-dashboard-content.component';
import { EtudiantStudentsContentComponent } from './pages/etudiant/components/etudiant-students-content/etudiant-students-content.component';
import { EtudiantSubjectsContentComponent } from './pages/etudiant/components/etudiant-subjects-content/etudiant-subjects-content.component';
import { EtudiantGradeContentComponent } from './pages/etudiant/components/etudiant-grade-content/etudiant-grade-content.component';
import { DashboardIconComponent } from './icons/dashboard-icon.component';
import { EtudiantIconComponent } from './icons/etudiant-icon.component';
import { MatieresIconComponent } from './icons/matieres-icon.component';
import { NotesIconComponent } from './icons/notes-icon.component';
import { AuditIconComponent } from './icons/audit-icon.component';
import { routes } from './app.routes';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    AdminComponent,
    EtudiantComponent,
    EtudiantSidebarComponent,
    EtudiantTopbarComponent,
    EtudiantDashboardContentComponent,
    EtudiantStudentsContentComponent,
    EtudiantSubjectsContentComponent,
    EtudiantGradeContentComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
    DashboardIconComponent,
    EtudiantIconComponent,
    MatieresIconComponent,
    NotesIconComponent,
    AuditIconComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}