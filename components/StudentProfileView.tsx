import React, { useState, useEffect } from 'react';
import { Student, Status } from '../types';
import StatusBadge from './StatusBadge';
import RankBadge from './RankBadge';
import ProgressChart from './ProgressChart';
import { COURSE_SHORT_NAMES, TOTAL_MAX_POINTS } from '../constants';
import AchievementBadge from './AchievementBadge';
import TrophyBadge from './TrophyBadge';

interface StudentProfileViewProps {
    student: Student;
    chartData: any; // Simplified for now
    note: string;
    onUpdateNote: (note: string) => void;
    onBack: () => void;
    isFirstPlace: boolean;
}

const InfoCard: React.FC<{ title: string; children: React.ReactNode; className?: string }> = ({ title, children, className = '' }) => (
    <div className={`bg-white p-6 rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
        {children}
    </div>
);

const VerificationItem: React.FC<{ label: string; verified: boolean }> = ({ label, verified }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
        <span className="text-sm text-gray-600">{label}</span>
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${verified ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
            {verified ? 'Realizado' : 'Pendiente'}
        </span>
    </div>
);

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};

const StudentProfileView: React.FC<StudentProfileViewProps> = ({ student, chartData, note, onUpdateNote, onBack, isFirstPlace }) => {
    const [currentNote, setCurrentNote] = useState(note);
    const debouncedNote = useDebounce(currentNote, 500);

    useEffect(() => {
        onUpdateNote(debouncedNote);
    }, [debouncedNote, onUpdateNote]);

    const isTop3 = student.rankBadge === 'Top 3';

    const achievements = {
        perfectStreak: student.status === Status.Avanzada || student.status === Status.EliteI || student.status === Status.EliteII,
        earlyBird: student.status === Status.EliteII,
        ironConsistency: student.status === Status.EliteI || student.status === Status.EliteII,
        pioneer: student.courseProgress.some(p => p === 100) && isTop3,
        lightspeed: student.expectedPoints > 0 && student.totalPoints >= student.expectedPoints * 1.5,
        knowledgeMaster: student.totalPoints === TOTAL_MAX_POINTS
    };


    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <button onClick={onBack} className="flex items-center gap-2 text-sm text-sky-600 hover:text-sky-500 font-semibold mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        Volver al Monitor
                    </button>
                    <h1 className="text-3xl font-extrabold text-gray-900">{student.name}</h1>
                </div>
                <div className="flex flex-col items-start sm:items-end gap-2">
                    <div className="flex items-center gap-2">
                        {student.rankBadge && <RankBadge rank={student.rankBadge} />}
                        <StatusBadge status={student.status} />
                    </div>
                    <p className="text-lg font-bold text-sky-600">{student.totalPoints} <span className="text-sm font-medium text-gray-500">/ {student.expectedPoints.toFixed(0)} puntos esperados</span></p>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    <InfoCard title="Gráfico de Progreso vs. Esperado">
                        <ProgressChart data={chartData} />
                    </InfoCard>

                    <InfoCard title="Logros de Curso">
                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                            {student.courseProgress.map((progress, index) => (
                                <AchievementBadge
                                    key={`course-${index}`}
                                    isUnlocked={progress === 100}
                                    title={`Curso ${index + 1}`}
                                    subtitle={COURSE_SHORT_NAMES[index]}
                                />
                            ))}
                            <AchievementBadge
                                key="final-cert"
                                isUnlocked={student.finalCertificateStatus}
                                title="Final"
                                subtitle="Certificado"
                                isFinal={true}
                            />
                        </div>
                    </InfoCard>
                    
                     <InfoCard title="Trofeos Especiales">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <TrophyBadge
                                isUnlocked={isFirstPlace}
                                title="Primer Lugar"
                                description="La puntuación más alta de todo el grupo. ¡Felicidades!"
                                icon={<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>}
                            />
                            <TrophyBadge
                                isUnlocked={achievements.perfectStreak}
                                title="Racha Perfecta"
                                description="Mantente por delante del cronograma para ganar."
                                icon={<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M9.09 14l-1.18 3.55-1.18-3.55-3.55-1.18 3.55-1.18L8 8l1.18 3.55L10.36 14z"/><path d="M16 16l-1-3-1 3-3 1 3 1 1 3 1-3 3-1-3-1z"/></svg>}
                            />
                            <TrophyBadge
                                isUnlocked={achievements.earlyBird}
                                title="Madrugadora Digital"
                                description="Lleva una ventaja considerable (status Elite II)."
                                icon={<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.11S7.09 9.81 7.94 9.1c1.26-1.5 5-2 5-2s-.5 3.74-2 5c-.84.71-2.3.7-3.11.05s-1.66-1.66-1.11-2.51c.55-.85 1.26-1.5 2.51-1.11z"/><path d="m21.5 2.5-1.9 1.9"/><path d="M13 11c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.11S15.09 9.81 15.94 9.1c1.26-1.5 5-2 5-2s-.5 3.74-2 5c-.84.71-2.3.7-3.11.05s-1.66-1.66-1.11-2.51c.55-.85 1.26-1.5 2.51-1.11z"/></svg>}
                            />
                            <TrophyBadge
                                isUnlocked={achievements.ironConsistency}
                                title="Constancia de Acero"
                                description="Mantén un rendimiento de élite consistente."
                                icon={<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.7 10.3a2.41 2.41 0 0 0-1.02 2.74 2.41 2.41 0 0 0 .03 3.42l7.52 7.52a2.41 2.41 0 0 0 3.42 0l7.52-7.52a2.41 2.41 0 0 0 .03-3.42 2.41 2.41 0 0 0-1.02-2.74l-5.49-2.06a2.41 2.41 0 0 0-2.02 0Z"/><path d="m12 22 2.5-2.5"/><path d="M12 22v-6.5"/><path d="m9.5 19.5-2.5 2.5"/><path d="M12 15.5v-3.5"/><path d="M12 2l7.52 7.52a2.41 2.41 0 0 1 .03 3.42l-7.52 7.52a2.41 2.41 0 0 1-3.42 0L4.45 12.94a2.41 2.41 0 0 1 .03-3.42L12 2Z"/></svg>}
                            />
                            <TrophyBadge
                                isUnlocked={achievements.pioneer}
                                title="Pionera"
                                description="Completa un curso y mantente en el Top 3."
                                icon={<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 15c-4 0-7 2-7 5v2"/><path d="M11 21V11l2.5 2.5L16 11V3l5 2-2.5 2.5L21 10Z"/><path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z"/></svg>}
                            />
                            <TrophyBadge
                                isUnlocked={achievements.lightspeed}
                                title="Velocidad de la Luz"
                                description="Avanza a un ritmo 50% más rápido que lo esperado."
                                icon={<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 3-3 6h6l-3 6"/><path d="M22 13a10 10 0 1 1-12-10"/></svg>}
                            />
                            <TrophyBadge
                                isUnlocked={achievements.knowledgeMaster}
                                title="Maestra del Saber"
                                description="Completa todos los 6 cursos con puntaje perfecto."
                                icon={<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/><path d="m16 2-2 4 2 4 2-4-2-4Z"/><path d="m12 6-2 4 2 4 2-4-2-4Z"/><path d="m8 2-2 4 2 4 2-4-2-4Z"/></svg>}
                            />
                        </div>
                    </InfoCard>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-1 space-y-6">
                    <InfoCard title="Verificaciones">
                        <div className="space-y-1">
                            <VerificationItem label="Identidad Verificada" verified={student.identityVerified} />
                            <VerificationItem label="Autenticación de 2 Pasos" verified={student.twoFactorVerified} />
                        </div>
                    </InfoCard>

                    <InfoCard title="Certificados Entregados">
                        <div className="space-y-1">
                            {student.certificateStatus.map((status, i) => (
                                <VerificationItem key={i} label={`Curso ${i+1}: ${COURSE_SHORT_NAMES[i]}`} verified={status} />
                            ))}
                             <VerificationItem label="Certificado Final" verified={student.finalCertificateStatus} />
                             <VerificationItem label="Certificado DTV" verified={student.dtvStatus} />
                        </div>
                    </InfoCard>
                    
                    <InfoCard title="Notas Privadas del Instructor">
                        <textarea
                            value={currentNote}
                            onChange={(e) => setCurrentNote(e.target.value)}
                            placeholder="Anota aquí tus comentarios, seguimientos o recordatorios sobre esta estudiante..."
                            className="w-full h-32 bg-gray-50 border-gray-200 rounded-md p-3 text-gray-900 focus:ring-2 focus:ring-sky-500 focus:outline-none transition-colors"
                        />
                        <p className="text-xs text-gray-400 mt-2">Los cambios se guardan automáticamente.</p>
                    </InfoCard>
                </div>
            </div>
        </div>
    );
};

export default StudentProfileView;