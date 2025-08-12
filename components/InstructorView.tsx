import React, { useMemo } from 'react';
import { Student } from '../types';
import { COURSE_NAMES } from '../constants';

interface InstructorViewProps {
    students: Student[];
    courseEndDates: (Date | null)[];
    today: Date;
    onOpenReportModal: (studentId: number) => void;
    courseNames: string[];
}

const ActionCard: React.FC<{ title: string; count: number; icon: React.ReactNode; children: React.ReactNode; iconContainerClasses?: string }> = ({ title, count, icon, children, iconContainerClasses = 'bg-amber-100 text-amber-600' }) => {
    if (count === 0) {
        return (
            <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm flex items-center gap-4">
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
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
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

const InstructorView: React.FC<InstructorViewProps> = ({ students, courseEndDates, today, onOpenReportModal, courseNames }) => {
    
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

    return (
        <section className="space-y-6">
            <ActionCard
                title="Cursos Vencidos"
                count={overdueStudents.length}
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
            >
                {overdueStudents.map(({ student, overdueCourses }) => (
                    <StudentListItem
                        key={`${student.id}-overdue`}
                        student={student}
                        onContact={() => onOpenReportModal(student.id)}
                        details={<p>Cursos vencidos: <span className="font-medium">{overdueCourses.join(', ')}</span></p>}
                    />
                ))}
            </ActionCard>

            <ActionCard
                title="Estudiantes en Riesgo"
                count={enRiesgoStudents.length}
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>}
                iconContainerClasses="bg-red-100 text-red-600"
            >
                {enRiesgoStudents.map(student => (
                    <StudentListItem
                        key={`${student.id}-risk`}
                        student={student}
                        onContact={() => onOpenReportModal(student.id)}
                        details={<p>Estado: <span className="font-medium">{student.status}</span>, {Math.round(student.expectedPoints - student.totalPoints)} puntos por debajo de lo esperado.</p>}
                    />
                ))}
            </ActionCard>

            <ActionCard
                title="Estudiantes Atrasadas"
                count={atrasadasStudents.length}
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>}
                iconContainerClasses="bg-orange-100 text-orange-600"
            >
                {atrasadasStudents.map(student => (
                    <StudentListItem
                        key={`${student.id}-delayed`}
                        student={student}
                        onContact={() => onOpenReportModal(student.id)}
                        details={<p>Estado: <span className="font-medium">{student.status}</span>, {Math.round(student.expectedPoints - student.totalPoints)} puntos por debajo de lo esperado.</p>}
                    />
                ))}
            </ActionCard>

            <ActionCard
                title="Certificados Pendientes"
                count={missingCertificatesStudents.length}
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>}
            >
                {missingCertificatesStudents.map(({ student, missingCourses }) => (
                    <StudentListItem
                        key={`${student.id}-certs`}
                        student={student}
                        onContact={() => onOpenReportModal(student.id)}
                        details={<p>Pendiente de entregar: <span className="font-medium">{missingCourses.join(', ')}</span></p>}
                    />
                ))}
            </ActionCard>

            <ActionCard
                title="Verificaciones Pendientes"
                count={pendingVerificationsStudents.length}
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
            >
                {pendingVerificationsStudents.map(({ student, pendingItems }) => (
                     <StudentListItem
                        key={`${student.id}-verify`}
                        student={student}
                        onContact={() => onOpenReportModal(student.id)}
                        details={<p>Pasos pendientes: <span className="font-medium">{pendingItems.join(' y ')}</span></p>}
                    />
                ))}
            </ActionCard>
        </section>
    );
};

export default InstructorView;