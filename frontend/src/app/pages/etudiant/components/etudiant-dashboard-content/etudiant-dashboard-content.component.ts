import { Component } from '@angular/core';

interface DashboardStatCard {
  label: string;
  value: string;
  accentClass: string;
  footerIcon?: string;
  footerText?: string;
  footerTrend?: string;
  cornerIcon?: string;
  suffix?: string;
}

interface QuickAction {
  label: string;
  icon: string;
  ariaLabel: string;
}

interface ResultBucket {
  range: string;
  height: string;
  count: number;
}

@Component({
  selector: 'app-etudiant-dashboard-content',
  standalone: false,
  templateUrl: './etudiant-dashboard-content.component.html',
  styleUrl: './etudiant-dashboard-content.component.css',
})
export class EtudiantDashboardContentComponent {

  readonly statCards: DashboardStatCard[] = [
    {
      label: "Nombre d'étudiants",
      value: '250',
      accentClass: 'stat-accent-blue',
      footerIcon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-3.svg',
      footerText: '+12 ce mois',
      footerTrend: 'trend-up',
      cornerIcon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-12.svg',
    },
    {
      label: 'Nombre de matières',
      value: '15',
      accentClass: 'stat-accent-violet',
      footerText: 'Dernière : IA Appliquée',
      footerTrend: 'trend-neutral',
      cornerIcon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-11.svg',
    },
    {
      label: 'Nombre de notes',
      value: '1 245',
      accentClass: 'stat-accent-teal',
      footerIcon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-5.svg',
      footerText: '98% validées',
      footerTrend: 'trend-up',
      cornerIcon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-2.svg',
    },
    {
      label: 'Moyenne globale',
      value: '12.8',
      accentClass: 'stat-accent-amber',
      footerIcon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-8.svg',
      footerText: '−0.4 vs sem. préc.',
      footerTrend: 'trend-down',
      cornerIcon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container.svg',
      suffix: '/20',
    },
  ];

  readonly resultBuckets: ResultBucket[] = [
    { range: '0–5',   height: '30px',  count: 8  },
    { range: '5–10',  height: '75px',  count: 22 },
    { range: '10–15', height: '140px', count: 42 },
    { range: '15–20', height: '90px',  count: 27 },
  ];

  readonly gridLines = ['50', '40', '30', '20', '10'];

  readonly quickActions: QuickAction[] = [
    {
      label: 'Ajouter étudiant',
      icon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-1.svg',
      ariaLabel: 'Ajouter un étudiant',
    },
    {
      label: 'Ajouter matière',
      icon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-6.svg',
      ariaLabel: 'Ajouter une matière',
    },
    {
      label: 'Ajouter note',
      icon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-9.svg',
      ariaLabel: 'Ajouter une note',
    },
  ];
}