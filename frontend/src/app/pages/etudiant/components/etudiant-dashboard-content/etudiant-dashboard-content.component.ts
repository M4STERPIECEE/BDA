import { Component } from '@angular/core';

interface DashboardStatCard {
  label: string;
  value: string;
  cardClass: string;
  labelClass: string;
  valueRowClass: string;
  valueClass: string;
  footerClass?: string;
  footerIcon?: string;
  footerIconClass?: string;
  footerText?: string;
  footerTextClass?: string;
  cornerIcon?: string;
  cornerIconClass?: string;
  suffix?: string;
  suffixClass?: string;
}

interface QuickAction {
  label: string;
  icon: string;
  ariaLabel: string;
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
      label: "Nombre d'etudiants",
      value: '250',
      cardClass: 'relative row-[1_/_2] col-[1_/_2] w-full h-fit flex flex-col items-start gap-1 pt-6 pb-10 px-6 bg-white rounded-xl overflow-hidden',
      labelClass: "relative flex items-center self-stretch mt-[-1.00px] [font-family:'Poppins',Helvetica] font-normal text-[#434655] text-sm tracking-[0] leading-5",
      valueRowClass: 'flex flex-col items-start relative self-stretch w-full flex-[0_0_auto]',
      valueClass: "relative flex items-center self-stretch mt-[-1.00px] [font-family:'Poppins',Helvetica] font-bold text-[#191b23] text-3xl tracking-[0] leading-9",
      footerClass: 'flex items-center gap-1 pt-3 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]',
      footerIcon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-3.svg',
      footerText: '+12 ce mois',
      footerTextClass: "relative w-[69.06px] h-4 mt-[-1.00px] [font-family:'Poppins',Helvetica] font-bold text-[#006e2d] text-xs tracking-[0] leading-4 whitespace-nowrap flex items-center",
      cornerIcon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-12.svg',
      cornerIconClass: 'absolute top-0 right-[-5px] w-[75px] h-[74px]',
    },
    {
      label: 'Nombre de matieres',
      value: '15',
      cardClass: 'col-[2_/_3] p-6 relative row-[1_/_2] w-full h-fit flex flex-col items-start gap-1 bg-white rounded-xl overflow-hidden',
      labelClass: "relative flex items-center self-stretch mt-[-1.00px] [font-family:'Poppins',Helvetica] font-normal text-[#434655] text-sm tracking-[0] leading-5",
      valueRowClass: 'flex-col items-start flex relative self-stretch w-full flex-[0_0_auto]',
      valueClass: "relative flex items-center self-stretch mt-[-1.00px] [font-family:'Poppins',Helvetica] font-bold text-[#191b23] text-3xl tracking-[0] leading-9",
      footerClass: 'flex items-center pt-3 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]',
      footerText: 'Derniere ajoutee: IA<br />Appliquee',
      footerTextClass: "relative self-stretch mt-[-1.00px] [font-family:'Poppins',Helvetica] font-medium text-[#434655] text-xs tracking-[0] leading-4",
      cornerIcon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-11.svg',
      cornerIconClass: 'absolute top-0 right-[-7px] w-[73px] h-[74px]',
    },
    {
      label: 'Nombre de notes',
      value: '1 245',
      cardClass: 'col-[3_/_4] pt-6 pb-10 px-6 relative row-[1_/_2] w-full h-fit flex flex-col items-start gap-1 bg-white rounded-xl overflow-hidden',
      labelClass: "relative flex items-center self-stretch mt-[-1.00px] [font-family:'Poppins',Helvetica] font-normal text-[#434655] text-sm tracking-[0] leading-5",
      valueRowClass: 'flex-col items-start flex relative self-stretch w-full flex-[0_0_auto]',
      valueClass: "relative flex items-center self-stretch mt-[-1.00px] [font-family:'Poppins',Helvetica] font-bold text-[#191b23] text-3xl tracking-[0] leading-9",
      footerClass: 'flex items-center gap-1 pt-3 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]',
      footerIcon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-5.svg',
      footerText: '98% validees',
      footerTextClass: "relative w-[79.77px] h-4 mt-[-1.00px] [font-family:'Poppins',Helvetica] font-bold text-[#006e2d] text-xs tracking-[0] leading-4 whitespace-nowrap flex items-center",
      cornerIcon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-2.svg',
      cornerIconClass: 'absolute top-0 -right-1 w-[76px] h-[74px]',
    },
    {
      label: 'Moyenne globale',
      value: '12.8',
      cardClass: 'relative row-[1_/_2] col-[4_/_5] w-full h-fit flex flex-col items-start gap-1 pt-6 pb-[39px] px-6 bg-white rounded-xl overflow-hidden',
      labelClass: "relative flex items-center self-stretch mt-[-1.00px] [font-family:'Poppins',Helvetica] font-normal text-[#434655] text-sm tracking-[0] leading-5",
      valueRowClass: 'items-end pt-0 pb-px px-0 flex relative self-stretch w-full flex-[0_0_auto]',
      valueClass: "relative w-[60.53px] h-9 mt-[-1.00px] [font-family:'Poppins',Helvetica] font-bold text-[#191b23] text-3xl tracking-[0] leading-9 whitespace-nowrap flex items-center",
      footerClass: 'flex items-center gap-1 pt-3 pb-0 px-0 relative self-stretch w-full flex-[0_0_auto]',
      footerIcon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-8.svg',
      footerText: '-0.4 vs sem. prec.',
      footerTextClass: "relative w-[106.77px] h-4 mt-[-1.00px] [font-family:'Poppins',Helvetica] font-bold text-[#ba1a1a] text-xs tracking-[0] leading-4 whitespace-nowrap flex items-center",
      cornerIcon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container.svg',
      cornerIconClass: 'absolute top-0 right-[-3px] w-[77px] h-[74px]',
      suffix: '/20',
      suffixClass: "relative w-[30.47px] h-7 [font-family:'Poppins',Helvetica] font-bold text-[#434655] text-lg tracking-[0] leading-7 whitespace-nowrap flex items-center",
    },
  ];

  readonly resultBuckets = ['0-5', '5-10', '10-15', '15-20'];

  readonly quickActions: QuickAction[] = [
    {
      label: 'Ajouter etudiant',
      icon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-1.svg',
      ariaLabel: 'Ajouter un etudiant',
    },
    {
      label: 'Ajouter matiere',
      icon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-6.svg',
      ariaLabel: 'Ajouter une matiere',
    },
    {
      label: 'Ajouter note',
      icon: 'https://c.animaapp.com/mnbnobg3lUYjRB/img/container-9.svg',
      ariaLabel: 'Ajouter une note',
    },
  ];
}

