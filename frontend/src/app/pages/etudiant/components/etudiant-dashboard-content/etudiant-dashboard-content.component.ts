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
    { range: '0–5', count: 8 },
    { range: '5–10', count: 22 },
    { range: '10–15', count: 42 },
    { range: '15–20', count: 27 },
  ];

  readonly gridLines = this.buildGridLines();

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

  get chartBuckets(): Array<ResultBucket & { height: string }> {
    const maxCount = Math.max(...this.resultBuckets.map((bucket) => bucket.count), 1);

    return this.resultBuckets.map((bucket) => ({
      ...bucket,
      height: `${Math.max((bucket.count / maxCount) * 100, 12)}%`,
    }));
  }

  private buildGridLines(): string[] {
    const maxCount = Math.max(...this.resultBuckets.map((bucket) => bucket.count), 10);
    const step = Math.ceil(maxCount / 5);

    return Array.from({ length: 5 }, (_, index) => String(step * (5 - index)));
  }
}