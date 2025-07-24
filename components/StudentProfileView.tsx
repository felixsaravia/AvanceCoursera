import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import StatusBadge from './StatusBadge';
import RankBadge from './RankBadge';
import ProgressChart from './ProgressChart';
import { COURSE_SHORT_NAMES } from '../constants';

interface StudentProfileViewProps {
    student: Student;
    chartData: any; // Simplified for now
    note: string;
    onUpdateNote: (note: string) => void;
    onBack: () => void;
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

const StudentProfileView: React.FC<StudentProfileViewProps> = ({ student, chartData, note, onUpdateNote, onBack }) => {
    const [currentNote, setCurrentNote] = useState(note);
    const debouncedNote = useDebounce(currentNote, 500);

    useEffect(() => {
        onUpdateNote(debouncedNote);
    }, [debouncedNote, onUpdateNote]);

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
                </div>

                {/* Right Column */}
                <div className="space-y-6">
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
                </div>

                 {/* Notes section below */}
                <div className="lg:col-span-3">
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