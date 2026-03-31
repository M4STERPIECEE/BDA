import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
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
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
