import React, { useMemo, useState } from 'react';
import { Student, ProcessedScheduleItem } from '../types';
import { COURSE_NAMES } from '../constants';

interface InstructorViewProps {
    students: Student[];
    courseEndDates: (Date | null)[];
    today: Date;
    onOpenReportModal: (studentId: number) => void;
    courseNames: string[];
    schedule: ProcessedScheduleItem[];
}

const StatFilterCard: React.FC<{
    title: string;
    count: number;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
    colorClasses: string;
    textColor: string;
}> = ({ title, count, icon, isActive, onClick, colorClasses, textColor }) => {
    const activeClasses = 'ring-2 ring-offset-2 ring-sky-500 shadow-lg';
    const baseClasses = `w-full text-left p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${colorClasses}`;

    return (
        <button onClick={onClick} className={`${baseClasses} ${isActive ? activeClasses : ''}`}>
            <div className="flex justify-between items-start">
                <div>
                    <p className={`font-bold ${textColor}`}>{title}</p>
                    <p className="text-3xl font-extrabold text-gray-900 mt-2">{count}</p>
                </div>
                <div className={`p-2 rounded-full bg-white/60 ${textColor}`}>{icon}</div>
            </div>
            <p className={`text-xs ${textColor} opacity-80 mt-2`}>{count === 1 ? 'Estudiante' : 'Estudiantes'} en esta categoría</p>
        </button>
    );
};


const ActionCard: React.FC<{ title: string; count: number; icon: React.ReactNode; children: React.ReactNode; iconContainerClasses?: string }> = ({ title, count, icon, children, iconContainerClasses = 'bg-amber-100 text-amber-600' }) => {
    if (count === 0) {
        return (
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4 animate-fade-in-up">
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-green-100 rounded-lg text-green-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <div>
                    <h3 className="font-bold text-gray-800">{title}</h3>
                    <p className="text-sm text-gray-500">¡Todo en orden! No hay estudiantes en esta categoría.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm animate-fade-in-up">
            <div className="p-5 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg ${iconContainerClasses}`}>{icon}</div>
                    <div>
                        <h3 className="font-bold text-gray-800">{title}</h3>
                        <p className="text-sm text-gray-500">{count} {count === 1 ? 'estudiante necesita' : 'estudiantes necesitan'} atención.</p>
                    </div>
                </div>
            </div>
            <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-100">
                    {children}
                </ul>
            </div>
        </div>
    );
};

const StudentListItem: React.FC<{ student: Student; details: React.ReactNode; onContact: () => void; }> = ({ student, details, onContact }) => {
    return (
        <li className="p-4 hover:bg-gray-50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-grow">
                <p className="font-semibold text-gray-900">{student.name}</p>
                <div className="text-sm text-gray-600 mt-1">{details}</div>
            </div>
            <button onClick={onContact} className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-3 py-1.5 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-500 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                <span>Contactar</span>
            </button>
        </li>
    );
};

const ICONS = {
    overdue: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
    risk: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
    delayed: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>,
    certs: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>,
    verification: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    notStarted: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
    notStartedCurrent: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
};

const InstructorView: React.FC<InstructorViewProps> = ({ students, courseEndDates, today, onOpenReportModal, courseNames, schedule }) => {
    const [activeFilter, setActiveFilter] = useState<string | null>(null);

    const { currentCourseIndex, currentCourseName } = useMemo(() => {
        // Find the latest schedule item on or before today
        const lastItemTodayOrBefore = [...schedule]
            .reverse()
            .find(item => new Date(item.date + 'T00:00:00Z').getTime() <= today.getTime());

        const relevantScheduleItem = lastItemTodayOrBefore || schedule[0];

        if (!relevantScheduleItem) {
            return { currentCourseIndex: -1, currentCourseName: 'N/A' };
        }

        const courseName = relevantScheduleItem.course;
        const courseIndex = courseNames.findIndex(cn => cn === courseName);
        
        return { currentCourseIndex: courseIndex, currentCourseName: courseName };
    }, [schedule, today, courseNames]);

    const overdueStudents = useMemo(() => {
        const todayTime = today.getTime();
        const result: { student: Student; overdueCourses: string[] }[] = [];

        students.forEach(student => {
            const overdueC: string[] = [];
            courseEndDates.forEach((endDate, index) => {
                if (endDate && todayTime > endDate.getTime() && student.courseProgress[index] < 100) {
                    overdueC.push(courseNames[index]);
                }
            });
            if (overdueC.length > 0) {
                result.push({ student, overdueCourses: overdueC });
            }
        });
        return result;
    }, [students, courseEndDates, today, courseNames]);

    const enRiesgoStudents = useMemo(() => {
        return students
            .filter(s => s.status === 'En Riesgo')
            .sort((a, b) => (a.expectedPoints - a.totalPoints) - (b.expectedPoints - b.totalPoints));
    }, [students]);

    const atrasadasStudents = useMemo(() => {
        return students
            .filter(s => s.status === 'Atrasada')
            .sort((a, b) => (a.expectedPoints - a.totalPoints) - (b.expectedPoints - b.totalPoints));
    }, [students]);

    const missingCertificatesStudents = useMemo(() => {
        const result: { student: Student; missingCourses: string[] }[] = [];
        students.forEach(student => {
            const missingC: string[] = [];
            student.courseProgress.forEach((progress, index) => {
                if (progress === 100 && !student.certificateStatus[index]) {
                    missingC.push(courseNames[index]);
                }
            });
            if (missingC.length > 0) {
                result.push({ student, missingCourses: missingC });
            }
        });
        return result;
    }, [students, courseNames]);

    const pendingVerificationsStudents = useMemo(() => {
        const result: { student: Student; pendingItems: string[] }[] = [];
        students.forEach(student => {
            const pendingItems: string[] = [];
            if (!student.identityVerified) {
                pendingItems.push('Verificación de Identidad');
            }
            if (!student.twoFactorVerified) {
                pendingItems.push('Verificación de Dos Pasos');
            }
            if (pendingItems.length > 0) {
                result.push({ student, pendingItems });
            }
        });
        return result;
    }, [students]);

    const notStartedStudents = useMemo(() => {
        if (schedule.length === 0) return [];
        const programStartDate = new Date(schedule[0].date + 'T00:00:00Z');
        if (today.getTime() < programStartDate.getTime()) {
            return [];
        }
        return students.filter(s => s.totalPoints === 0);
    }, [students, schedule, today]);

    const notStartedCurrentCourseStudents = useMemo(() => {
        const programStartDate = schedule.length > 0 ? new Date(schedule[0].date + 'T00:00:00Z') : new Date();

        if (currentCourseIndex <= 0 || today.getTime() < programStartDate.getTime()) {
            return [];
        }

        return students.filter(s => s.courseProgress[currentCourseIndex] === 0 && s.totalPoints > 0);
    }, [students, currentCourseIndex, today, schedule]);


    const handleFilterClick = (key: string) => {
        setActiveFilter(prev => (prev === key ? null : key));
    };

    const sections = [
        { key: 'risk', title: 'En Riesgo', data: enRiesgoStudents, icon: ICONS.risk, colors: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', container: 'bg-red-100 text-red-600' } },
        { key: 'delayed', title: 'Atrasadas', data: atrasadasStudents, icon: ICONS.delayed, colors: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', container: 'bg-orange-100 text-orange-600' } },
        { key: 'overdue', title: 'Cursos Vencidos', data: overdueStudents, icon: ICONS.overdue, colors: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', container: 'bg-amber-100 text-amber-600' } },
        { key: 'notStarted', title: 'Sin Iniciar Programa', data: notStartedStudents, icon: ICONS.notStarted, colors: { bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-700', container: 'bg-slate-200 text-slate-600' } },
        { key: 'notStartedCurrent', title: 'Curso Actual Sin Iniciar', data: notStartedCurrentCourseStudents, icon: ICONS.notStartedCurrent, colors: { bg: 'bg-teal-50', border: 'border-teal-200', text: 'text-teal-700', container: 'bg-teal-100 text-teal-600' } },
        { key: 'certs', title: 'Certificados Pendientes', data: missingCertificatesStudents, icon: ICONS.certs, colors: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', container: 'bg-purple-100 text-purple-600' } },
        { key: 'verification', title: 'Verificaciones Pendientes', data: pendingVerificationsStudents, icon: ICONS.verification, colors: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', container: 'bg-blue-100 text-blue-600' } },
    ];

    const getDetailsComponent = (key: string, item: any) => {
        switch (key) {
            case 'risk':
            case 'delayed':
                return <p>Estado: <span className="font-medium">{item.status}</span>, {Math.round(item.expectedPoints - item.totalPoints)} puntos por debajo de lo esperado.</p>
            case 'overdue':
                return <p>Cursos vencidos: <span className="font-medium">{item.overdueCourses.join(', ')}</span></p>;
            case 'certs':
                return <p>Pendiente de entregar: <span className="font-medium">{item.missingCourses.join(', ')}</span></p>;
            case 'verification':
                return <p>Pasos pendientes: <span className="font-medium">{item.pendingItems.join(' y ')}</span></p>;
            case 'notStarted':
                return <p>No ha iniciado el programa.</p>;
            case 'notStartedCurrent':
                return <p>No ha iniciado el curso actual: <span className="font-medium">{currentCourseName}</span></p>;
            default:
                return null;
        }
    };

    return (
        <section className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {sections.map(section => (
                    <StatFilterCard
                        key={section.key}
                        title={section.title}
                        count={section.data.length}
                        icon={section.icon}
                        isActive={activeFilter === section.key}
                        onClick={() => handleFilterClick(section.key)}
                        colorClasses={`${section.colors.bg} ${section.colors.border}`}
                        textColor={section.colors.text}
                    />
                ))}
            </div>

            <div className="space-y-6">
                 {sections.map(section => {
                    if (activeFilter && activeFilter !== section.key) {
                        return null;
                    }
                    const items = section.data as any[];
                    return (
                        <ActionCard
                            key={section.key}
                            title={section.title}
                            count={items.length}
                            icon={section.icon}
                            iconContainerClasses={section.colors.container}
                        >
                            {items.map((item, index) => {
                                const student = ['risk', 'delayed', 'notStarted', 'notStartedCurrent'].includes(section.key) ? item : item.student;
                                return (
                                    <StudentListItem
                                        key={`${student.id}-${section.key}-${index}`}
                                        student={student}
                                        onContact={() => onOpenReportModal(student.id)}
                                        details={getDetailsComponent(section.key, item)}
                                    />
                                );
                            })}
                        </ActionCard>
                    );
                })}
            </div>
        </section>
    );
};

export default InstructorView;