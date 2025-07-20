

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Student, Status, CommunityQuestion, Answer } from './types';
import { MOCK_NAMES, TOTAL_COURSES, MAX_POINTS_PER_COURSE, TOTAL_MAX_POINTS, STATUS_CONFIG, schedule } from './constants';
import LeaderboardTable from './components/LeaderboardTable';
import AIAnalyzer from './components/AIAnalyzer';
import BottomNav from './components/BottomNav';
import VerificationView from './components/VerificationView';
import CertificatesView from './components/CertificatesView';
import HelpView from './components/HelpView';
import ToolsView from './components/ToolsView';

/**
 * Parses a 'YYYY-MM-DD' date string into a Date object at UTC midnight.
 * This method is more robust than `new Date(string)` as it avoids
 * browser-specific and timezone-related parsing issues.
 * @param dateString The date string in 'YYYY-MM-DD' format.
 * @returns A Date object set to midnight UTC for the given date.
 */
const parseDateAsUTC = (dateString: string): Date => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(NaN); // Return invalid date for downstream checking
  }
  const [year, month, day] = dateString.split('-').map(Number);
  // Month is 0-indexed in Date.UTC (e.g., January is 0)
  return new Date(Date.UTC(year, month - 1, day));
};

interface Break {
    id: number;
    start: string;
    end: string;
}

export type ActiveView = 'monitor' | 'verification' | 'certificates' | 'config' | 'help' | 'tools';

type SyncStatus = {
    time: Date | null;
    status: 'idle' | 'syncing' | 'success' | 'error';
    message?: string;
};

const orderedStatuses: Status[] = [
    Status.Finalizada,
    Status.EliteII,
    Status.EliteI,
    Status.Avanzada,
    Status.AlDia,
    Status.Atrasada,
    Status.Riesgo,
    Status.SinIniciar
];

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbws3ash5SdBepexz3F_ePw6KNSBM9U8ooOZm78btj0bIT0SjhQ_nUwpE3nVkse14q-I/exec';

const App: React.FC = () => {
  const [studentNames, setStudentNames] = useState<string[]>(MOCK_NAMES);
  const [students, setStudents] = useState<Omit<Student, 'totalPoints' | 'expectedPoints' | 'status'>[]>([]);
  const [startDate, setStartDate] = useState<string>('2025-07-21');
  const [totalWorkingDays, setTotalWorkingDays] = useState<number>(62);
  const [breaks, setBreaks] = useState<Break[]>([
      { id: 1, start: '2025-04-13', end: '2025-04-20' }
  ]);
  const [newBreak, setNewBreak] = useState({ start: '', end: '' });
  const [activeView, setActiveView] = useState<ActiveView>('monitor');
  const [communityQuestions, setCommunityQuestions] = useState<CommunityQuestion[]>([]);
  
  // State for Google Sheets Sync
  const [driveFolderUrl, setDriveFolderUrl] = useState<string>('');
  const [tempDriveFolderUrl, setTempDriveFolderUrl] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ time: null, status: 'idle' });
  const [autoSync, setAutoSync] = useState<boolean>(false);
  const isInitialLoad = useRef(true);


  const initializeStudents = useCallback((names: string[]) => {
    const initialStudents = names.map((name, index) => ({
      id: index + 1,
      name,
      courseProgress: Array(TOTAL_COURSES).fill(0),
      identityVerified: false,
      twoFactorVerified: false,
      certificateStatus: Array(TOTAL_COURSES).fill(false),
      finalCertificateStatus: false,
      dtvStatus: false,
    }));
    setStudents(initialStudents);
    setStudentNames(names);
  }, []);

  const initializeCommunityQuestions = useCallback(() => {
      setCommunityQuestions([]);
  }, []);

  const fetchInitialData = useCallback(async () => {
    console.log("Attempting to fetch initial data from Google Sheets...");
    setSyncStatus({ status: 'syncing', time: null, message: 'Cargando datos iniciales...' });
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, { method: 'GET', redirect: 'follow' });
        if (!response.ok) {
            throw new Error(`Error en la respuesta del servidor: ${response.statusText}`);
        }
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        
        console.log(`Fetched ${data.length} students from Google Sheets.`);
        if(Array.isArray(data) && data.length > 0) {
            const fetchedStudents = data.map((s, index) => ({
              id: index + 1, // Re-assign IDs for consistency
              name: s.name,
              courseProgress: s.courseProgress || Array(TOTAL_COURSES).fill(0),
              identityVerified: s.identityVerified || false,
              twoFactorVerified: s.twoFactorVerified || false,
              certificateStatus: s.certificateStatus || Array(TOTAL_COURSES).fill(false),
              finalCertificateStatus: s.finalCertificateStatus || false,
              dtvStatus: s.dtvStatus || false,
            }));
            setStudents(fetchedStudents);
            setStudentNames(fetchedStudents.map(s => s.name));
        } else {
            initializeStudents(MOCK_NAMES);
        }
        setSyncStatus({ status: 'success', time: new Date(), message: 'Datos cargados correctamente.' });
        return true;
    } catch (error) {
        console.error("Failed to fetch from Google Sheets:", error);
        const errorMessage = `Error al cargar: ${error.message}. Verifica tu conexión a internet.`;
        setSyncStatus({ status: 'error', time: new Date(), message: errorMessage });
        return false;
    }
  }, [initializeStudents]);

  // Load config from localStorage on initial mount
  useEffect(() => {
      const savedAutoSync = localStorage.getItem('autoSync') === 'true';
      const savedDriveUrl = localStorage.getItem('driveFolderUrl') || '';
      setAutoSync(savedAutoSync);
      setDriveFolderUrl(savedDriveUrl);
      setTempDriveFolderUrl(savedDriveUrl);
  }, []);
  
  // Initial data load logic
  useEffect(() => {
    if (!isInitialLoad.current) return;
    isInitialLoad.current = false;

    // Always initialize with the local MOCK_NAMES to ensure the updated list is shown.
    initializeStudents(MOCK_NAMES);
    initializeCommunityQuestions();
}, [initializeStudents, initializeCommunityQuestions]);

  const handleUpdateStudentProgress = useCallback((studentId: number, courseIndex: number, newProgress: number) => {
    setStudents(currentStudents =>
      currentStudents.map(student => {
        if (student.id === studentId) {
          const updatedCourseProgress = [...student.courseProgress];
          updatedCourseProgress[courseIndex] = newProgress;
          return { ...student, courseProgress: updatedCourseProgress };
        }
        return student;
      })
    );
  }, []);
  
  const formatDate = (dateString: string) => {
      const date = parseDateAsUTC(dateString);
      if (isNaN(date.getTime())) return '...';
      return date.toLocaleDateString('es-ES', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  const currentCourseAndModule = useMemo(() => {
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    if (!schedule || schedule.length === 0) {
        return { course: 'Plan no definido', module: 'No hay tema para hoy' };
    }

    const firstDate = parseDateAsUTC(schedule[0].date);
    if (isNaN(firstDate.getTime()) || today.getTime() < firstDate.getTime()) {
        return {
            course: 'El curso aún no ha comenzado',
            module: `Inicia el ${formatDate(schedule[0].date)}`
        };
    }

    const lastDate = parseDateAsUTC(schedule[schedule.length - 1].date);
    if (!isNaN(lastDate.getTime()) && today.getTime() > lastDate.getTime()) {
         return {
            course: '¡Curso Finalizado!',
            module: 'Felicidades por completar el programa.'
        };
    }

    // Find the most recent task that is on or before today
    let currentTask = null;
    for (let i = schedule.length - 1; i >= 0; i--) {
        const itemDate = parseDateAsUTC(schedule[i].date);
        if (!isNaN(itemDate.getTime()) && itemDate.getTime() <= today.getTime()) {
            currentTask = schedule[i];
            break;
        }
    }
    
    return currentTask || { course: 'Plan no definido', module: 'No hay tema para hoy' };
  }, []);

  const { processedStudents, expectedPointsToday } = useMemo(() => {
    const start = parseDateAsUTC(startDate);

    if (isNaN(start.getTime()) || totalWorkingDays <= 0) {
      const allStudentsWithZero = students.map(student => {
        const totalPoints = student.courseProgress.reduce((sum, current) => sum + current, 0);
        return { ...student, totalPoints, expectedPoints: 0, status: totalPoints === 0 ? Status.SinIniciar : Status.AlDia };
      });
      return {
        processedStudents: allStudentsWithZero.sort((a, b) => b.totalPoints - a.totalPoints),
        expectedPointsToday: 0
      };
    }

    const parsedBreaks = breaks.map(b => ({
        start: parseDateAsUTC(b.start),
        end: parseDateAsUTC(b.end)
    })).filter(b => !isNaN(b.start.getTime()) && !isNaN(b.end.getTime()));

    const isDateInBreaks = (date: Date): boolean => {
        for (const breakPeriod of parsedBreaks) {
            if (date.getTime() >= breakPeriod.start.getTime() && date.getTime() <= breakPeriod.end.getTime()) {
                return true;
            }
        }
        return false;
    };
    
    const pointsPerDay = TOTAL_MAX_POINTS / totalWorkingDays;
    
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    let elapsedWorkingDays = 0;

    if (today.getTime() >= start.getTime()) {
        for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
           if (!isDateInBreaks(new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())))) {
               elapsedWorkingDays++;
           }
       }
    }

    const expectedPoints = elapsedWorkingDays * pointsPerDay;
    const finalExpectedPoints = Math.min(expectedPoints, TOTAL_MAX_POINTS);
    
    const calculated = students.map(student => {
      const totalPoints = student.courseProgress.reduce((sum, current) => sum + current, 0);
      
      let status: Status;

      if (totalPoints >= TOTAL_MAX_POINTS) {
        status = Status.Finalizada;
      } else if (totalPoints === 0) {
        status = Status.SinIniciar;
      } else {
        const difference = totalPoints - finalExpectedPoints;
        if (difference >= 150) {
          status = Status.EliteII;
        } else if (difference >= 100) {
          status = Status.EliteI;
        } else if (difference > 0) {
          status = Status.Avanzada;
        } else if (difference >= -25) {
          status = Status.AlDia;
        } else if (difference >= -75) {
          status = Status.Atrasada;
        } else { // difference < -75
          status = Status.Riesgo;
        }
      }
      
      return { ...student, totalPoints, expectedPoints: finalExpectedPoints, status };
    });

    return {
      processedStudents: calculated.sort((a, b) => b.totalPoints - a.totalPoints),
      expectedPointsToday: finalExpectedPoints
    };
  }, [students, startDate, totalWorkingDays, breaks]);

  const statusCounts = useMemo(() => {
    const counts: Record<Status, number> = {
        [Status.Finalizada]: 0,
        [Status.EliteII]: 0,
        [Status.EliteI]: 0,
        [Status.Avanzada]: 0,
        [Status.AlDia]: 0,
        [Status.Atrasada]: 0,
        [Status.Riesgo]: 0,
        [Status.SinIniciar]: 0,
    };

    for (const student of processedStudents) {
        counts[student.status]++;
    }
    return counts;
  }, [processedStudents]);

  const handleUpdateVerificationStatus = useCallback((studentId: number, verificationType: 'identity' | 'twoFactor') => {
    setStudents(currentStudents =>
      currentStudents.map(student => {
        if (student.id === studentId) {
          if (verificationType === 'identity') {
            return { ...student, identityVerified: !student.identityVerified };
          } else {
            return { ...student, twoFactorVerified: !student.twoFactorVerified };
          }
        }
        return student;
      })
    );
  }, []);

  const handleUpdateCertificateStatus = useCallback((studentId: number, courseIndex: number) => {
    setStudents(currentStudents =>
      currentStudents.map(student => {
        if (student.id === studentId) {
          const updatedCertificateStatus = [...student.certificateStatus];
          updatedCertificateStatus[courseIndex] = !updatedCertificateStatus[courseIndex];
          return { ...student, certificateStatus: updatedCertificateStatus };
        }
        return student;
      })
    );
  }, []);

  const handleUpdateOtherCertificateStatus = useCallback((studentId: number, type: 'final' | 'dtv') => {
    setStudents(currentStudents =>
      currentStudents.map(student => {
        if (student.id === studentId) {
          if (type === 'final') {
            return { ...student, finalCertificateStatus: !student.finalCertificateStatus };
          } else { // type === 'dtv'
            return { ...student, dtvStatus: !student.dtvStatus };
          }
        }
        return student;
      })
    );
  }, []);

  const handleAskCommunityQuestion = useCallback((questionText: string) => {
    const newQuestion: CommunityQuestion = {
      id: Date.now(),
      author: studentNames[Math.floor(Math.random() * studentNames.length)] || 'Anónimo', // Placeholder author
      text: questionText,
      timestamp: new Date(),
      answers: [],
    };
    setCommunityQuestions(prev => [newQuestion, ...prev]);
  }, [studentNames]);

  const handleAddCommunityAnswer = useCallback((questionId: number, answerText: string) => {
    const newAnswer: Answer = {
      id: Date.now(),
      author: studentNames[Math.floor(Math.random() * studentNames.length)] || 'Anónimo', // Placeholder author
      text: answerText,
      timestamp: new Date(),
    };
    setCommunityQuestions(prev =>
      prev.map(q =>
        q.id === questionId
          ? { ...q, answers: [...q.answers, newAnswer] }
          : q
      )
    );
  }, [studentNames]);

  const handleAddBreak = () => {
    if (newBreak.start && newBreak.end) {
        const start = parseDateAsUTC(newBreak.start);
        const end = parseDateAsUTC(newBreak.end);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start.getTime() <= end.getTime()) {
            setBreaks([...breaks, { id: Date.now(), ...newBreak }]);
            setNewBreak({ start: '', end: '' });
        } else {
            alert('Las fechas del período de descanso no son válidas. Asegúrese de que la fecha de inicio sea anterior o igual a la fecha de finalización.');
        }
    }
  };

  const handleRemoveBreak = (id: number) => {
    setBreaks(breaks.filter(b => b.id !== id));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target?.result as string;
        try {
            const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
            if (lines.length < 2) throw new Error("El archivo CSV está vacío o no tiene datos.");

            const header = lines[0].split(',').map(h => h.trim().toLowerCase());
            const nameIndex = header.indexOf('nombre');

            if (nameIndex === -1) {
                throw new Error('El archivo CSV debe contener una columna con el encabezado "Nombre".');
            }

            const names = lines.slice(1)
                .map(line => line.split(',')[nameIndex]?.trim())
                .filter(Boolean);

            if (names.length > 0) {
                initializeStudents(names);
                alert(`${names.length} estudiantes importados correctamente. La aplicación se ha reiniciado con la nueva lista.`);
            } else {
                throw new Error('No se encontraron nombres válidos en el archivo CSV.');
            }
        } catch (error) {
            alert(`Error al procesar el archivo: ${error.message}`);
        }
        event.target.value = '';
    };
    reader.onerror = () => alert("Error al leer el archivo.");
    reader.readAsText(file);
  };
  
   const handleSaveDriveUrl = useCallback(() => {
    localStorage.setItem('driveFolderUrl', tempDriveFolderUrl);
    setDriveFolderUrl(tempDriveFolderUrl);
    alert('URL de la carpeta de Drive guardada correctamente.');
  }, [tempDriveFolderUrl]);

  const handleToggleAutoSync = (checked: boolean) => {
      setAutoSync(checked);
      localStorage.setItem('autoSync', String(checked));
  };
  
  const syncData = useCallback(async () => {
      if (syncStatus.status === 'syncing') return;
      setSyncStatus({ status: 'syncing', time: null, message: 'Sincronizando...' });
      
      try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: { 'Content-Type': 'text/plain' }, // Use text/plain for doPost
            body: JSON.stringify(processedStudents), // Send the full processed student data
            redirect: 'follow'
        });
        
        if (response.ok) {
           setSyncStatus({ status: 'success', time: new Date(), message: 'Datos sincronizados con éxito.' });
        } else {
            const errorText = await response.text();
            throw new Error(errorText || `Error del servidor: ${response.status}`);
        }

      } catch (error) {
         console.error("Sync failed:", error);
         const errorMessage = `Error de sincronización: ${error.message}. Verifica tu conexión a internet.`;
         setSyncStatus({ status: 'error', time: new Date(), message: errorMessage });
      }
  }, [processedStudents, syncStatus.status]);

  const handleExportToCSV = useCallback(() => {
    if (processedStudents.length === 0) {
      alert("No hay datos de estudiantes para exportar.");
      return;
    }

    const courseHeaders = Array.from({ length: TOTAL_COURSES }, (_, i) => `C${i + 1}`);
    const certHeaders = Array.from({ length: TOTAL_COURSES }, (_, i) => `Cert. C${i + 1}`);

    const headers = [
      "Nombre", "Estado", "Puntos Totales", "Puntos Esperados",
      ...courseHeaders,
      "Verif. Identidad", "Verif. Dos Pasos",
      ...certHeaders,
      "Cert. Final", "Certificado DTV"
    ];

    const rows = processedStudents.map(s => [
      `"${s.name.replace(/"/g, '""')}"`, // Handle names with quotes
      s.status,
      s.totalPoints,
      s.expectedPoints.toFixed(2),
      ...s.courseProgress,
      s.identityVerified,
      s.twoFactorVerified,
      ...s.certificateStatus,
      s.finalCertificateStatus,
      s.dtvStatus
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `export_estudiantes_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [processedStudents]);

  // Effect for auto-syncing with debounce
  useEffect(() => {
    if (!autoSync || isInitialLoad.current) return;

    const handler = setTimeout(() => {
        syncData();
    }, 2500); // 2.5-second debounce

    return () => {
        clearTimeout(handler);
    };
  }, [students, autoSync, syncData]);

  const formatSyncTime = (date: Date | null) => {
      if (!date) return 'nunca';
      return date.toLocaleTimeString('es-ES');
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 pb-24">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-black text-white tracking-tight">
            Monitor de Avance <span className="text-sky-400">Coursera TI</span>
          </h1>
          <p className="mt-2 text-lg text-slate-400">
            Registro de puntajes y estado de la certificación en tiempo real.
          </p>
        </header>

        {activeView === 'monitor' && (
          <div>
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-sm font-medium text-slate-400">Puntaje Esperado a la Fecha</h3>
                    <p className="text-3xl font-bold text-white mt-1">{expectedPointsToday.toFixed(2)}</p>
                </div>
                <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 flex flex-col justify-center">
                    <h3 className="text-sm font-medium text-slate-400 mb-2">Enfoque del Día</h3>
                    <p className="text-lg font-semibold text-white leading-tight truncate" title={currentCourseAndModule.course}>
                        {currentCourseAndModule.course}
                    </p>
                    <p className="text-md text-sky-400 mt-1 truncate" title={currentCourseAndModule.module}>
                        {currentCourseAndModule.module}
                    </p>
                </div>
            </section>
            
            <section className="mb-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {orderedStatuses.map(status => {
                  const count = statusCounts[status];
                  const config = STATUS_CONFIG[status];
                  if (!config) return null;

                  return (
                    <div key={status} className={`p-4 rounded-lg border border-slate-700 ${config.color}`}>
                      <div className="flex justify-between items-start">
                        <h4 className={`text-sm font-medium ${config.textColor}`}>{status}</h4>
                        <span className={`w-5 h-5 ${config.textColor}`}>{config.icon}</span>
                      </div>
                      <p className="text-3xl font-bold text-white mt-2">{count}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            <AIAnalyzer students={processedStudents} expectedPointsToday={expectedPointsToday} />
            
            <div className="mb-6">
                <p className="text-sm text-slate-400 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    Haz clic en un puntaje (C1-C{TOTAL_COURSES}) para editarlo.
                </p>
            </div>

            <main>
              <LeaderboardTable students={processedStudents} onUpdateProgress={handleUpdateStudentProgress} />
            </main>
          </div>
        )}
        
        {activeView === 'verification' && (
          <VerificationView students={processedStudents} onUpdateVerification={handleUpdateVerificationStatus} />
        )}

        {activeView === 'certificates' && (
          <CertificatesView 
            students={processedStudents} 
            onUpdateCertificateStatus={handleUpdateCertificateStatus}
            onUpdateOtherStatus={handleUpdateOtherCertificateStatus}
          />
        )}
        
        {activeView === 'tools' && (
          <ToolsView />
        )}

        {activeView === 'help' && (
          <HelpView
            questions={communityQuestions}
            onAskQuestion={handleAskCommunityQuestion}
            onAddAnswer={handleAddCommunityAnswer}
            driveFolderUrl={driveFolderUrl}
          />
        )}

        {activeView === 'config' && (
          <section className="space-y-6">
            <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                <h3 className="text-lg font-bold text-white mb-4">Configuración de Integraciones</h3>
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-3">
                           <button onClick={syncData} disabled={syncStatus.status === 'syncing'} className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
                                {syncStatus.status === 'syncing' ? 'Sincronizando...' : 'Sincronizar Ahora'}
                            </button>
                            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                                <input type="checkbox" checked={autoSync} onChange={e => handleToggleAutoSync(e.target.checked)} className="w-4 h-4 rounded bg-slate-600 text-sky-500 focus:ring-sky-500 border-slate-500" />
                                Sincronización Automática
                            </label>
                        </div>
                         <div className={`text-sm text-right ${syncStatus.status === 'error' ? 'text-red-400' : 'text-slate-400'}`}>
                            <p title={syncStatus.message}>{syncStatus.message ? (syncStatus.message.length > 50 ? syncStatus.message.substring(0, 50) + '...' : syncStatus.message) : `Última sinc: ${formatSyncTime(syncStatus.time)}`}</p>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-slate-700">
                        <label htmlFor="drive-url" className="text-sm font-medium text-slate-400 block mb-2">URL de Carpeta Compartida en Drive (para Certificados)</label>
                        <div className="flex gap-2">
                            <input id="drive-url" type="url" value={tempDriveFolderUrl} onChange={e => setTempDriveFolderUrl(e.target.value)} className="flex-grow bg-slate-700 border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none" placeholder="Pega la URL de la carpeta de Drive"/>
                            <button onClick={handleSaveDriveUrl} className="px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-500 transition-colors">Guardar</button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Este enlace aparecerá en la pestaña de Ayuda.</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                        <h3 className="text-lg font-bold text-white mb-4">Parámetros del Curso</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-400 block mb-2">Fecha de Inicio</label>
                                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"/>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-slate-400 block mb-2">Días Laborables Totales</label>
                                <input type="number" value={totalWorkingDays} onChange={e => setTotalWorkingDays(Number(e.target.value))} className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none" placeholder="Ej: 64"/>
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                        <h3 className="text-lg font-bold text-white mb-4">Gestión de Datos Local</h3>
                         <div className="space-y-3">
                            <div>
                                <p className="text-sm text-slate-400 mb-2">Carga una lista de estudiantes para reemplazar la actual.</p>
                                <input type="file" id="csv-upload" className="hidden" accept=".csv" onChange={handleFileUpload}/>
                                <label htmlFor="csv-upload" className="w-full text-center block cursor-pointer bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 transition-colors py-2 px-4">
                                    Importar de CSV...
                                </label>
                            </div>
                             <div>
                                <p className="text-sm text-slate-400 mb-2">Guarda el estado actual de todos los estudiantes a un archivo.</p>
                                 <button onClick={handleExportToCSV} className="w-full text-center block cursor-pointer bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 transition-colors py-2 px-4">
                                     Exportar a CSV
                                 </button>
                            </div>
                         </div>
                    </div>
                </div>
                <div className="lg:col-span-2 bg-slate-800/50 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-lg font-bold text-white mb-4">Periodos de Descanso</h3>
                    <div className="space-y-2 mb-6 max-h-40 overflow-y-auto pr-2">
                        {breaks.length > 0 ? breaks.map(b => (
                            <div key={b.id} className="flex justify-between items-center bg-slate-800 p-3 rounded-md">
                                <p className="text-sm text-slate-300 font-medium">
                                    {formatDate(b.start)} - {formatDate(b.end)}
                                </p>
                                <button onClick={() => handleRemoveBreak(b.id)} className="text-slate-500 hover:text-red-400 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                        )) : (
                            <p className="text-sm text-slate-500 text-center py-4">No hay periodos de descanso definidos.</p>
                        )}
                    </div>
                    <div className="pt-4 border-t border-slate-700">
                         <h4 className="text-md font-semibold text-slate-300 mb-3">Agregar Descanso</h4>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                            <div>
                                <label className="text-sm font-medium text-slate-400 block mb-2">Inicio</label>
                                 <input type="date" value={newBreak.start} onChange={e => setNewBreak({...newBreak, start: e.target.value})} className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"/>
                            </div>
                             <div>
                                <label className="text-sm font-medium text-slate-400 block mb-2">Fin</label>
                                 <input type="date" value={newBreak.end} onChange={e => setNewBreak({...newBreak, end: e.target.value})} className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"/>
                            </div>
                         </div>
                         <button onClick={handleAddBreak} className="mt-4 w-full bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors py-2">
                            Agregar Periodo
                        </button>
                    </div>
                </div>
            </div>
        </section>
        )}

        <BottomNav activeView={activeView} setActiveView={setActiveView} />
      </div>
    </div>
  );
};

export default App;
