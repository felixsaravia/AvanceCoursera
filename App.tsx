import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Student, Status, CommunityQuestion, Answer, ScheduleItem, Break } from './types';
import { MOCK_NAMES, TOTAL_COURSES, MAX_POINTS_PER_COURSE, TOTAL_MAX_POINTS, STATUS_CONFIG, schedule, orderedStatuses, COURSE_NAMES, STUDENT_PHONE_NUMBERS } from './constants';
import LeaderboardTable from './components/LeaderboardTable';
import AIAnalyzer from './components/AIAnalyzer';
import BottomNav from './components/BottomNav';
import VerificationView from './components/VerificationView';
import CertificatesView from './components/CertificatesView';
import HelpView from './components/HelpView';
import ToolsView from './components/ToolsView';
import ProgressSummary from './components/ProgressSummary';
import StatusSummary from './components/StatusSummary';
import ScheduleView from './components/ScheduleView';
import StudentProfileView from './components/StudentProfileView';

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


export type ActiveView = 'monitor' | 'schedule' | 'verification' | 'certificates' | 'help' | 'tools';

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
            disabled={isSyncing || !hasUnsavedChanges}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {isSyncing ? 'Guardando...' : (
                <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-save"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                <span>Guardar Cambios</span>
                </>
            )}
          </button>
        </div>
    );
};

const App: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [initialStudents, setInitialStudents] = useState<Student[]>([]);
    const [activeView, setActiveView] = useState<ActiveView>('monitor');
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: 'idle', time: null });
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [questions, setQuestions] = useState<CommunityQuestion[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [instructorNotes, setInstructorNotes] = useState<{ [studentId: number]: string }>({});
    
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
    
    const { currentCourseName, currentModuleName, currentModuleNumber } = useMemo(() => {
      const lastScheduledItem = scheduleUpToToday.length > 0 ? scheduleUpToToday[scheduleUpToToday.length - 1] : null;
      
      if (!lastScheduledItem) {
        const course = schedule[0]?.course || 'N/A';
        const module = schedule[0]?.module || 'N/A';
        return { currentCourseName: course, currentModuleName: module, currentModuleNumber: 1 };
      }

      const courseName = lastScheduledItem.course;
      const moduleName = lastScheduledItem.module;
      
      const modulesForThisCourse = [...new Set(
          schedule
              .filter(item => item.course === courseName)
              .map(item => item.module)
      )];
      
      const moduleNumber = modulesForThisCourse.indexOf(moduleName) + 1;

      return { 
          currentCourseName: courseName, 
          currentModuleName: moduleName, 
          currentModuleNumber: moduleNumber > 0 ? moduleNumber : 1 
      };
    }, [scheduleUpToToday]);

    const processedSchedule = useMemo(() => {
        const allUniqueDates = [...new Set(schedule.map(item => item.date))].sort((a,b) => parseDateAsUTC(a).getTime() - parseDateAsUTC(b).getTime());
        const totalScheduledDays = allUniqueDates.length;
        if (totalScheduledDays === 0) return [];

        const pointsPerDay = TOTAL_MAX_POINTS / totalScheduledDays;
        const dateToPointsMap = new Map<string, number>();
        allUniqueDates.forEach((date, index) => {
            dateToPointsMap.set(date, (index + 1) * pointsPerDay);
        });
        
        const courseToModulesMap = new Map<string, string[]>();
        COURSE_NAMES.forEach(courseName => {
            const modules = [...new Set(schedule.filter(item => item.course === courseName).map(item => item.module))];
            courseToModulesMap.set(courseName, modules);
        });

        const todayString = today.toISOString().split('T')[0];

        return schedule.map(item => {
            const modulesForCourse = courseToModulesMap.get(item.course) || [];
            const moduleNumber = modulesForCourse.indexOf(item.module) + 1;
            return {
                ...item,
                moduleNumber: moduleNumber > 0 ? moduleNumber : 1,
                expectedPoints: dateToPointsMap.get(item.date) || 0,
                isCurrentDay: item.date === todayString
            }
        });
    }, [today]);


    const calculateStatus = useCallback((totalPoints: number, expectedPoints: number): Status => {
        // Finalizada and Sin Iniciar are absolute states
        if (totalPoints === TOTAL_MAX_POINTS) return Status.Finalizada;
        if (totalPoints === 0) return Status.SinIniciar;
    
        const difference = totalPoints - expectedPoints;
    
        // Status logic based on user's request:
        // > 150 points above expected is Elite II
        if (difference > 150) return Status.EliteII;
        // > 100 points above expected is Elite I
        if (difference > 100) return Status.EliteI;
        // any score above expected is Avanzada ("Adelantada")
        if (difference > 0) return Status.Avanzada;
        // Between expected and 25 points below is "Al Día"
        if (difference >= -25) return Status.AlDia;
        // 75 or more points below expected is "En Riesgo"
        if (difference < -75) return Status.Riesgo;
        // Anything else below expected is "Atrasada"
        return Status.Atrasada;
    }, []);

    const sortedStudents = useMemo(() => {
        const studentsWithData = students.map(student => {
            const totalPoints = student.courseProgress.reduce((sum, p) => sum + p, 0);
            const status = calculateStatus(totalPoints, expectedPointsToday);
            return { ...student, totalPoints, status, expectedPoints: expectedPointsToday };
        });

        const sorted = [...studentsWithData].sort((a, b) => b.totalPoints - a.totalPoints);
        
        const rankedStudents = sorted.map((student, index) => {
            const studentWithRank = { ...student };
            delete studentWithRank.rankBadge;

            if (student.totalPoints > 0) {
                if (index < 3) {
                    studentWithRank.rankBadge = 'Top 3';
                } else if (index < 5) {
                    studentWithRank.rankBadge = 'Top 5';
                } else if (index < 10) {
                    studentWithRank.rankBadge = 'Top 10';
                }
            }
            return studentWithRank;
        });

        return rankedStudents;
    }, [students, expectedPointsToday, calculateStatus]);
    
    const selectedStudent = useMemo(() => {
        return sortedStudents.find(s => s.id === selectedStudentId) || null;
    }, [selectedStudentId, sortedStudents]);

    const chartData = useMemo(() => {
        if (!selectedStudent) return null;

        const allUniqueDates = [...new Set(schedule.map(item => item.date))].sort((a,b) => parseDateAsUTC(a).getTime() - parseDateAsUTC(b).getTime());
        const totalProgramDays = allUniqueDates.length;
        if (totalProgramDays === 0) return null;

        // Expected series is a line from (day 0, 0 points) to (totalDays, max points)
        const expectedSeries = [{day: 0, points: 0}].concat(allUniqueDates.map((_, index) => ({
            day: index + 1,
            points: ((index + 1) / totalProgramDays) * TOTAL_MAX_POINTS
        })));

        // Get current day number
        const todayUTC = today.getTime();
        const datesUpToToday = allUniqueDates.filter(d => parseDateAsUTC(d).getTime() <= todayUTC);
        const currentDayNumber = datesUpToToday.length;
        
        // Student series models a linear progression up to the current day.
        // The student's line is calculated based on their progress rate (total points / days passed).
        // This ensures it correctly reflects their performance relative to the expected linear progress.
        const studentSeries = [{ day: 0, points: 0 }];
        if (currentDayNumber > 0) {
            const studentTotalPoints = selectedStudent.totalPoints;
            const studentRate = studentTotalPoints / currentDayNumber;
            for (let day = 1; day <= currentDayNumber; day++) {
                // The points at any given day is that day times their rate.
                studentSeries.push({ day, points: day * studentRate });
            }
        }
        
        return { expectedSeries, studentSeries, totalDays: totalProgramDays };
    }, [selectedStudent, schedule, today]);


    const loadDataFromGoogleSheets = useCallback(async () => {
        setIsDataLoading(true);
        setSyncStatus({ status: 'syncing', message: 'Cargando datos...', time: null });

        const enrichStudentsWithPhones = (studentsToEnrich: any[]): Student[] => {
            return studentsToEnrich.map(s => ({
                ...s,
                phone: STUDENT_PHONE_NUMBERS[s.name] || undefined
            }));
        };

        try {
            const response = await fetch(GOOGLE_SCRIPT_URL);
            if (!response.ok) {
                throw new Error(`Error de red: ${response.statusText}`);
            }
            const data = await response.json();
            
            const fetchedStudentsRaw: any[] | null = Array.isArray(data) 
                ? data 
                : (data && Array.isArray(data.students)) 
                    ? data.students 
                    : null;

             if (fetchedStudentsRaw !== null) {
                const enrichedStudents = enrichStudentsWithPhones(fetchedStudentsRaw);
                setStudents(enrichedStudents);
                setInitialStudents(enrichedStudents);
                localStorage.setItem('studentData', JSON.stringify(enrichedStudents));
                setSyncStatus({ status: 'success', time: new Date() });
            } else {
                 throw new Error("Formato de datos inválido desde Google Sheets");
            }

        } catch (error) {
            console.error("Error al cargar desde Google Sheets, usando datos locales:", error);
            setSyncStatus({ status: 'error', time: new Date(), message: 'Error de red, usando datos locales.' });
            // Fallback to local storage if network fails
            const savedData = localStorage.getItem('studentData');
            if (savedData) {
                try {
                    const parsedData = JSON.parse(savedData);
                    if (Array.isArray(parsedData)) {
                        const enrichedStudents = enrichStudentsWithPhones(parsedData);
                        setStudents(enrichedStudents);
                        setInitialStudents(enrichedStudents);
                    }
                } catch (e) {
                    console.error("Error parsing data from local storage", e);
                }
            }
        } finally {
            setIsDataLoading(false);
        }
    }, []);
    
    useEffect(() => {
        // Initial load
        loadDataFromGoogleSheets();

        // Load notes from local storage
        try {
            const savedNotes = localStorage.getItem('instructorNotes');
            if (savedNotes) {
                setInstructorNotes(JSON.parse(savedNotes));
            }
        } catch (e) {
            console.error("Failed to load instructor notes from localStorage", e);
        }

        // Load non-student data from local storage
        try {
            const savedQuestions = localStorage.getItem('communityQuestions');
            if(savedQuestions) {
                const parsedQuestions: CommunityQuestion[] = JSON.parse(savedQuestions).map(q => ({...q, timestamp: new Date(q.timestamp), answers: q.answers.map(a => ({...a, timestamp: new Date(a.timestamp)})) }));
                setQuestions(parsedQuestions);
            } else {
                 setQuestions([]);
            }
        } catch (e) {
            console.error("Failed to load community questions from localStorage", e);
        }
    }, [loadDataFromGoogleSheets]);
    

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
    
    const handleUpdateNote = (studentId: number, note: string) => {
        const updatedNotes = { ...instructorNotes, [studentId]: note };
        setInstructorNotes(updatedNotes);
        localStorage.setItem('instructorNotes', JSON.stringify(updatedNotes));
    };

    const handleSave = async () => {
        setSyncStatus({ status: 'syncing', time: null });
        try {
            // Save to local storage immediately for offline resilience
            localStorage.setItem('studentData', JSON.stringify(students));

            const formData = new URLSearchParams();
            // The Google Apps Script expects the students array directly.
            // Sending it nested in an object like { students: students } causes a "students.map is not a function" error on the backend.
            formData.append('payload', JSON.stringify(students));

            // Attempt to save to Google Sheets
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                body: formData,
            });

             if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Error del servidor: ${errorText}`);
            }

            const result = await response.json();
            if (result.status !== 'success') {
                throw new Error(result.message || 'Error desconocido al guardar en Google Sheets');
            }

            setInitialStudents(students);
            setSyncStatus({ status: 'success', time: new Date() });
        } catch (e) {
            console.error("Failed to save data:", e);
            const errorMessage = e instanceof Error ? e.message : "Error de red o del servidor.";
            setSyncStatus({ status: 'error', time: new Date(), message: `Guardado local, pero falló la sincronización: ${errorMessage}` });
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
    
    const handleSelectStudent = (studentId: number) => setSelectedStudentId(studentId);
    const handleClearSelectedStudent = () => setSelectedStudentId(null);
    
    const renderActiveView = () => {
         if (isDataLoading) {
            return (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <svg className="animate-spin h-10 w-10 text-sky-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="text-xl font-semibold text-gray-800">Cargando datos desde Google Sheets...</p>
                    <p className="text-gray-500">Por favor, espera un momento.</p>
                </div>
            );
        }
        
        switch(activeView) {
            case 'monitor':
                return (
                    <div className="space-y-6">
                        <ProgressSummary 
                            expectedPointsToday={expectedPointsToday}
                            currentCourseName={currentCourseName}
                            currentModuleName={currentModuleName}
                            currentModuleNumber={currentModuleNumber}
                        />
                         <StatusSummary students={sortedStudents} />
                        <LeaderboardTable 
                            students={sortedStudents} 
                            onUpdateProgress={handleUpdateProgress} 
                            isReadOnly={false}
                            currentCourseName={currentCourseName}
                            currentModuleName={currentModuleName}
                            currentModuleNumber={currentModuleNumber}
                            onSelectStudent={handleSelectStudent}
                        />
                        <AIAnalyzer students={sortedStudents} expectedPointsToday={expectedPointsToday} />
                    </div>
                );
            case 'schedule':
                return <ScheduleView schedule={processedSchedule} />;
            case 'verification':
                return <VerificationView students={sortedStudents} onUpdateVerification={handleUpdateVerification} isReadOnly={false}/>;
            case 'certificates':
                return <CertificatesView students={sortedStudents} onUpdateCertificateStatus={handleUpdateCertificateStatus} onUpdateOtherStatus={handleUpdateOtherStatus} isReadOnly={false}/>;
            case 'tools':
                return <ToolsView />;
            case 'help':
                 return <HelpView 
                    questions={questions.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime())}
                    onAskQuestion={handleAskQuestion}
                    onAddAnswer={handleAddAnswer}
                    driveFolderUrl="https://drive.google.com/drive/folders/1FEXCIxMCTeg2XEcBvSgMuUQv5XlgQtX_?usp=drive_link" 
                 />;
            default:
                return null;
        }
    };

    const viewsWithSave = ['monitor', 'verification', 'certificates'];
    
    if (selectedStudent && chartData) {
        const isFirstPlace = selectedStudent?.id === sortedStudents[0]?.id && sortedStudents.length > 0 && sortedStudents[0].totalPoints > 0;
        return (
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-28">
                <StudentProfileView
                    student={selectedStudent}
                    chartData={chartData}
                    note={instructorNotes[selectedStudent.id] || ''}
                    onUpdateNote={(note) => handleUpdateNote(selectedStudent.id, note)}
                    onBack={handleClearSelectedStudent}
                    isFirstPlace={isFirstPlace}
                />
            </main>
        )
    }

    return (
        <>
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-28">
            {activeView === 'monitor' && !selectedStudent && (
                <div className="mb-8 text-left">
                    <h1 className="text-4xl font-extrabold text-gray-900">Monitor de Avance <span className="text-sky-600 font-bold">Google IT Support</span></h1>
                    <p className="text-lg text-gray-500 mt-2">Registro de puntajes y estado de la certificación en tiempo real.</p>
                </div>
            )}
            {activeView === 'schedule' && !selectedStudent && (
                <div className="mb-8 text-left">
                    <h1 className="text-4xl font-extrabold text-gray-900">Cronograma de Avance</h1>
                    <p className="text-lg text-gray-500 mt-2">Consulta las fechas, módulos y el puntaje esperado para cada día del programa.</p>
                </div>
            )}
           {viewsWithSave.includes(activeView) && !selectedStudent && (
                <SaveChangesHeader 
                    syncStatus={syncStatus}
                    onSave={handleSave}
                    hasUnsavedChanges={hasUnsavedChanges}
                />
            )}
           {renderActiveView()}
        </main>
        
        <BottomNav activeView={activeView} setActiveView={setActiveView} />
        </>
    );
};

export default App;