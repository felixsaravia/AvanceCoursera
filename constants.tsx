

import React from 'react';
import { Status, ScheduleItem } from './types';

export const MOCK_NAMES: string[] = [
    "Fatima Beatriz Masin Aguilar",
    "Nuria Lisseth Rivera Mestizo",
    "María Fernanda Martínez Cupido",
    "Rebeca Michelle Castro Pineda",
    "Katherine Elena Hernandez Quintanilla",
    "Marlene Lizbeth Guevara Tobar",
    "Adriana Marcela Chacón Reyes",
    "Kateryn Estefany Zelada Galicia",
    "Laura Rocío Perdomo Ramírez",
    "Emeli Lisvea Navarrete Flores",
    "Ana Milena Cortez Linares",
    "Karla Michelle González González",
    "Alejandra Lisbeth Zavala Calles",
    "Katherine Alexandra Hernández Suriano",
    "Tania Abigail Barahona Fuentes",
    "Tanya Gabriela González Ramírez",
    "María José Peraza Peña",
    "Gabriela Alexandra Alvayeros Guirola"
];


export const TOTAL_COURSES = 6;
export const MAX_POINTS_PER_COURSE = 100;
export const TOTAL_MAX_POINTS = TOTAL_COURSES * MAX_POINTS_PER_COURSE;

export const STATUS_CONFIG: { [key in Status]: { icon: React.ReactNode; color: string; textColor: string } } = {
    [Status.Finalizada]: {
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 17 17 23 15.79 13.88"></polyline></svg>,
        color: 'bg-yellow-100',
        textColor: 'text-yellow-800',
    },
    [Status.EliteII]: {
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path><path d="M5 21l-1.18-6.88L2 9.27l6.91-1.01L12 2l3.09 6.26L22 9.27l-5 4.87L18 21"/></svg>,
        color: 'bg-fuchsia-100',
        textColor: 'text-fuchsia-800',
    },
    [Status.EliteI]: {
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>,
        color: 'bg-violet-100',
        textColor: 'text-violet-800',
    },
    [Status.Avanzada]: {
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 12-4-4-4 4"/><path d="m14 12v-10"/><path d="M4 12h10"/><path d="M4 20h16"/></svg>,
        color: 'bg-sky-100',
        textColor: 'text-sky-800',
    },
    [Status.AlDia]: {
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>,
        color: 'bg-green-100',
        textColor: 'text-green-800',
    },
    [Status.Atrasada]: {
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
        color: 'bg-amber-100',
        textColor: 'text-amber-800',
    },
    [Status.Riesgo]: {
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
        color: 'bg-red-100',
        textColor: 'text-red-800',
    },
    [Status.SinIniciar]: {
        icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="8" y1="12" x2="16" y2="12" /></svg>,
        color: 'bg-gray-200',
        textColor: 'text-gray-800',
    }
};

export const orderedStatuses: Status[] = [
    Status.Finalizada,
    Status.EliteII,
    Status.EliteI,
    Status.Avanzada,
    Status.AlDia,
    Status.Atrasada,
    Status.Riesgo,
    Status.SinIniciar
];


export const schedule: ScheduleItem[] = [
    { date: '2025-07-21', course: '1. Fundamentos del soporte técnico', module: 'Introducción a la informática' },
    { date: '2025-07-22', course: '1. Fundamentos del soporte técnico', module: 'Hardware' },
    { date: '2025-07-23', course: '1. Fundamentos del soporte técnico', module: 'Sistema operativo' },
    { date: '2025-07-24', course: '1. Fundamentos del soporte técnico', module: 'Sistema operativo' },
    { date: '2025-07-25', course: '1. Fundamentos del soporte técnico', module: 'Redes' },
    { date: '2025-07-26', course: '1. Fundamentos del soporte técnico', module: 'Redes' },
    { date: '2025-07-27', course: '1. Fundamentos del soporte técnico', module: 'Software' },
    { date: '2025-07-28', course: '1. Fundamentos del soporte técnico', module: 'Software' },
    { date: '2025-07-29', course: '1. Fundamentos del soporte técnico', module: 'Resolución de problemas' },
    { date: '2025-07-30', course: '2. Los bits y bytes de las redes informáticas', module: 'Introducción a las redes' },
    { date: '2025-07-31', course: '2. Los bits y bytes de las redes informáticas', module: 'La capa de red' },
    { date: '2025-08-01', course: '2. Los bits y bytes de las redes informáticas', module: 'La capa de red' },
    { date: '2025-08-02', course: '2. Los bits y bytes de las redes informáticas', module: 'Las capas de transporte y aplicación' },
    { date: '2025-08-03', course: '2. Los bits y bytes de las redes informáticas', module: 'Las capas de transporte y aplicación' },
    { date: '2025-08-04', course: '2. Los bits y bytes de las redes informáticas', module: 'Servicios de redes' },
    { date: '2025-08-05', course: '2. Los bits y bytes de las redes informáticas', module: 'Servicios de redes' },
    { date: '2025-08-06', course: '2. Los bits y bytes de las redes informáticas', module: 'Conexión a Internet' },
    { date: '2025-08-07', course: '2. Los bits y bytes de las redes informáticas', module: 'Conexión a Internet' },
    { date: '2025-08-08', course: '2. Los bits y bytes de las redes informáticas', module: 'La solución de problemas y el futuro de las redes' },
    { date: '2025-08-09', course: '2. Los bits y bytes de las redes informáticas', module: 'La solución de problemas y el futuro de las redes' },
    { date: '2025-08-10', course: '3. Los sistemas operativos y usted: Cómo convertirse en un power user', module: 'Navegar por el sistema' },
    { date: '2025-08-11', course: '3. Los sistemas operativos y usted: Cómo convertirse en un power user', module: 'Navegar por el sistema' },
    { date: '2025-08-12', course: '3. Los sistemas operativos y usted: Cómo convertirse en un power user', module: 'Usuarios y Permisos' },
    { date: '2025-08-13', course: '3. Los sistemas operativos y usted: Cómo convertirse en un power user', module: 'Usuarios y Permisos' },
    { date: '2025-08-14', course: '3. Los sistemas operativos y usted: Cómo convertirse en un power user', module: 'Gestión de paquetes y software' },
    { date: '2025-08-15', course: '3. Los sistemas operativos y usted: Cómo convertirse en un power user', module: 'Gestión de paquetes y software' },
    { date: '2025-08-16', course: '3. Los sistemas operativos y usted: Cómo convertirse en un power user', module: 'Sistemas de archivos' },
    { date: '2025-08-17', course: '3. Los sistemas operativos y usted: Cómo convertirse en un power user', module: 'Sistemas de archivos' },
    { date: '2025-08-18', course: '3. Los sistemas operativos y usted: Cómo convertirse en un power user', module: 'Gestión de procesos' },
    { date: '2025-08-19', course: '3. Los sistemas operativos y usted: Cómo convertirse en un power user', module: 'Gestión de procesos' },
    { date: '2025-08-20', course: '3. Los sistemas operativos y usted: Cómo convertirse en un power user', module: 'Gestión de procesos' },
    { date: '2025-08-21', course: '3. Los sistemas operativos y usted: Cómo convertirse en un power user', module: 'Los sistemas operativos en la práctica' },
    { date: '2025-08-22', course: '3. Los sistemas operativos y usted: Cómo convertirse en un power user', module: 'Los sistemas operativos en la práctica' },
    { date: '2025-08-23', course: '3. Los sistemas operativos y usted: Cómo convertirse en un power user', module: 'Los sistemas operativos en la práctica' },
    { date: '2025-08-24', course: '4. Administración de sistemas y servicios de infraestructura de TI', module: '¿Qué es la administración de sistemas?' },
    { date: '2025-08-25', course: '4. Administración de sistemas y servicios de infraestructura de TI', module: 'Servicios de red e infraestructura' },
    { date: '2025-08-26', course: '4. Administración de sistemas y servicios de infraestructura de TI', module: 'Servicios de red e infraestructura' },
    { date: '2025-08-27', course: '4. Administración de sistemas y servicios de infraestructura de TI', module: 'Servicios de red e infraestructura' },
    { date: '2025-08-28', course: '4. Administración de sistemas y servicios de infraestructura de TI', module: 'Servicios de software y plataforma como servicio' },
    { date: '2025-08-29', course: '4. Administración de sistemas y servicios de infraestructura de TI', module: 'Servicios de software y plataforma como servicio' },
    { date: '2025-08-30', course: '4. Administración de sistemas y servicios de infraestructura de TI', module: 'Servicios de directorio' },
    { date: '2025-08-31', course: '4. Administración de sistemas y servicios de infraestructura de TI', module: 'Servicios de directorio' },
    { date: '2025-09-01', course: '4. Administración de sistemas y servicios de infraestructura de TI', module: 'Servicios de directorio' },
    { date: '2025-09-02', course: '4. Administración de sistemas y servicios de infraestructura de TI', module: 'Recuperación de datos y copias de seguridad' },
    { date: '2025-09-03', course: '4. Administración de sistemas y servicios de infraestructura de TI', module: 'Recuperación de datos y copias de seguridad' },
    { date: '2025-09-04', course: '4. Administración de sistemas y servicios de infraestructura de TI', module: 'Proyecto final' },
    { date: '2025-09-05', course: '4. Administración de sistemas y servicios de infraestructura de TI', module: 'Proyecto final' },
    { date: '2025-09-06', course: '5. Seguridad informática: Defensa contra las artes oscuras', module: 'Comprender las Amenazas a la Seguridad' },
    { date: '2025-09-07', course: '5. Seguridad informática: Defensa contra las artes oscuras', module: 'Criptografía' },
    { date: '2025-09-08', course: '5. Seguridad informática: Defensa contra las artes oscuras', module: 'Criptografía' },
    { date: '2025-09-09', course: '5. Seguridad informática: Defensa contra las artes oscuras', module: 'Las 3 A de la ciberseguridad: Autenticación, autorización y contabilidad' },
    { date: '2025-09-10', course: '5. Seguridad informática: Defensa contra las artes oscuras', module: 'Seguridad para sus redes' },
    { date: '2025-09-11', course: '5. Seguridad informática: Defensa contra las artes oscuras', module: 'Seguridad para sus redes' },
    { date: '2025-09-12', course: '5. Seguridad informática: Defensa contra las artes oscuras', module: 'Defensa en profundidad' },
    { date: '2025-09-13', course: '5. Seguridad informática: Defensa contra las artes oscuras', module: 'Defensa en profundidad' },
    { date: '2025-09-14', course: '5. Seguridad informática: Defensa contra las artes oscuras', module: 'Creación de una cultura empresarial para la Seguridad' },
    { date: '2025-09-15', course: '5. Seguridad informática: Defensa contra las artes oscuras', module: 'Agilice los flujos de trabajo con IA' },
    { date: '2025-09-16', course: '5. Seguridad informática: Defensa contra las artes oscuras', module: 'Agilice los flujos de trabajo con IA' },
    { date: '2025-09-17', course: '6. Acelere su búsqueda de empleo con IA', module: 'Descubra sus Habilidades transferibles con IA' },
    { date: '2025-09-18', course: '6. Acelere su búsqueda de empleo con IA', module: 'Planifique su búsqueda de empleo con IA' },
    { date: '2025-09-19', course: '6. Acelere su búsqueda de empleo con IA', module: 'Gestione sus aplicaciones de empleo con IA' },
    { date: '2025-09-20', course: '6. Acelere su búsqueda de empleo con IA', module: 'Preparar y practicar entrevistas con IA' },
];

export const COURSE_NAMES: string[] = [
    ...new Set(schedule.map(item => item.course))
];

export const COURSE_SHORT_NAMES: string[] = [
    "Fundamentos de TI",
    "Redes Informáticas",
    "Sistemas Operativos",
    "Admin. de Sistemas",
    "Seguridad Informática",
    "Búsqueda Empleo IA"
];