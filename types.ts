
export enum Status {
  Finalizada = 'Finalizada',
  EliteII = 'Elite II',
  EliteI = 'Elite I',
  Avanzada = 'Avanzada',
  AlDia = 'Al Día',
  Atrasada = 'Atrasada',
  Riesgo = 'En Riesgo',
  SinIniciar = 'Sin Iniciar',
}

export interface Student {
  id: number;
  name: string;
  courseProgress: number[]; // Array of 5 numbers for each course (0-100)
  totalPoints: number;
  expectedPoints: number;
  status: Status;
  identityVerified: boolean;
  twoFactorVerified: boolean;
  certificateStatus: boolean[];
  finalCertificateStatus: boolean;
  dtvStatus: boolean;
}

export interface Answer {
  id: number;
  author: string;
  text: string;
  timestamp: Date;
}

export interface CommunityQuestion {
  id: number;
  author: string;
  text: string;
  timestamp: Date;
  answers: Answer[];
}

export interface ScheduleItem {
  date: string; // YYYY-MM-DD
  course: string;
  module: string;
}

export interface Break {
    id: number;
    start: string;
    end: string;
}
