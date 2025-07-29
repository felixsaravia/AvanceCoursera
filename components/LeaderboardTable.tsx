import React, { useState } from 'react';
import { Student, Status } from '../types';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import { TOTAL_MAX_POINTS, MAX_POINTS_PER_COURSE, COURSE_NAMES, COURSE_SHORT_NAMES } from '../constants';

interface LeaderboardTableProps {
  students: Student[];
  initialStudents: Student[];
  onUpdateProgress: (studentId: number, courseIndex: number, newProgress: number) => void;
  isReadOnly: boolean;
  currentCourseName: string;
  onSelectStudent: (studentId: number) => void;
  onSort: (key: string) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' };
  onOpenReportModal: (studentId: number) => void;
}

const SortIndicator = ({ direction }: { direction: 'asc' | 'desc' | null }) => {
    if (direction === null) {
        // Unsorted state icon: subtle up/down arrows
        return <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 opacity-50 group-hover:opacity-100"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>;
    }
    if (direction === 'asc') {
        // Ascending icon: up arrow
        return <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-sky-600"><path d="m18 15-6-6-6 6"/></svg>;
    }
    // Descending icon: down arrow
    return <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-sky-600"><path d="m6 9 6 6 6-6"/></svg>;
};

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ students, initialStudents, onUpdateProgress, isReadOnly, currentCourseName, onSelectStudent, onSort, sortConfig, onOpenReportModal }) => {
  const [editingCell, setEditingCell] = useState<{ studentId: number; courseIndex: number } | null>(null);

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>, studentId: number, courseIndex: number) => {
    let newProgress = parseInt(e.target.value, 10);
    if (isNaN(newProgress)) newProgress = 0;
    newProgress = Math.max(0, Math.min(MAX_POINTS_PER_COURSE, newProgress)); // Clamp value
    onUpdateProgress(studentId, courseIndex, newProgress);
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, studentId: number, courseIndex: number) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const SortableHeader: React.FC<{ sortKey: string; children: React.ReactNode; className?: string, title?: string }> = ({ sortKey, children, className, title }) => (
    <th scope="col" className={`py-3.5 px-3 text-sm font-semibold text-gray-500 ${className}`} title={title}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="group flex items-center gap-1.5 w-full hover:text-gray-900 transition-colors"
      >
        {children}
        <SortIndicator direction={sortConfig.key === sortKey ? sortConfig.direction : null} />
      </button>
    </th>
  );


  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-lg custom-scrollbar">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="w-16 text-center py-3.5 px-3 text-sm font-semibold text-gray-500">#</th>
            <SortableHeader sortKey="name" className="text-left">Nombre</SortableHeader>
            <th scope="col" className="w-16 text-center py-3.5 px-3 text-sm font-semibold text-gray-500"><span className="sr-only">Ver Perfil</span></th>
            <th scope="col" className="w-20 text-center py-3.5 px-3 text-sm font-semibold text-gray-500">Reporte</th>
            <SortableHeader sortKey="status" className="text-left">Estado</SortableHeader>
            {COURSE_SHORT_NAMES.map((name, i) => {
              const isCurrentCourse = COURSE_NAMES[i] === currentCourseName;
              return (
                <SortableHeader 
                  key={i} 
                  sortKey={`courseProgress.${i}`}
                  className={`text-center whitespace-nowrap transition-colors ${isCurrentCourse ? 'bg-sky-100' : ''}`}
                  title={COURSE_NAMES[i]}
                >
                  <div className="text-center w-full">
                    <div className="font-semibold">Curso {i + 1}</div>
                    <div className="font-normal mt-1">{name}</div>
                  </div>
                </SortableHeader>
              );
            })}
            <th scope="col" className="w-48 py-3.5 px-3 text-left text-sm font-semibold text-gray-500">Progreso Total</th>
            <SortableHeader sortKey="totalPoints" className="text-center">Puntos</SortableHeader>
            <SortableHeader sortKey="expectedPoints" className="text-center">Esperado</SortableHeader>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {students.map((student, index) => {
            const originalStudent = initialStudents.find(s => s.id === student.id);
            const isFinalizada = student.status === Status.Finalizada;
            return (
            <tr key={student.id} className={`${isFinalizada ? 'bg-slate-50 font-medium' : 'hover:bg-gray-50'} transition-colors duration-200`}>
              <td className="whitespace-nowrap text-center py-4 px-3 text-lg font-bold text-gray-500">{index + 1}</td>
              <td className="whitespace-nowrap py-4 px-3 text-sm font-medium text-gray-900">
                 {student.name}
              </td>
              <td className="whitespace-nowrap text-center py-4 px-3">
                 <button 
                    onClick={() => onSelectStudent(student.id)}
                    title="Ver perfil detallado"
                    className="text-gray-500 hover:text-sky-600 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18.7 8a2 2 0 0 1 0 2.8l-6 6-4-4-4 4"/></svg>
                    <span className="sr-only">Ver perfil de {student.name}</span>
                </button>
              </td>
              <td className="whitespace-nowrap text-center py-4 px-3">
                {student.phone && (
                     <button
                        onClick={() => onOpenReportModal(student.id)}
                        title="Abrir opciones de reporte"
                        className="inline-block text-green-600 hover:text-green-700 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        <span className="sr-only">Opciones de reporte para {student.name}</span>
                    </button>
                )}
              </td>
              <td className="whitespace-nowrap py-4 px-3 text-sm"><StatusBadge status={student.status} /></td>
              {student.courseProgress.map((progress, i) => {
                const isEditing = editingCell?.studentId === student.id && editingCell?.courseIndex === i;
                const isCurrentCourse = COURSE_NAMES[i] === currentCourseName;
                const isModified = originalStudent && originalStudent.courseProgress[i] !== progress;
                const isCompleted = progress === MAX_POINTS_PER_COURSE;

                return (
                  <td
                    key={i}
                    className={`relative whitespace-nowrap text-center py-2 px-1 text-sm transition-colors ${isCurrentCourse ? 'bg-sky-50' : ''} ${isCompleted ? 'bg-green-100 text-green-800 font-bold' : 'text-gray-600'}`}
                    onClick={() => !isReadOnly && !isEditing && setEditingCell({ studentId: student.id, courseIndex: i })}
                  >
                     {isModified && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-400 rounded-full" title="Valor modificado"></span>}
                    {isEditing ? (
                      <input
                        type="number"
                        defaultValue={progress}
                        onBlur={(e) => handleBlur(e, student.id, i)}
                        onKeyDown={(e) => handleKeyDown(e, student.id, i)}
                        autoFocus
                        className="w-20 bg-white border-gray-300 rounded-md p-2 text-center text-gray-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        min="0"
                        max="100"
                      />
                    ) : (
                      <span className={`inline-block w-full py-2 rounded-md transition-colors ${isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-gray-100'}`}>
                        {progress}
                      </span>
                    )}
                  </td>
                )
              })}
              <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-600">
                <ProgressBar progress={(student.totalPoints / TOTAL_MAX_POINTS) * 100} />
              </td>
              <td className="whitespace-nowrap text-center py-4 px-3 text-sm font-semibold text-sky-600">{student.totalPoints}</td>
              <td className="whitespace-nowrap text-center py-4 px-3 text-sm text-gray-500">{Math.round(student.expectedPoints)}</td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;