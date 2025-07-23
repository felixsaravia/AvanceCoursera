import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Student, Status, CommunityQuestion, Answer, ScheduleItem, Break } from './types';
import { MOCK_NAMES, TOTAL_COURSES, MAX_POINTS_PER_COURSE, TOTAL_MAX_POINTS, STATUS_CONFIG, schedule, orderedStatuses, COURSE_NAMES } from './constants';
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
  isReadOnly: boolean;
}> = ({ syncStatus, onSave, hasUnsavedChanges, isReadOnly }) => {
    const isSyncing = syncStatus.status === 'syncing';
    let statusText: string;
    let statusColor: string;
    let icon: React.ReactNode;

    if (isReadOnly && syncStatus.status !== 'syncing') {
        statusText = 'Modo de solo lectura';
        statusColor = 'text-gray-500';
        icon = <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.73 18l-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>;
    } else if (isSyncing) {
        statusText = 'Guardando...';
        statusColor = 'text-sky-600';
        icon = <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>;
    } else if (syncStatus.status === 'error') {
        statusText = syncStatus.message || 'Error al guardar';
        statusColor = 'text-red-600';
        icon = <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>;
    } else if (hasUnsavedChanges) {
        statusText = 'Cambios sin guardar';
        statusColor = 'text-amber-600';
        icon = <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
    } else {
        statusText = 'Todos los cambios guardados';
        statusColor = 'text-green-600';
        icon = <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
    }

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className={statusColor}>{icon}</span>
            <div>
              <p className="font-semibold text-gray-900">Guardar en Google Sheets</p>
              <p className={`text-sm ${statusColor}`}>
                  {statusText}
                  {syncStatus.status === 'success' && !hasUnsavedChanges && ` - Última vez: ${formatSyncTime(syncStatus.time)}`}
              </p>
            </div>
          </div>
          <button
            onClick={onSave}
            disabled={isSyncing || !hasUnsavedChanges || isReadOnly}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed disabled:text-gray-500"
          >
            {isSyncing ? 'Guardando...' : (
                <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                <span>Guardar Cambios</span>
                </>
            )}
          </button>
        </div>
    );
};

const AgapeLogo = () => (
    <div className="flex-shrink-0 w-12 h-12 border border-gray-300 rounded-md flex flex-col items-center justify-center bg-white p-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 w-5 h-5">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
        </svg>
        <span className="text-xs font-semibold text-gray-700 leading-none">AGAP</span>
    </div>
);


const App: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [initialStudents, setInitialStudents] = useState<Student[]>([]);
    const [activeView, setActiveView] = useState<ActiveView>('monitor');
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: 'idle', time: null });
    const [isReadOnly, setIsReadOnly] = useState(true);
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [questions, setQuestions] = useState<CommunityQuestion[]>([]);
    
    const hasUnsavedChanges = useMemo(() => {
        return JSON.stringify(students) !== JSON.stringify(initialStudents);
    }, [students, initialStudents]);
    
    const today = useMemo(() => getTodayInElSalvador(), []);

    const scheduleUpToToday = useMemo(() => {
        const todayUTC = today.getTime();
        return schedule.filter(item => {
            const itemDate = parseDateAsUTC(item.date);
            return !isNaN(itemDate.getTime()) && itemDate.getTime() <= todayUTC;
        });
    }, [today]);

    const expectedPointsToday = useMemo(() => {
        const uniqueDays = new Set(scheduleUpToToday.map(item => item.date));
        const totalScheduledDays = new Set(schedule.map(item => item.date)).size;
        
        if (totalScheduledDays === 0) return 0;

        const pointsPerDay = TOTAL_MAX_POINTS / totalScheduledDays;
        return uniqueDays.size * pointsPerDay;
    }, [scheduleUpToToday]);
    
    const currentCourseName = useMemo(() => {
      const lastScheduledItem = scheduleUpToToday.length > 0 ? scheduleUpToToday[scheduleUpToToday.length - 1] : null;
      return lastScheduledItem ? lastScheduledItem.course : COURSE_NAMES[0];
    }, [scheduleUpToToday]);


    const calculateStatus = useCallback((totalPoints: number, expectedPoints: number): Status => {
        const progressPercentage = totalPoints / TOTAL_MAX_POINTS;

        if (progressPercentage >= 1) return Status.Finalizada;

        const difference = totalPoints - expectedPoints;

        if (progressPercentage >= 0.85) return Status.EliteII;
        if (progressPercentage >= 0.70) return Status.EliteI;
        if (difference > MAX_POINTS_PER_COURSE / 2) return Status.Avanzada;
        if (difference >= -5 && difference <= MAX_POINTS_PER_COURSE / 2) return Status.AlDia;
        if (difference < -5 && difference > -MAX_POINTS_PER_COURSE) return Status.Atrasada;
        if (difference <= -MAX_POINTS_PER_COURSE) return Status.Riesgo;
        if (totalPoints === 0) return Status.SinIniciar;

        return Status.Atrasada;
    }, []);

    const sortedStudents = useMemo(() => {
        const updatedStudents = students.map(student => {
            const totalPoints = student.courseProgress.reduce((sum, p) => sum + p, 0);
            const status = calculateStatus(totalPoints, expectedPointsToday);
            return { ...student, totalPoints, status, expectedPoints: expectedPointsToday };
        }).sort((a, b) => b.totalPoints - a.totalPoints);
        return updatedStudents;
    }, [students, expectedPointsToday, calculateStatus]);


    useEffect(() => {
        const initialData: Student[] = MOCK_NAMES.map((name, index) => ({
            id: index + 1,
            name,
            courseProgress: Array(TOTAL_COURSES).fill(0),
            totalPoints: 0,
            expectedPoints: 0,
            status: Status.SinIniciar,
            identityVerified: false,
            twoFactorVerified: false,
            certificateStatus: Array(TOTAL_COURSES).fill(false),
            finalCertificateStatus: false,
            dtvStatus: false,
        }));
        
        try {
            const savedData = localStorage.getItem('studentData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                setStudents(parsedData);
                setInitialStudents(parsedData);
            } else {
                setStudents(initialData);
                setInitialStudents(initialData);
            }
            const savedQuestions = localStorage.getItem('communityQuestions');
            if(savedQuestions) {
                const parsedQuestions: CommunityQuestion[] = JSON.parse(savedQuestions).map(q => ({...q, timestamp: new Date(q.timestamp), answers: q.answers.map(a => ({...a, timestamp: new Date(a.timestamp)})) }));
                setQuestions(parsedQuestions);
            } else {
                 setQuestions([]);
            }

        } catch (e) {
            console.error("Failed to load data from localStorage", e);
            setStudents(initialData);
            setInitialStudents(initialData);
        }
    }, []);


    const handleUpdateProgress = (studentId: number, courseIndex: number, newProgress: number) => {
        setStudents(prev =>
            prev.map(s =>
                s.id === studentId
                    ? { ...s, courseProgress: s.courseProgress.map((p, i) => i === courseIndex ? newProgress : p) }
                    : s
            )
        );
    };

    const handleUpdateVerification = (studentId: number, type: 'identity' | 'twoFactor') => {
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                if (type === 'identity') return { ...s, identityVerified: !s.identityVerified };
                if (type === 'twoFactor') return { ...s, twoFactorVerified: !s.twoFactorVerified };
            }
            return s;
        }));
    };
    
    const handleUpdateCertificateStatus = (studentId: number, courseIndex: number) => {
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                const newStatus = [...s.certificateStatus];
                newStatus[courseIndex] = !newStatus[courseIndex];
                return { ...s, certificateStatus: newStatus };
            }
            return s;
        }));
    };

    const handleUpdateOtherStatus = (studentId: number, type: 'final' | 'dtv') => {
        setStudents(prev => prev.map(s => {
            if (s.id === studentId) {
                if(type === 'final') return { ...s, finalCertificateStatus: !s.finalCertificateStatus };
                if(type === 'dtv') return { ...s, dtvStatus: !s.dtvStatus };
            }
            return s;
        }));
    };

    const handleSave = () => {
        setSyncStatus({ status: 'syncing', time: null });
        try {
            localStorage.setItem('studentData', JSON.stringify(students));
            setInitialStudents(students);
            setSyncStatus({ status: 'success', time: new Date() });
        } catch (e) {
            console.error("Failed to save data to localStorage", e);
            setSyncStatus({ status: 'error', time: new Date(), message: "Error al guardar en local." });
        }
    };
    
    const handleAskQuestion = (questionText: string) => {
        const newQuestion: CommunityQuestion = {
            id: Date.now(),
            author: 'Instructor',
            text: questionText,
            timestamp: new Date(),
            answers: []
        };
        const updatedQuestions = [newQuestion, ...questions];
        setQuestions(updatedQuestions);
        localStorage.setItem('communityQuestions', JSON.stringify(updatedQuestions));
    };

    const handleAddAnswer = (questionId: number, answerText: string) => {
        const newAnswer: Answer = {
            id: Date.now(),
            author: 'Instructor',
            text: answerText,
            timestamp: new Date(),
        };
        const updatedQuestions = questions.map(q => {
            if (q.id === questionId) {
                return { ...q, answers: [...q.answers, newAnswer] };
            }
            return q;
        });
        setQuestions(updatedQuestions);
        localStorage.setItem('communityQuestions', JSON.stringify(updatedQuestions));
    };
    

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin') {
            setIsAuthenticated(true);
            setIsReadOnly(false);
            setPassword('');
        } else {
            alert('Contraseña incorrecta');
        }
    };
    
    const renderActiveView = () => {
        switch(activeView) {
            case 'monitor':
                return (
                    <div className="space-y-6">
                        <SaveChangesHeader 
                            syncStatus={syncStatus}
                            onSave={handleSave}
                            hasUnsavedChanges={hasUnsavedChanges}
                            isReadOnly={isReadOnly}
                        />
                        <AIAnalyzer students={sortedStudents} expectedPointsToday={expectedPointsToday} />
                        <LeaderboardTable 
                            students={sortedStudents} 
                            onUpdateProgress={handleUpdateProgress} 
                            isReadOnly={isReadOnly}
                            currentCourseName={currentCourseName}
                        />
                    </div>
                );
            case 'verification':
                return <VerificationView students={sortedStudents} onUpdateVerification={handleUpdateVerification} isReadOnly={isReadOnly}/>;
            case 'certificates':
                return <CertificatesView students={sortedStudents} onUpdateCertificateStatus={handleUpdateCertificateStatus} onUpdateOtherStatus={handleUpdateOtherStatus} isReadOnly={isReadOnly}/>;
            case 'tools':
                return <ToolsView />;
            case 'help':
                 return <HelpView 
                    questions={questions.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime())}
                    onAskQuestion={handleAskQuestion}
                    onAddAnswer={handleAddAnswer}
                    driveFolderUrl="https://drive.google.com/drive/folders/1FEXCIxMCTeg2XEcBvSgMuUQv5XlgQtX_?usp=drive_link" 
                 />;
            case 'config':
                return (
                     <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm max-w-md mx-auto">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Configuración</h2>
                        {!isAuthenticated ? (
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña de Administrador</label>
                                    <input 
                                        type="password"
                                        id="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="mt-1 w-full bg-white border-gray-300 rounded-md p-2 text-gray-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                                    />
                                </div>
                                <button type="submit" className="w-full py-2 px-4 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500">Desbloquear Modo Edición</button>
                            </form>
                        ) : (
                            <div className="text-center space-y-4">
                                <p className="text-green-600 font-semibold">El modo de edición está activado.</p>
                                <button onClick={() => { setIsAuthenticated(false); setIsReadOnly(true); }} className="w-full py-2 px-4 bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600">Bloquear Edición</button>
                            </div>
                        )}
                    </div>
                );
            default:
                return null;
        }
    };


    return (
        <>
        <header className="bg-white/80 backdrop-blur-sm sticky top-0 z-40 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
                <AgapeLogo />
                 <div>
                    <h1 className="text-2xl font-bold text-gray-900">Monitor de Progreso IT</h1>
                    <p className="text-sm text-gray-500">Certificación en Soporte de TI de Google</p>
                </div>
            </div>
        </header>

        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-28">
           {renderActiveView()}
        </main>
        
        <BottomNav activeView={activeView} setActiveView={setActiveView} />
        </>
    );
};

export default App;