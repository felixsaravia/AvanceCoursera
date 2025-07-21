

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Student, Status, CommunityQuestion, Answer, ScheduleItem, Break } from './types';
import { MOCK_NAMES, TOTAL_COURSES, MAX_POINTS_PER_COURSE, TOTAL_MAX_POINTS, STATUS_CONFIG, schedule, orderedStatuses } from './constants';
import LeaderboardTable from './components/LeaderboardTable';
import AIAnalyzer from './components/AIAnalyzer';
import BottomNav from './components/BottomNav';
import VerificationView from './components/VerificationView';
import CertificatesView from './components/CertificatesView';
import HelpView from './components/HelpView';
import ToolsView from './components/ToolsView';

const parseDateAsUTC = (dateString: string): Date => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(NaN);
  }
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
};

const getTodayInElSalvador = (): Date => {
  const now = new Date();
  const elSalvadorTime = new Date(now.getTime() - (6 * 60 * 60 * 1000));
  return new Date(Date.UTC(
    elSalvadorTime.getUTCFullYear(),
    elSalvadorTime.getUTCMonth(),
    elSalvadorTime.getUTCDate()
  ));
};


export type ActiveView = 'monitor' | 'verification' | 'certificates' | 'config' | 'help' | 'tools';

type SyncStatus = {
    time: Date | null;
    status: 'idle' | 'syncing' | 'success' | 'error';
    message?: string;
};

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxiTI7pcAYDf9q21OoforACNDhzKS_ph0hb-C02VuFxd8n6vqJDbnsrluazMkv9r5705A/exec';

const formatSyncTime = (date: Date | null) => {
    if (!date) return 'nunca';
    return date.toLocaleTimeString('es-ES');
};

const SaveChangesHeader: React.FC<{
  syncStatus: SyncStatus;
  onSave: () => void;
  hasUnsavedChanges: boolean;
}> = ({ syncStatus, onSave, hasUnsavedChanges }) => {
    const isSyncing = syncStatus.status === 'syncing';
    let statusText: string;
    let statusColor: string;
    let icon: React.ReactNode;

    if (isSyncing) {
        statusText = 'Guardando...';
        statusColor = 'text-sky-400';
        icon = <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
    } else if (syncStatus.status === 'error') {
        statusText = syncStatus.message || 'Error al guardar';
        statusColor = 'text-red-400';
        icon = <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>;
    } else if (hasUnsavedChanges) {
        statusText = 'Cambios sin guardar';
        statusColor = 'text-amber-400';
        icon = <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
    } else {
        statusText = 'Todos los cambios guardados';
        statusColor = 'text-green-400';
        icon = <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
    }

    return (
        <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className={statusColor}>{icon}</span>
            <div>
              <p className="font-semibold text-white">Guardar en Google Sheets</p>
              <p className={`text-sm ${statusColor}`}>
                  {statusText}
                  {syncStatus.status === 'success' && !hasUnsavedChanges && ` - Última vez: ${formatSyncTime(syncStatus.time)}`}
              </p>
            </div>
          </div>
          <button
            onClick={onSave}
            disabled={isSyncing || !hasUnsavedChanges}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed disabled:text-slate-400"
          >
            {isSyncing ? 'Guardando...' : (
                <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                Guardar Cambios
                </>
            )}
          </button>
        </div>
    );
};

const ConfigView: React.FC<{
  startDate: string;
  setStartDate: (date: string) => void;
  totalWorkingDays: number;
  setTotalWorkingDays: (days: number) => void;
  breaks: Break[];
  newBreak: { start: string, end: string };
  setNewBreak: (b: { start: string, end: string }) => void;
  handleAddBreak: () => void;
  handleRemoveBreak: (id: number) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleExportToCSV: () => void;
  initializeStudents: () => void;
}> = ({
  startDate, setStartDate, totalWorkingDays, setTotalWorkingDays,
  breaks, newBreak, setNewBreak, handleAddBreak, handleRemoveBreak,
  handleFileUpload, handleExportToCSV, initializeStudents
}) => (
    <section className="space-y-8">
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Parámetros del Curso</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="start-date" className="block text-sm font-medium text-slate-300 mb-2">Fecha de Inicio del Curso</label>
                    <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-sky-500" />
                </div>
                <div>
                    <label htmlFor="total-days" className="block text-sm font-medium text-slate-300 mb-2">Total de Días Laborales</label>
                    <input type="number" id="total-days" value={totalWorkingDays} onChange={e => setTotalWorkingDays(parseInt(e.target.value, 10))} className="w-full bg-slate-700 border-slate-600 rounded-md p-2 text-white focus:ring-2 focus:ring-sky-500" />
                </div>
            </div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Períodos de Descanso</h2>
            <div className="space-y-4 mb-6">
                {breaks.map(b => (
                    <div key={b.id} className="flex items-center justify-between bg-slate-800 p-3 rounded-md">
                        <p className="text-slate-300">Del <span className="font-semibold text-sky-400">{b.start}</span> al <span className="font-semibold text-sky-400">{b.end}</span></p>
                        <button onClick={() => handleRemoveBreak(b.id)} className="text-red-500 hover:text-red-400">&times;</button>
                    </div>
                ))}
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4">
                <input type="date" value={newBreak.start} onChange={e => setNewBreak({ ...newBreak, start: e.target.value })} className="flex-1 w-full md:w-auto bg-slate-700 border-slate-600 rounded-md p-2 text-white" />
                <input type="date" value={newBreak.end} onChange={e => setNewBreak({ ...newBreak, end: e.target.value })} className="flex-1 w-full md:w-auto bg-slate-700 border-slate-600 rounded-md p-2 text-white" />
                <button onClick={handleAddBreak} className="w-full md:w-auto px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500">Añadir</button>
            </div>
        </div>

        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <h2 className="text-xl font-bold text-white mb-4">Gestión de Estudiantes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <label className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 transition-colors cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Importar CSV
                    <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                </label>
                <button onClick={handleExportToCSV} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-600 text-white font-semibold rounded-lg hover:bg-slate-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    Exportar CSV
                </button>
                 <button onClick={() => { if(window.confirm('¿Seguro que quieres reiniciar la lista de estudiantes a la original? Se perderán todos los cambios no guardados.')) initializeStudents(); }} className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                    Reiniciar Lista
                </button>
            </div>
        </div>
    </section>
);


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
  
  const [driveFolderUrl, setDriveFolderUrl] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ time: null, status: 'idle' });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const isInitialLoad = useRef(true);


  const initializeStudents = useCallback((names: string[] = MOCK_NAMES) => {
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
    setHasUnsavedChanges(true);
  }, []);

  const initializeCommunityQuestions = useCallback(() => {
      setCommunityQuestions([]);
  }, []);

  const fetchInitialData = useCallback(async () => {
    setSyncStatus({ status: 'syncing', time: null, message: 'Cargando datos iniciales...' });
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, { method: 'GET', redirect: 'follow' });
        if (!response.ok) throw new Error(`Error en la respuesta del servidor: ${response.statusText}`);
        
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        
        if(Array.isArray(data) && data.length > 0) {
            const fetchedStudents = data.map((s, index) => ({
              id: index + 1,
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
            setSyncStatus({ status: 'success', time: new Date(), message: 'Datos cargados correctamente.' });
        } else {
            initializeStudents(MOCK_NAMES);
            setSyncStatus({ status: 'idle', time: null, message: 'Se cargó la lista de respaldo. Guarda para crear la hoja.' });
        }
        setHasUnsavedChanges(false);
        
    } catch (error: any) {
        console.error("Failed to fetch from Google Sheets, using fallback:", error);
        let errorMessage = `Error al cargar: ${error.message}. Se usará la lista de respaldo.`;
        setSyncStatus({ status: 'error', time: new Date(), message: errorMessage });
        initializeStudents(MOCK_NAMES);
        setHasUnsavedChanges(false);
    }
  }, [initializeStudents]);

  useEffect(() => {
      const savedDriveUrl = localStorage.getItem('driveFolderUrl') || '';
      setDriveFolderUrl(savedDriveUrl);
  }, []);
  
  useEffect(() => {
    if (isInitialLoad.current) {
        isInitialLoad.current = false;
        fetchInitialData();
        initializeCommunityQuestions();
    }
  }, [fetchInitialData, initializeCommunityQuestions]);

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
    setHasUnsavedChanges(true);
  }, []);
  
  const formatDate = (dateString: string) => {
      const date = parseDateAsUTC(dateString);
      if (isNaN(date.getTime())) return '...';
      return date.toLocaleDateString('es-ES', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  const currentCourseAndModule = useMemo(() => {
    const today = getTodayInElSalvador();

    if (!schedule || schedule.length === 0) {
        return { course: 'Plan no definido', module: 'No hay tema para hoy' };
    }

    const firstDate = parseDateAsUTC(schedule[0].date);
    if (isNaN(firstDate.getTime()) || today.getTime() < firstDate.getTime()) {
        return { course: 'El curso aún no ha comenzado', module: `Inicia el ${formatDate(schedule[0].date)}` };
    }

    const lastDate = parseDateAsUTC(schedule[schedule.length - 1].date);
    if (!isNaN(lastDate.getTime()) && today.getTime() > lastDate.getTime()) {
         return { course: '¡Curso Finalizado!', module: 'Felicidades por completar el programa.' };
    }

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
            if (date.getTime() >= breakPeriod.start.getTime() && date.getTime() <= breakPeriod.end.getTime()) return true;
        }
        return false;
    };
    
    const pointsPerDay = TOTAL_MAX_POINTS / totalWorkingDays;
    const today = getTodayInElSalvador();
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

      if (totalPoints >= TOTAL_MAX_POINTS) status = Status.Finalizada;
      else if (totalPoints === 0) status = Status.SinIniciar;
      else {
        const difference = totalPoints - finalExpectedPoints;
        if (difference >= 150) status = Status.EliteII;
        else if (difference >= 100) status = Status.EliteI;
        else if (difference > 0) status = Status.Avanzada;
        else if (difference >= -25) status = Status.AlDia;
        else if (difference >= -75) status = Status.Atrasada;
        else status = Status.Riesgo;
      }
      return { ...student, totalPoints, expectedPoints: finalExpectedPoints, status };
    });

    return {
      processedStudents: calculated.sort((a, b) => b.totalPoints - a.totalPoints),
      expectedPointsToday: finalExpectedPoints
    };
  }, [students, startDate, totalWorkingDays, breaks]);

  const statusCounts = useMemo(() => {
    const counts: Record<Status, number> = {} as any;
    orderedStatuses.forEach(s => counts[s] = 0);
    for (const student of processedStudents) {
        counts[student.status]++;
    }
    return counts;
  }, [processedStudents]);

  const handleUpdateVerificationStatus = useCallback((studentId: number, verificationType: 'identity' | 'twoFactor') => {
    setStudents(currentStudents =>
      currentStudents.map(student => {
        if (student.id === studentId) {
          if (verificationType === 'identity') return { ...student, identityVerified: !student.identityVerified };
          else return { ...student, twoFactorVerified: !student.twoFactorVerified };
        }
        return student;
      })
    );
    setHasUnsavedChanges(true);
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
    setHasUnsavedChanges(true);
  }, []);

  const handleUpdateOtherCertificateStatus = useCallback((studentId: number, type: 'final' | 'dtv') => {
    setStudents(currentStudents =>
      currentStudents.map(student => {
        if (student.id === studentId) {
          if (type === 'final') return { ...student, finalCertificateStatus: !student.finalCertificateStatus };
          else return { ...student, dtvStatus: !student.dtvStatus };
        }
        return student;
      })
    );
    setHasUnsavedChanges(true);
  }, []);

  const handleAskCommunityQuestion = useCallback((questionText: string) => {
    const newQuestion: CommunityQuestion = {
      id: Date.now(),
      author: studentNames[Math.floor(Math.random() * studentNames.length)] || 'Anónimo',
      text: questionText,
      timestamp: new Date(),
      answers: [],
    };
    setCommunityQuestions(prev => [newQuestion, ...prev]);
  }, [studentNames]);

  const handleAddCommunityAnswer = useCallback((questionId: number, answerText: string) => {
    const newAnswer: Answer = {
      id: Date.now(),
      author: studentNames[Math.floor(Math.random() * studentNames.length)] || 'Anónimo',
      text: answerText,
      timestamp: new Date(),
    };
    setCommunityQuestions(prev => prev.map(q => q.id === questionId ? { ...q, answers: [...q.answers, newAnswer] } : q));
  }, [studentNames]);

  const handleAddBreak = () => {
    if (newBreak.start && newBreak.end) {
        const start = parseDateAsUTC(newBreak.start);
        const end = parseDateAsUTC(newBreak.end);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start.getTime() <= end.getTime()) {
            setBreaks([...breaks, { id: Date.now(), ...newBreak }]);
            setNewBreak({ start: '', end: '' });
            setHasUnsavedChanges(true);
        } else {
            alert('Las fechas del período de descanso no son válidas.');
        }
    }
  };

  const handleRemoveBreak = (id: number) => {
    setBreaks(breaks.filter(b => b.id !== id));
    setHasUnsavedChanges(true);
  };
  
  const handleSetStartDate = (date: string) => {
      setStartDate(date);
      setHasUnsavedChanges(true);
  }
  const handleSetTotalWorkingDays = (days: number) => {
      setTotalWorkingDays(days);
      setHasUnsavedChanges(true);
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target?.result as string;
        try {
            const lines = text.split(/\r\n|\n/).filter(line => line.trim() !== '');
            if (lines.length < 2) throw new Error("Archivo CSV vacío o sin datos.");

            const header = lines[0].split(',').map(h => h.trim().toLowerCase());
            const nameIndex = header.indexOf('nombre');

            if (nameIndex === -1) throw new Error('El archivo CSV debe contener una columna "Nombre".');

            const names = lines.slice(1).map(line => line.split(',')[nameIndex]?.trim()).filter(Boolean);

            if (names.length > 0) {
                initializeStudents(names);
                alert(`${names.length} estudiantes importados.`);
            } else {
                throw new Error('No se encontraron nombres válidos.');
            }
        } catch (error: any) {
            alert(`Error al procesar el archivo: ${error.message}`);
        }
        event.target.value = '';
    };
    reader.onerror = () => alert("Error al leer el archivo.");
    reader.readAsText(file);
  };
  
  const saveData = useCallback(async () => {
      if (syncStatus.status === 'syncing') return;
      setSyncStatus({ status: 'syncing', time: null, message: 'Guardando...' });
      
      try {
        const payload = JSON.stringify(processedStudents);
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded', },
            body: new URLSearchParams({ 'payload': payload }),
            redirect: 'follow',
        });
        
        if (response.ok) {
           const result = await response.json();
           if (result.status === 'success') {
                setSyncStatus({ status: 'success', time: new Date(), message: result.message || 'Datos guardados con éxito.' });
                setHasUnsavedChanges(false);
           } else {
               throw new Error(result.message || 'Error desconocido del script.');
           }
        } else {
            const errorText = await response.text();
            throw new Error(errorText || `Error del servidor: ${response.status}`);
        }
      } catch (error: any) {
         console.error("Save failed:", error);
         const errorMessage = `Error al guardar: ${error.message}.`;
         setSyncStatus({ status: 'error', time: new Date(), message: errorMessage });
      }
  }, [processedStudents, syncStatus.status]);

  const handleExportToCSV = useCallback(() => {
    if (processedStudents.length === 0) {
      alert("No hay datos para exportar.");
      return;
    }

    const courseHeaders = Array.from({ length: TOTAL_COURSES }, (_, i) => `C${i + 1}`);
    const certHeaders = Array.from({ length: TOTAL_COURSES }, (_, i) => `Cert. C${i + 1}`);

    const headers = [ "Nombre", "Estado", "Puntos Totales", "Puntos Esperados", ...courseHeaders, "Verif. Identidad", "Verif. Dos Pasos", ...certHeaders, "Cert. Final", "Certificado DTV" ];
    const rows = processedStudents.map(s => [ `"${s.name.replace(/"/g, '""')}"`, s.status, s.totalPoints, s.expectedPoints.toFixed(2), ...s.courseProgress, s.identityVerified, s.twoFactorVerified, ...s.certificateStatus, s.finalCertificateStatus, s.dtvStatus ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `export_estudiantes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [processedStudents]);

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
        
        <main>
          {activeView === 'monitor' && (
            <div>
              <SaveChangesHeader syncStatus={syncStatus} onSave={saveData} hasUnsavedChanges={hasUnsavedChanges} />
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
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
                      Haz clic en la celda de un curso (C1, C2...) para editar el puntaje.
                  </p>
              </div>

              <LeaderboardTable students={processedStudents} onUpdateProgress={handleUpdateStudentProgress} />
            </div>
          )}

          {activeView === 'verification' && (
            <>
              <SaveChangesHeader syncStatus={syncStatus} onSave={saveData} hasUnsavedChanges={hasUnsavedChanges} />
              <VerificationView students={processedStudents} onUpdateVerification={handleUpdateVerificationStatus} />
            </>
          )}

          {activeView === 'certificates' && (
            <>
              <SaveChangesHeader syncStatus={syncStatus} onSave={saveData} hasUnsavedChanges={hasUnsavedChanges} />
              <CertificatesView students={processedStudents} onUpdateCertificateStatus={handleUpdateCertificateStatus} onUpdateOtherStatus={handleUpdateOtherCertificateStatus} />
            </>
          )}

          {activeView === 'tools' && <ToolsView />}

          {activeView === 'help' && (
            <HelpView 
              questions={communityQuestions} 
              onAskQuestion={handleAskCommunityQuestion}
              onAddAnswer={handleAddCommunityAnswer}
              driveFolderUrl={driveFolderUrl} 
            />
          )}

          {activeView === 'config' && (
            <ConfigView 
              startDate={startDate}
              setStartDate={handleSetStartDate}
              totalWorkingDays={totalWorkingDays}
              setTotalWorkingDays={handleSetTotalWorkingDays}
              breaks={breaks}
              newBreak={newBreak}
              setNewBreak={setNewBreak}
              handleAddBreak={handleAddBreak}
              handleRemoveBreak={handleRemoveBreak}
              handleFileUpload={handleFileUpload}
              handleExportToCSV={handleExportToCSV}
              initializeStudents={() => initializeStudents()}
            />
          )}

        </main>
      </div>
      <BottomNav activeView={activeView} setActiveView={setActiveView} />
    </div>
  );
};

export default App;