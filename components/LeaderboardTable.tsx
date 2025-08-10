import React, { useState, useEffect } from 'react';
import { Student, Status } from '../types';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import { TOTAL_MAX_POINTS, MAX_POINTS_PER_COURSE, COURSE_NAMES, COURSE_SHORT_NAMES, STATUS_CONFIG } from '../constants';

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
  generateAudioScript: (student: Student) => string;
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

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ students, initialStudents, onUpdateProgress, isReadOnly, currentCourseName, onSelectStudent, onSort, sortConfig, onOpenReportModal, generateAudioScript }) => {
  const [editingCell, setEditingCell] = useState<{ studentId: number; courseIndex: number } | null>(null);
  const [speakingStudentId, setSpeakingStudentId] = useState<number | null>(null);

  useEffect(() => {
    // Cleanup function to stop speech synthesis when the component unmounts
    return () => {
        if (window.speechSynthesis?.speaking) {
            window.speechSynthesis.cancel();
        }
    };
  }, []);

  const handleToggleAudio = (student: Student) => {
    if (!('speechSynthesis' in window)) {
        alert('Tu navegador no soporta la síntesis de voz.');
        return;
    }

    // If this student is speaking, stop them.
    if (speakingStudentId === student.id) {
        window.speechSynthesis.cancel();
        setSpeakingStudentId(null);
        return;
    }
    
    // If another student is speaking, stop them before starting the new one.
    if (window.speechSynthesis.speaking) {
         window.speechSynthesis.cancel();
    }

    const script = generateAudioScript(student);
    const utterance = new SpeechSynthesisUtterance(script);
    utterance.lang = 'es-ES';
    utterance.pitch = 1;
    utterance.rate = 1;
    
    utterance.onstart = () => {
        setSpeakingStudentId(student.id);
    }

    utterance.onend = () => {
        setSpeakingStudentId(null);
    };

    utterance.onerror = () => {
        setSpeakingStudentId(null);
    };

    window.speechSynthesis.speak(utterance);
  };


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
    <>
      {/* Desktop View */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-lg custom-scrollbar">
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
              const isRiesgo = student.status === Status.Riesgo;

              const rowClass = isFinalizada
                ? 'bg-slate-50 font-medium'
                : isRiesgo
                ? 'bg-red-50 border-l-4 border-red-400 hover:bg-red-100'
                : 'hover:bg-gray-50';
              
              return (
              <tr key={student.id} className={`${rowClass} transition-colors duration-200`}>
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

      {/* Mobile Sort Controls */}
      <div className="md:hidden mb-4">
        <div className="flex items-center justify-between bg-gray-100 p-1.5 rounded-lg text-sm">
            <span className="text-gray-600 font-medium ml-2">Ordenar por:</span>
            <div className="flex items-center gap-1">
                {['name', 'totalPoints', 'status'].map(key => {
                    const labels: { [key: string]: string } = {
                        name: 'Nombre',
                        totalPoints: 'Puntaje',
                        status: 'Estado',
                    };
                    const isActive = sortConfig.key === key;
                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => onSort(key)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors font-semibold ${
                                isActive ? 'bg-white text-sky-600 shadow-sm' : 'text-gray-500 hover:bg-gray-200'
                            }`}
                        >
                            <span>{labels[key]}</span>
                            <SortIndicator direction={isActive ? sortConfig.direction : null} />
                        </button>
                    );
                })}
            </div>
        </div>
      </div>
      
      {/* Mobile View */}
      <div className="md:hidden space-y-3">
        {students.map((student, index) => {
           const originalStudent = initialStudents.find(s => s.id === student.id);
           const isSpeaking = speakingStudentId === student.id;
           const isRiesgo = student.status === Status.Riesgo;
           return (
            <div key={student.id} className={`bg-white rounded-lg shadow-sm overflow-hidden transition-all ${
                isRiesgo 
                   ? 'border-2 border-red-400 ring-2 ring-red-100' 
                   : 'border border-gray-200'
            }`}>
                {/* Student Info Part - not clickable */}
                <div className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <span className="text-xl font-bold text-gray-400 w-6 text-center flex-shrink-0">{index + 1}</span>
                            <span className={`w-1.5 h-10 rounded-full ${STATUS_CONFIG[student.status].indicatorColor} flex-shrink-0`}></span>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 leading-tight truncate">{student.name}</p>
                                <StatusBadge status={student.status} />
                            </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                             <button
                                onClick={(e) => { e.stopPropagation(); handleToggleAudio(student); }}
                                title={isSpeaking ? "Detener reporte" : "Escuchar reporte en audio"}
                                className="p-2 rounded-full text-sky-600 active:bg-sky-100 transition-colors"
                            >
                                {isSpeaking ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
                                )}
                                <span className="sr-only">Reporte de audio para {student.name}</span>
                            </button>
                            {student.phone && (
                               <button
                                  onClick={(e) => { e.stopPropagation(); onOpenReportModal(student.id); }}
                                  title="Abrir opciones de reporte"
                                  className="p-2 rounded-full text-green-600 active:bg-green-100 transition-colors"
                              >
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                                  <span className="sr-only">Opciones de reporte para {student.name}</span>
                              </button>
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation(); onSelectStudent(student.id); }}
                                title="Ver perfil detallado"
                                className="p-2 rounded-full text-gray-400 active:bg-gray-100 transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                                <span className="sr-only">Ver perfil de {student.name}</span>
                            </button>
                        </div>
                    </div>
                    <div className="mt-4 pl-9">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-sky-600">{student.totalPoints} pts</span>
                            <span className="text-gray-500">Esperado: {Math.round(student.expectedPoints)} pts</span>
                        </div>
                    </div>
                </div>

                {/* Scrollable Course Scores */}
                <div className="overflow-x-auto custom-scrollbar bg-gray-50/50" onClick={e => e.stopPropagation()}>
                    <div className="flex items-stretch gap-1.5 p-2 min-w-max">
                        {student.courseProgress.map((progress, i) => {
                            const isEditing = editingCell?.studentId === student.id && editingCell?.courseIndex === i;
                            const isModified = originalStudent && originalStudent.courseProgress[i] !== progress;
                            const isCompleted = progress === MAX_POINTS_PER_COURSE;
                            const isCurrentCourse = COURSE_NAMES[i] === currentCourseName;

                            return (
                                <div
                                    key={i}
                                    className={`relative flex-shrink-0 w-24 flex flex-col justify-between text-center p-2 rounded-lg transition-colors cursor-pointer border ${isCurrentCourse ? 'border-sky-300 bg-sky-50' : 'border-gray-200 bg-white'} ${isCompleted ? 'bg-green-50 border-green-200' : ''}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (!isReadOnly && !isEditing) setEditingCell({ studentId: student.id, courseIndex: i });
                                    }}
                                >
                                    <div className={`text-xs font-semibold truncate ${isCompleted ? 'text-green-800' : 'text-gray-500'}`} title={COURSE_NAMES[i]}>
                                        Curso {i + 1}
                                    </div>
                                    <div className="text-[10px] text-gray-400 font-medium truncate">{COURSE_SHORT_NAMES[i]}</div>
                                    {isModified && <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-yellow-400 rounded-full" title="Valor modificado"></span>}
                                    
                                    <div className="mt-1">
                                    {isEditing ? (
                                        <input
                                            type="number"
                                            defaultValue={progress}
                                            onBlur={(e) => handleBlur(e, student.id, i)}
                                            onKeyDown={(e) => handleKeyDown(e, student.id, i)}
                                            autoFocus
                                            className="w-full bg-white border-gray-300 rounded-md p-1 text-center font-bold text-lg text-gray-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                                            min="0"
                                            max="100"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        <span className={`block w-full text-lg font-bold rounded-md transition-colors ${isCompleted ? 'text-green-900' : 'text-gray-900'} ${isReadOnly ? '' : 'hover:bg-gray-100'}`}>
                                            {progress}
                                        </span>
                                    )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
           );
        })}
      </div>
    </>
  );
};

export default LeaderboardTable;