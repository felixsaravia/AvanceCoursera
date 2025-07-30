import React from 'react';
import { Student } from '../types';
import { COURSE_NAMES, COURSE_SHORT_NAMES } from '../constants';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student | null;
    generateWhatsAppLink: (student: Student, type: string, data?: any) => string;
    weeklyScheduleText: string;
    nextCourseDeadline: { courseName: string; date: string } | null;
}

const ModalOptionButton: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    href: string;
}> = ({ icon, title, description, href }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 group"
    >
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-200 group-hover:bg-sky-100 rounded-lg text-sky-600 transition-colors">
            {icon}
        </div>
        <div>
            <p className="font-semibold text-gray-800">{title}</p>
            <p className="text-xs text-gray-500">{description}</p>
        </div>
        <div className="ml-auto text-gray-400 group-hover:text-sky-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
    </a>
);

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, student, generateWhatsAppLink, weeklyScheduleText, nextCourseDeadline }) => {
    if (!isOpen || !student) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Contactar a {student.name.split(' ')[0]}</h3>
                        <p className="text-sm text-gray-500">Selecciona una acción rápida</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>
                <div className="space-y-3">
                    <ModalOptionButton
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>}
                        title="Enviar Reporte de Avance"
                        description="Mensaje pre-escrito con su estado y puntajes."
                        href={generateWhatsAppLink(student, 'report')}
                    />
                     <ModalOptionButton
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
                        title="Enviar Mensaje en Blanco"
                        description="Abre un chat para escribir un mensaje personalizado."
                        href={generateWhatsAppLink(student, 'blank')}
                    />
                    <ModalOptionButton
                        icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>}
                        title="Enviar Cronograma Semanal"
                        description="Mandar las actividades programadas para la semana."
                        href={generateWhatsAppLink(student, 'schedule', { scheduleText: weeklyScheduleText })}
                    />
                    {nextCourseDeadline && (
                         <ModalOptionButton
                            icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
                            title="Recordar Próxima Entrega"
                            description={`Informar sobre la fecha de fin del curso actual.`}
                            href={generateWhatsAppLink(student, 'deadline', { deadline: nextCourseDeadline })}
                         />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportModal;