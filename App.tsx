import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Student, Status, CommunityQuestion, Answer, ScheduleItem, Break, LastModification, ProcessedScheduleItem } from './types';
import { MOCK_NAMES, TOTAL_COURSES, MAX_POINTS_PER_COURSE, TOTAL_MAX_POINTS, STATUS_CONFIG, schedule, orderedStatuses, COURSE_NAMES, STUDENT_PHONE_NUMBERS, STUDENT_INSTITUTIONS, STUDENT_DEPARTMENTS } from './constants';
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
import StatisticsView from './components/StatisticsView';
import FilterControls from './components/FilterControls';
import ReportModal from './components/ReportModal';
import CourseDeadlineAlert from './components/CourseDeadlineAlert';
import ProgressUpdateAlert from './components/ProgressUpdateAlert';
import AlertsMuteControl from './components/AlertsMuteControl';

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
    lastAction?: 'load' | 'save';
};

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxiTI7pcAYDf9q21OoforACNDhzKS_ph0hb-C02VuFxd8n6vqJDbnsrluazMkv9r5705A/exec';

const formatSyncTime = (date: Date | null) => {
    if (!date) return 'nunca';
    return date.toLocaleTimeString('es-ES');
};

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setUTCDate(result.getUTCDate() + days);
    return result;
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
        statusText = syncStatus.message || 'Guardando...';
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
        if (syncStatus.lastAction === 'save' && syncStatus.status === 'success') {
            statusText = 'Todos los cambios guardados';
            statusColor = 'text-green-600';
            icon = <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
        } else {
            statusText = 'Datos actualizados';
            statusColor = 'text-gray-600';
            icon = <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
        }
    }

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className={statusColor}>{icon}</span>
            <div>
              <p className="font-semibold text-gray-900">Guardar en Google Sheets</p>
              <p className={`text-sm ${statusColor}`}>
                  {statusText}
                  {(syncStatus.status === 'success' && !hasUnsavedChanges) && ` - Última vez: ${formatSyncTime(syncStatus.time)}`}
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
    const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: 'idle', time: null, lastAction: 'load' });
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [questions, setQuestions] = useState<CommunityQuestion[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const [filters, setFilters] = useState<{
        institutions: string[];
        departments: string[];
        statuses: Status[];
    }>({
        institutions: [],
        departments: [],
        statuses: [],
    });
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
    const [reportModalStudentId, setReportModalStudentId] = useState<number | null>(null);
    const [areAlertsMuted, setAreAlertsMuted] = useState(false);
    const [updatedStudentInfo, setUpdatedStudentInfo] = useState<{ name: string; pointsIncrease: number } | null>(null);
    
    useEffect(() => {
        const savedMuteState = localStorage.getItem('alertsMuted');
        if (savedMuteState === 'true') {
            setAreAlertsMuted(true);
        }
    }, []);
    
    const toggleAlertsMuted = () => {
        setAreAlertsMuted(prev => {
            const newState = !prev;
            localStorage.setItem('alertsMuted', String(newState));
            return newState;
        });
    };

    const reportModalStudent = useMemo(() => {
        return students.find(s => s.id === reportModalStudentId) || null;
    }, [reportModalStudentId, students]);

    const handleOpenReportModal = (studentId: number) => setReportModalStudentId(studentId);
    const handleCloseReportModal = () => setReportModalStudentId(null);
    
    // Scroll to top when a student profile is opened
    useEffect(() => {
        if (selectedStudentId !== null) {
            window.scrollTo(0, 0);
        }
    }, [selectedStudentId]);
    
    const handleSort = (key: string) => {
        setSortConfig(prevConfig => {
            if (prevConfig.key === key) {
                return { key, direction: prevConfig.direction === 'asc' ? 'desc' : 'asc' };
            }
            // default to descending for numeric-like columns, ascending for text
            const isText = key === 'name' || key === 'status';
            return { key, direction: isText ? 'asc' : 'desc' };
        });
    };

    const hasUnsavedChanges = useMemo(() => {
        return JSON.stringify(students) !== JSON.stringify(initialStudents);
    }, [students, initialStudents]);
    
    const today = useMemo(() => getTodayInElSalvador(), []);

    const programMilestones = useMemo(() => {
        if (schedule.length === 0) return [];

        const milestones: { date: Date; points: number }[] = [];
        
        // Starting point
        const firstDay = parseDateAsUTC(schedule[0].date);
        const programStartDate = new Date(firstDay);
        programStartDate.setUTCDate(programStartDate.getUTCDate() - 1);
        milestones.push({ date: programStartDate, points: 0 });

        // Course end points
        COURSE_NAMES.forEach((courseName, index) => {
            const courseDates = schedule
                .filter(item => item.course === courseName)
                .map(item => parseDateAsUTC(item.date))
                .filter(d => !isNaN(d.getTime()));
            
            if (courseDates.length > 0) {
                const endDate = new Date(Math.max.apply(null, courseDates.map(d => d.getTime())));
                milestones.push({
                    date: endDate,
                    points: (index + 1) * MAX_POINTS_PER_COURSE
                });
            }
        });

        return milestones;
    }, []);

    const getExpectedPointsForDate = useCallback((targetDate: Date): number => {
        if (programMilestones.length < 2) return 0;

        const targetTime = targetDate.getTime();

        const firstMilestone = programMilestones[0];
        if (targetTime < firstMilestone.date.getTime()) {
            return 0;
        }
        
        const lastMilestone = programMilestones[programMilestones.length - 1];
        if (targetTime >= lastMilestone.date.getTime()) {
            return lastMilestone.points;
        }

        let prevMilestone = firstMilestone;
        let nextMilestone = programMilestones[1];

        for (let i = 1; i < programMilestones.length; i++) {
            if (targetTime < programMilestones[i].date.getTime()) {
                prevMilestone = programMilestones[i - 1];
                nextMilestone = programMilestones[i];
                break;
            } else if (targetTime === programMilestones[i].date.getTime()) {
                 prevMilestone = programMilestones[i];
                 nextMilestone = programMilestones[i];
                 break;
            }
        }

        const prevTime = prevMilestone.date.getTime();
        const nextTime = nextMilestone.date.getTime();

        if (nextTime === prevTime) {
            return nextMilestone.points;
        }
        
        const segmentDuration = nextTime - prevTime;
        const timeIntoSegment = targetTime - prevTime;
        const segmentPoints = nextMilestone.points - prevMilestone.points;
        const progressInSegment = timeIntoSegment / segmentDuration;
        const pointsInSegment = progressInSegment * segmentPoints;
        
        return prevMilestone.points + pointsInSegment;
    }, [programMilestones]);

    const expectedPointsToday = useMemo(() => {
        return getExpectedPointsForDate(today);
    }, [today, getExpectedPointsForDate]);

    const scheduleUpToToday = useMemo(() => {
        const todayUTC = today.getTime();
        return schedule.filter(item => {
            const itemDate = parseDateAsUTC(item.date);
            return !isNaN(itemDate.getTime()) && itemDate.getTime() <= todayUTC;
        });
    }, [today]);

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
    
    const currentCourseEndDate = useMemo(() => {
        if (!currentCourseName) return null;
        const courseDates = schedule
            .filter(item => item.course === currentCourseName)
            .map(item => parseDateAsUTC(item.date).getTime());
        
        if (courseDates.length === 0) return null;

        const endDate = new Date(Math.max(...courseDates));
        return endDate.toISOString().split('T')[0];
    }, [currentCourseName, schedule]);

    const processedSchedule: ProcessedScheduleItem[] = useMemo(() => {
        const courseToModulesMap = new Map<string, string[]>();
        COURSE_NAMES.forEach(courseName => {
            const modules = [...new Set(schedule.filter(item => item.course === courseName).map(item => item.module))];
            courseToModulesMap.set(courseName, modules);
        });

        const todayString = today.toISOString().split('T')[0];

        return schedule.map(item => {
            const modulesForCourse = courseToModulesMap.get(item.course) || [];
            const moduleNumber = modulesForCourse.indexOf(item.module) + 1;
            const itemDate = parseDateAsUTC(item.date);
            
            return {
                ...item,
                moduleNumber: moduleNumber > 0 ? moduleNumber : 1,
                expectedPoints: getExpectedPointsForDate(itemDate),
                isCurrentDay: item.date === todayString
            }
        });
    }, [today, getExpectedPointsForDate]);


    const calculateStatus = useCallback((totalPoints: number, expectedPoints: number): Status => {
        if (totalPoints === TOTAL_MAX_POINTS) return Status.Finalizada;
        if (totalPoints === 0) return Status.SinIniciar;
    
        const difference = totalPoints - expectedPoints;
    
        if (difference > 150) return Status.EliteII;
        if (difference > 100) return Status.EliteI;
        if (difference > 0) return Status.Avanzada;
        if (difference >= -25) return Status.AlDia;
        if (difference < -75) return Status.Riesgo;
        return Status.Atrasada;
    }, []);

    const processStudentData = useCallback((studentsToProcess: any[]): Student[] => {
      return studentsToProcess.map((s, index) => {
          const courseProgress = s.courseProgress || Array(TOTAL_COURSES).fill(0);
          const totalPoints = courseProgress.reduce((sum, p) => sum + p, 0);
          const expectedPoints = expectedPointsToday;
          const status = calculateStatus(totalPoints, expectedPoints);

          let lastModification: LastModification | undefined = undefined;

          const timestamp = s["Ultima Modificacion"];
          const prevPoints = s["Puntos Actuales"]; // Use "Puntos Actuales" to read
          const newPoints = s["Puntos Nuevos"];

          if (timestamp && typeof timestamp === 'string') {
              lastModification = {
                  timestamp: timestamp,
                  previousTotalPoints: Number(prevPoints ?? 0),
                  newTotalPoints: Number(newPoints ?? 0),
              };
          } 
          else if (s.lastModification) {
              lastModification = s.lastModification;
          }

          const student: Student = {
              id: s.id ?? index + 1,
              name: s.name,
              phone: STUDENT_PHONE_NUMBERS[s.name] || undefined,
              institucion: s['Institución'] || STUDENT_INSTITUTIONS[s.name] || undefined,
              departamento: s['Departamento'] || STUDENT_DEPARTMENTS[s.name] || undefined,
              courseProgress,
              totalPoints,
              expectedPoints,
              status,
              identityVerified: s.identityVerified ?? false,
              twoFactorVerified: s.twoFactorVerified ?? false,
              certificateStatus: s.certificateStatus || Array(TOTAL_COURSES).fill(false),
              finalCertificateStatus: s.finalCertificateStatus ?? false,
              dtvStatus: s.dtvStatus ?? false,
              lastModification,
          };
          return student;
      });
    }, [expectedPointsToday, calculateStatus]);

    const loadDataFromGoogleSheets = useCallback(async () => {
        setIsDataLoading(true);
        setSyncStatus({ status: 'syncing', message: 'Cargando datos...', time: null });

        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, { cache: 'no-store' });
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
                const processedData = processStudentData(fetchedStudentsRaw);
                setStudents(processedData);
                setInitialStudents(processedData);
                setSyncStatus({ status: 'success', time: new Date(), lastAction: 'load' });
            } else {
                 throw new Error("Formato de datos inválido desde Google Sheets");
            }

        } catch (error) {
            console.error("Error al cargar desde Google Sheets:", error);
            const errorMessage = error instanceof Error ? error.message : "Error de red o del servidor.";
            setSyncStatus({ status: 'error', time: new Date(), message: `No se pudieron cargar los datos. ${errorMessage}` });
            setStudents([]);
            setInitialStudents([]);
        } finally {
            setIsDataLoading(false);
        }
    }, [processStudentData]);

    const handleSave = async () => {
      setSyncStatus({ status: 'syncing', time: null, message: 'Verificando cambios remotos...' });
  
      try {
          // 1. Fetch the latest data from the server
          const response = await fetch(GOOGLE_SCRIPT_URL, { cache: 'no-store' });
          if (!response.ok) {
              throw new Error(`No se pudo obtener la última versión de los datos. Error de red: ${response.statusText}`);
          }
          const data = await response.json();
          const latestStudentsRaw: any[] | null = Array.isArray(data) ? data : (data && Array.isArray(data.students)) ? data.students : null;
  
          if (latestStudentsRaw === null) {
              throw new Error("Formato de datos remoto inválido.");
          }
          const latestStudents = processStudentData(latestStudentsRaw);
  
          // 2. Identify local changes by comparing current state with initial state
          const locallyChangedIds = new Set<number>();
          students.forEach(s => {
              const original = initialStudents.find(o => o.id === s.id);
              if (original && JSON.stringify(s) !== JSON.stringify(original)) {
                  locallyChangedIds.add(s.id);
              }
          });
  
          if (locallyChangedIds.size === 0) {
              setStudents(latestStudents);
              setInitialStudents(latestStudents);
              setSyncStatus({ status: 'success', time: new Date(), message: 'No había cambios locales para guardar. Datos actualizados.' });
              return;
          }
  
          // 3. Detect conflicts and prepare merged data
          const conflicts: string[] = [];
          const mergedStudents = latestStudents.map(latestStudent => {
              const originalStudent = initialStudents.find(o => o.id === latestStudent.id);
              const isLocallyChanged = locallyChangedIds.has(latestStudent.id);
              const isRemotelyChanged = originalStudent && JSON.stringify(latestStudent) !== JSON.stringify(originalStudent);
  
              if (isLocallyChanged && isRemotelyChanged) {
                  conflicts.push(latestStudent.name);
              }
  
              // Local changes take precedence over remote ones for the merged data
              return isLocallyChanged ? students.find(s => s.id === latestStudent.id)! : latestStudent;
          });
  
          // 4. Handle conflicts
          if (conflicts.length > 0) {
              const conflictNames = conflicts.map(c => c).join(', ');
              const proceed = window.confirm(
                  `¡Atención! Mientras editabas, otra persona también guardó cambios para: ${conflictNames}.\n\n` +
                  `Si continúas, tus cambios para estas estudiantes SOBRESCRIBIRÁN los cambios de la otra persona.\n\n` +
                  `¿Deseas continuar y guardar tus cambios de todas formas?\n\n` +
                  `RECOMENDADO: Haz clic en 'Cancelar', y la tabla se recargará con los datos más recientes. Luego podrás aplicar tus cambios de nuevo de forma segura.`
              );
              if (!proceed) {
                  setSyncStatus({ status: 'error', time: new Date(), message: 'Guardado cancelado por conflicto.' });
                  await loadDataFromGoogleSheets(); // Reload to show latest data
                  return;
              }
          }
  
          // 5. Proceed with saving the merged data
          setSyncStatus({ status: 'syncing', time: null, message: 'Guardando datos fusionados...' });
  
          const studentsToSave = mergedStudents.map(student => {
              const totalPoints = student.courseProgress.reduce((sum, p) => sum + p, 0);
              const status = calculateStatus(totalPoints, student.expectedPoints);
              return {
                  id: student.id,
                  name: student.name,
                  phone: student.phone,
                  "Institución": student.institucion,
                  "Departamento": student.departamento,
                  courseProgress: student.courseProgress,
                  identityVerified: student.identityVerified,
                  twoFactorVerified: student.twoFactorVerified,
                  certificateStatus: student.certificateStatus,
                  finalCertificateStatus: student.finalCertificateStatus,
                  dtvStatus: student.dtvStatus,
                  totalPoints,
                  expectedPoints: student.expectedPoints,
                  status,
                  "Ultima Modificacion": student.lastModification?.timestamp || null,
                  "Puntos Actuales": student.lastModification?.previousTotalPoints ?? null,
                  "Puntos Nuevos": student.lastModification?.newTotalPoints ?? null,
              };
          });
  
          const formData = new URLSearchParams();
          formData.append('payload', JSON.stringify(studentsToSave));
  
          const saveResponse = await fetch(GOOGLE_SCRIPT_URL, {
              method: 'POST',
              body: formData,
          });
  
          if (!saveResponse.ok) {
              const errorText = await saveResponse.text();
              throw new Error(`Error del servidor al guardar: ${saveResponse.status} ${errorText}`);
          }
  
          setSyncStatus({ status: 'success', time: new Date(), lastAction: 'save', message: '¡Guardado con éxito! Actualizando...' });
          await loadDataFromGoogleSheets(); // Always reload after a successful save
  
      } catch (e) {
          console.error("Falló el proceso de guardado seguro:", e);
          const errorMessage = e instanceof Error ? e.message : "Error de red o del servidor.";
          setSyncStatus({ status: 'error', time: new Date(), message: `Falló la sincronización. ${errorMessage}` });
      }
  };

    const rankedStudents = useMemo(() => {
        const sortedByPoints = [...students].sort((a, b) => b.totalPoints - a.totalPoints);
        const studentRanks = new Map<number, 'Top 3' | 'Top 5' | 'Top 10'>();
        
        sortedByPoints.forEach((student, index) => {
            if (student.totalPoints > 0) {
                if (index < 3) studentRanks.set(student.id, 'Top 3');
                else if (index < 5) studentRanks.set(student.id, 'Top 5');
                else if (index < 10) studentRanks.set(student.id, 'Top 10');
            }
        });

        return students.map(s => ({
            ...s,
            rankBadge: studentRanks.get(s.id),
        }));
    }, [students]);

    const filteredStudents = useMemo(() => {
        return rankedStudents.filter(student => {
            const institutionMatch = filters.institutions.length === 0 || (student.institucion && filters.institutions.includes(student.institucion));
            const departmentMatch = filters.departments.length === 0 || (student.departamento && filters.departments.includes(student.departamento));
            const statusMatch = filters.statuses.length === 0 || filters.statuses.includes(student.status);
            return institutionMatch && departmentMatch && statusMatch;
        });
    }, [rankedStudents, filters]);

    const finalSortedStudents = useMemo(() => {
        const sortable = [...filteredStudents];
        if (sortConfig.key) {
            sortable.sort((a, b) => {
                let aVal: any, bVal: any;

                if (sortConfig.key.startsWith('courseProgress.')) {
                    const index = parseInt(sortConfig.key.split('.')[1], 10);
                    aVal = a.courseProgress[index];
                    bVal = b.courseProgress[index];
                } else if (sortConfig.key === 'status') {
                    aVal = orderedStatuses.indexOf(a.status);
                    bVal = orderedStatuses.indexOf(b.status);
                } else {
                    aVal = a[sortConfig.key as keyof Student];
                    bVal = b[sortConfig.key as keyof Student];
                }

                if (aVal === null || aVal === undefined) return 1;
                if (bVal === null || bVal === undefined) return -1;
                
                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return aVal.localeCompare(bVal);
                }

                if (aVal < bVal) return -1;
                if (aVal > bVal) return 1;
                return 0;
            });

            if (sortConfig.direction === 'desc') {
                sortable.reverse();
            }
        }
        return sortable;
    }, [filteredStudents, sortConfig]);
    
    const studentsSortedByPoints = useMemo(() => {
        return [...students].sort((a,b) => b.totalPoints - a.totalPoints);
    }, [students]);

    const uniqueInstitutions = useMemo(() => {
        const allInstitutions = initialStudents.map(s => s.institucion).filter(Boolean) as string[];
        return [...new Set(allInstitutions)].sort((a, b) => a.localeCompare(b));
    }, [initialStudents]);

    const uniqueDepartments = useMemo(() => {
        const allDepartments = initialStudents.map(s => s.departamento).filter(Boolean) as string[];
        return [...new Set(allDepartments)].sort((a, b) => a.localeCompare(b));
    }, [initialStudents]);

    const selectedStudent = useMemo(() => {
        return rankedStudents.find(s => s.id === selectedStudentId) || null;
    }, [selectedStudentId, rankedStudents]);

    const chartData = useMemo(() => {
        if (!selectedStudent) return null;

        const allUniqueDates = [...new Set(schedule.map(item => item.date))].sort((a,b) => parseDateAsUTC(a).getTime() - parseDateAsUTC(b).getTime());
        const totalProgramDays = allUniqueDates.length;
        if (totalProgramDays === 0) return null;

        const expectedSeries = [{day: 0, points: 0}].concat(allUniqueDates.map((dateStr, index) => {
            const date = parseDateAsUTC(dateStr);
            return {
                day: index + 1,
                points: getExpectedPointsForDate(date)
            };
        }));

        const todayUTC = today.getTime();
        const datesUpToToday = allUniqueDates.filter(d => parseDateAsUTC(d).getTime() <= todayUTC);
        const currentDayNumber = datesUpToToday.length;
        
        const studentSeries = [{ day: 0, points: 0 }];
        if (currentDayNumber > 0) {
            const studentTotalPoints = selectedStudent.totalPoints;
            const studentRate = studentTotalPoints / currentDayNumber;
            for (let day = 1; day <= currentDayNumber; day++) {
                studentSeries.push({ day, points: day * studentRate });
            }
        }
        
        return { expectedSeries, studentSeries, totalDays: totalProgramDays };
    }, [selectedStudent, schedule, today, getExpectedPointsForDate]);

    const weeklyScheduleText = useMemo(() => {
        const todayCopy = new Date(today.getTime());
        const dayOfWeek = todayCopy.getUTCDay(); // Sunday = 0
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday
        const monday = addDays(todayCopy, diff);

        let text = "";
        for (let i = 0; i < 6; i++) {
            const day = addDays(monday, i);
            const dayString = day.toISOString().split('T')[0];
            const activities = processedSchedule.filter(item => item.date === dayString);
            const uniqueModules = [...new Set(activities.map(a => a.module))];

            const dayName = new Intl.DateTimeFormat('es-ES', { weekday: 'long', timeZone: 'UTC' }).format(day);
            text += `*${dayName.charAt(0).toUpperCase() + dayName.slice(1)}*:\n`;

            if (uniqueModules.length > 0) {
                uniqueModules.forEach(mod => {
                    text += `- ${mod}\n`;
                });
            } else {
                text += `- Sin actividad programada\n`;
            }
            text += '\n';
        }
        return text;
    }, [processedSchedule, today]);

    const nextCourseDeadline = useMemo(() => {
        const todayTime = today.getTime();
        const courseEndDates = COURSE_NAMES.map((courseName) => {
            const courseDates = schedule
                .filter(item => item.course === courseName)
                .map(item => parseDateAsUTC(item.date).getTime());
            
            if (courseDates.length === 0) return null;
            
            const endDate = new Date(Math.max(...courseDates));
            return { courseName, endDate };
        }).filter((item): item is { courseName: string, endDate: Date } => item !== null && item.endDate.getTime() >= todayTime);
    
        if (courseEndDates.length === 0) return null;
        
        courseEndDates.sort((a, b) => a.endDate.getTime() - b.endDate.getTime());
        
        const nextDeadline = courseEndDates[0];
        return {
            courseName: nextDeadline.courseName,
            date: nextDeadline.endDate.toISOString().split('T')[0]
        };
    }, [schedule, today]);

    const generateWhatsAppLink = useCallback((student: Student, type: string, data?: any): string => {
        if (!student.phone) return '#';
        const name = student.name.split(' ')[0];
        let message = '';
    
        switch (type) {
            case 'report':
                const totalPoints = student.totalPoints;
                const expectedPoints = Math.round(student.expectedPoints);
                const status = student.status;
    
                let header = `Estimada ${name}, 👋 le comparto su reporte de avance en la certificación de TI.\n\n`;
                let body = `*Puntaje Actual:* ${totalPoints} puntos\n*Puntaje Esperado:* ${expectedPoints} puntos\n*Estado:* ${status}\n\n`;
                let footer = '';
    
                switch (status) {
                    case Status.Finalizada:
                        footer = "¡EXTRAORDINARIO! 🥳 Ha completado la certificación. Su dedicación y esfuerzo han dado frutos. ¡Muchas felicidades por este gran logro! 🏆";
                        break;
                    case Status.EliteII:
                    case Status.EliteI:
                        footer = "¡IMPRESIONANTE! 🚀 Lleva un ritmo excepcional, superando todas las expectativas. Es un verdadero ejemplo para el grupo. ¡Siga así, va directo al éxito! 🔥";
                        break;
                    case Status.Avanzada:
                        footer = "¡EXCELENTE! ✨ Va por delante del calendario, ¡qué gran trabajo! Su proactividad la está llevando muy lejos. ¡Mantenga ese impulso! 💪";
                        break;
                    case Status.AlDia:
                        footer = "¡MUY BIEN! 👍 Va al día con el programa. Está demostrando constancia y disciplina. ¡Siga con ese buen ritmo para alcanzar su meta! 🎯";
                        break;
                    case Status.Atrasada:
                        const pointsToCatchUp = Math.max(1, Math.round(student.expectedPoints - student.totalPoints));
                        footer = `¡Ánimo! 💪 Para ponerse "Al Día" necesita sumar ${pointsToCatchUp} puntos. Actualmente, el avance esperado corresponde al *Módulo ${currentModuleNumber}: ${currentModuleName}* del curso *"${currentCourseName}"*. ¡Enfóquese en esa lección para avanzar! ¡No se rinda, cada paso cuenta! ✨`;
                        break;
                    case Status.Riesgo:
                        const pointsToCatchUpRisk = Math.max(1, Math.round(student.expectedPoints - student.totalPoints));
                        footer = `¡No se preocupe, estamos para apoyarle! 🙏 Para ponerse "Al Día" necesita sumar ${pointsToCatchUpRisk} puntos. El enfoque actual, según el cronograma, es el *Módulo ${currentModuleNumber}: ${currentModuleName}* del curso *"${currentCourseName}"*. Si necesita ayuda, no dude en contactarme. ¡Confío en que lo logrará! 🤝`;
                        break;
                    case Status.SinIniciar:
                        footer = "¡Es hora de empezar esta increíble aventura! 🚀 El primer paso es el más importante. Entre a la plataforma y complete su primera lección. ¡Estamos emocionados de ver su progreso! 😊";
                        break;
                    default:
                        footer = "¡Siga adelante con sus estudios! Cada lección es un paso más hacia su meta. 💪";
                        break;
                }
                message = `${header}${body}${footer}`;
                break;
            case 'blank':
                message = '';
                break;
            case 'felicitar':
                const { courseName: congratulateCourseName } = data;
                message = `¡Felicidades, ${name}! 🥳 Ha completado con éxito el curso "${congratulateCourseName}". Su dedicación es inspiradora. ¡Siga así! 🎉`;
                break;
            case 'felicitar_iniciar':
                const { courseName: completedCourseName, courseIndex } = data;
                const nextCourseIndex = courseIndex + 1;
                if (nextCourseIndex < COURSE_NAMES.length) {
                    const nextCourseName = COURSE_NAMES[nextCourseIndex];
                    message = `¡Extraordinario trabajo, ${name}! 🥳 Ha completado el curso "${completedCourseName}". ¡Felicidades! 🚀\n\nAhora es el momento perfecto para dar el siguiente paso. Le animo a iniciar con el curso: *"${nextCourseName}"*.\n\n¡Vamos a por la siguiente meta! 💪`;
                } else {
                    message = `¡Increíble, ${name}! 🥳 Ha completado el curso "${completedCourseName}". ¡Y con este, ha finalizado toda la ruta de aprendizaje! ¡Muchísimas felicidades por este gran logro! 🏆`;
                }
                break;
            case 'felicitar_avance':
                message = `¡Hola ${name}! Solo pasaba para felicitarte por tu excelente avance en la certificación. ¡Sigue así, estás haciendo un trabajo fantástico! 💪`;
                break;
            case 'iniciar_curso':
                const { courseName: startCourseName } = data;
                message = `Hola ${name}, ¡espero que estés muy bien! Te escribo para animarte a que inicies con el curso: *"${startCourseName}"*. ¡Dar el primer paso es lo más importante! 😊`;
                break;
            case 'recordar_tutoria':
                message = `Hola ${name}, ¿cómo estás? Quería saber si tienes un momento para conectarte a una tutoría y que podamos revisar tus avances o cualquier duda que tengas. ¡Me avisas! 😊\n\nEl enlace de la sesión es: https://meet.google.com/jpj-nibe-hro`;
                break;
            case 'certificate':
                const { courseName } = data;
                message = `¡Felicidades, ${name}! 🥳 Ha completado el curso "${courseName}".\n\nPor favor, no olvide subir su certificado a la carpeta de Drive para que podamos registrarlo. ¡Está un paso más cerca de la meta! 🚀\n\nEnlace a Drive: https://drive.google.com/drive/folders/18xkVPEYMjsZDAIutOVclhyMNdfwYhQb5?usp=drive_link`;
                break;
            case 'recordar_certificado':
                const { courseNames } = data;
                const coursesList = courseNames.map(name => `- "${name}"`).join('\n');
                message = `Hola, ${name}. 👋 Un recordatorio amistoso para que por favor suba los certificados de los siguientes cursos que ya ha completado:\n\n${coursesList}\n\nPuede subirlos en la siguiente carpeta de Drive. ¡Gracias!\n\nEnlace: https://drive.google.com/drive/folders/18xkVPEYMjsZDAIutOVclhyMNdfwYhQb5?usp=drive_link`;
                break;
            case 'verification':
                const { pending } = data;
                const pendingText = pending.join(' y ');
                message = `Hola, ${name}. 👋 Le recordamos amablemente completar los siguientes pasos de verificación en su cuenta para asegurar su progreso:\n\n*${pendingText}*\n\nCompletar esto es muy importante. ¡Gracias! 😊`;
                break;
            case 'schedule':
                const { scheduleText } = data;
                message = `Hola, ${name}. 📅 Aquí tiene el cronograma sugerido para esta semana para que se mantenga al día:\n\n${scheduleText}\n\n¡Organícese y a seguir aprendiendo! 💪`;
                break;
            case 'deadline':
                const { deadline } = data;
                const formattedDate = new Intl.DateTimeFormat('es-ES', { dateStyle: 'full', timeZone: 'UTC' }).format(parseDateAsUTC(deadline.date));
                message = `¡Hola, ${name}! ⏰ Un recordatorio amistoso:\n\nLa fecha de finalización para el curso "${deadline.courseName}" es el próximo *${formattedDate}*.\n\n¡Vamos con todo en esta recta final! ✨`;
                break;
        }
        return `https://wa.me/${student.phone}?text=${encodeURIComponent(message)}`;
    }, [currentCourseName, currentModuleName, currentModuleNumber]);

    
    useEffect(() => {
        loadDataFromGoogleSheets();

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
        const studentToUpdate = students.find(s => s.id === studentId);
        if (studentToUpdate) {
            const previousTotalPoints = studentToUpdate.totalPoints;
            const tempCourseProgress = [...studentToUpdate.courseProgress];
            tempCourseProgress[courseIndex] = newProgress;
            const newTotalPoints = tempCourseProgress.reduce((sum, p) => sum + p, 0);
            const pointsIncrease = newTotalPoints - previousTotalPoints;

            if (pointsIncrease !== 0) {
                setUpdatedStudentInfo({ name: studentToUpdate.name, pointsIncrease });
            }
        }

        setStudents(prev =>
            prev.map(s => {
                if (s.id === studentId) {
                    const previousTotalPoints = s.totalPoints;

                    const newCourseProgress = [...s.courseProgress];
                    newCourseProgress[courseIndex] = newProgress;
                    
                    const newTotalPoints = newCourseProgress.reduce((sum, p) => sum + p, 0);
                    const newStatus = calculateStatus(newTotalPoints, s.expectedPoints);

                    const lastModification: LastModification = {
                        timestamp: new Date().toISOString(),
                        previousTotalPoints,
                        newTotalPoints,
                    };

                    return { 
                        ...s, 
                        courseProgress: newCourseProgress,
                        totalPoints: newTotalPoints,
                        status: newStatus,
                        lastModification: lastModification
                    };
                }
                return s;
            })
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
    
    const handleFilterChange = useCallback((filterType: keyof typeof filters, selectedOptions: string[]) => {
      setFilters(prev => ({
        ...prev,
        [filterType]: selectedOptions,
      }));
    }, []);

    const resetFilters = useCallback(() => {
        setFilters({
            institutions: [],
            departments: [],
            statuses: []
        });
    }, []);

    const handleSelectStudent = (studentId: number) => setSelectedStudentId(studentId);
    const handleClearSelectedStudent = () => setSelectedStudentId(null);
    
    const programEndDateInfo = useMemo(() => {
        if (!nextCourseDeadline) return null;

        const deadlineDate = parseDateAsUTC(nextCourseDeadline.date);
        const diffTime = deadlineDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return null; // Safety check

        return {
            daysRemaining: diffDays,
            courseName: nextCourseDeadline.courseName,
        };
    }, [nextCourseDeadline, today]);

    const motivationalPhrases = [
        "Cada día es una nueva oportunidad para estar más cerca de tu meta. ¡Sigue adelante!",
        "La perseverancia no es una carrera larga, son muchas carreras cortas una tras otra. ¡Vamos por la de hoy!",
        "El éxito es la suma de pequeños esfuerzos repetidos día tras día. ¡Tu esfuerzo cuenta!",
        "No mires lo que te falta, celebra lo que ya has logrado. ¡Estás más cerca de lo que crees!",
        "La confianza en ti mismo es el primer secreto del éxito. ¡Cree en tu talento!"
    ];
    
    const [motivationalPhrase] = useState(() => motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)]);

    const generateAudioScript = useCallback((student: Student): string => {
        const firstName = student.name.split(' ')[0];
        let script = `Hola, ${firstName}. Este es tu reporte de avance en audio. Tu estado actual es ${student.status}. Tienes ${student.totalPoints} puntos. `;

        if (student.status === Status.Atrasada || student.status === Status.Riesgo) {
            const pointsNeeded = Math.round(student.expectedPoints - student.totalPoints);
            if (pointsNeeded > 0) {
                script += `Para ponerte al día, necesitas sumar aproximadamente ${pointsNeeded} ${pointsNeeded === 1 ? 'punto' : 'puntos'}. ¡Ánimo, cada paso cuenta! `;
            }
        }
        
        const courseNumber = currentCourseName.split('.')[0];
        script += `Actualmente, el programa se enfoca en el Curso ${courseNumber}, Módulo ${currentModuleNumber}: "${currentModuleName}". `;

        if (currentCourseEndDate) {
            const endDate = parseDateAsUTC(currentCourseEndDate);
            const formattedDate = new Intl.DateTimeFormat('es-ES', { dateStyle: 'full', timeZone: 'UTC' }).format(endDate);
            script += `La fecha de finalización sugerida para este curso es el ${formattedDate}. `;
        }

        switch(student.status) {
            case Status.Riesgo:
                script += "Recuerda, los mayores desafíos traen las mayores recompensas. ¡Estamos aquí para apoyarte en cada paso!";
                break;
            case Status.Atrasada:
                script += "No te desanimes. La perseverancia es clave en tecnología. ¡Organiza tu tiempo, enfócate en el siguiente módulo y verás cómo avanzas!";
                break;
            case Status.AlDia:
                script += "¡Vas muy bien! Mantener el ritmo es un gran logro. Sigue con esa disciplina y constancia.";
                break;
            case Status.Avanzada:
            case Status.EliteI:
            case Status.EliteII:
                script += "¡Tu rendimiento es excepcional! Estás demostrando una gran capacidad y liderazgo. Sigue así y llegarás muy lejos.";
                break;
            case Status.Finalizada:
                script += "¡Felicidades por haber completado la certificación! Este es un gran logro y el inicio de una emocionante carrera.";
                break;
            default:
                script += "¡Sigue adelante con tu aprendizaje! Cada lección que completas te acerca más a tu meta.";
        }
        return script;
    }, [currentCourseName, currentModuleName, currentModuleNumber, currentCourseEndDate]);


    const renderActiveView = () => {
         if (isDataLoading && students.length === 0) { // Only show full-screen loader on initial load
            return (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                    <svg className="animate-spin h-10 w-10 text-sky-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <p className="text-xl font-semibold text-gray-800">Cargando datos desde Google Sheets...</p>
                    <p className="text-gray-500">Por favor, espera un momento.</p>
                </div>
            );
        }
        
        const sortedByName = [...students].sort((a,b) => a.name.localeCompare(b.name));
        
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
                         <StatusSummary students={finalSortedStudents} expectedPointsToday={expectedPointsToday} />
                         <FilterControls
                            institutions={uniqueInstitutions}
                            departments={uniqueDepartments}
                            statuses={orderedStatuses}
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            onResetFilters={resetFilters}
                            filteredCount={finalSortedStudents.length}
                            totalCount={students.length}
                        />
                        <LeaderboardTable 
                            students={finalSortedStudents} 
                            initialStudents={initialStudents}
                            onUpdateProgress={handleUpdateProgress} 
                            isReadOnly={false}
                            currentCourseName={currentCourseName}
                            onSelectStudent={handleSelectStudent}
                            onSort={handleSort}
                            sortConfig={sortConfig}
                            onOpenReportModal={handleOpenReportModal}
                            generateAudioScript={generateAudioScript}
                        />
                        <AIAnalyzer students={finalSortedStudents} expectedPointsToday={expectedPointsToday} />
                        <StatisticsView students={finalSortedStudents} />
                    </div>
                );
            case 'schedule':
                return <ScheduleView schedule={processedSchedule} today={today} />;
            case 'verification':
                return <VerificationView students={sortedByName} onUpdateVerification={handleUpdateVerification} isReadOnly={false}/>;
            case 'certificates':
                return <CertificatesView students={sortedByName} onUpdateCertificateStatus={handleUpdateCertificateStatus} onUpdateOtherStatus={handleUpdateOtherStatus} isReadOnly={false}/>;
            case 'tools':
                return <ToolsView
                            processedSchedule={processedSchedule}
                            today={today}
                            courseNames={COURSE_NAMES}
                            getExpectedPointsForDate={getExpectedPointsForDate}
                            expectedPointsToday={expectedPointsToday}
                       />;
            case 'help':
                 return <HelpView 
                    questions={questions.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime())}
                    onAskQuestion={handleAskQuestion}
                    onAddAnswer={handleAddAnswer}
                    driveFolderUrl="https://drive.google.com/drive/folders/18xkVPEYMjsZDAIutOVclhyMNdfwYhQb5?usp=drive_link" 
                 />;
            default:
                return null;
        }
    };

    const viewsWithSave = ['monitor', 'verification', 'certificates'];
    
    if (selectedStudent && chartData) {
        const isFirstPlace = selectedStudent?.id === studentsSortedByPoints[0]?.id && studentsSortedByPoints.length > 0 && studentsSortedByPoints[0].totalPoints > 0;
        return (
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-28">
                <StudentProfileView
                    student={selectedStudent}
                    chartData={chartData}
                    onBack={handleClearSelectedStudent}
                    isFirstPlace={isFirstPlace}
                    schedule={processedSchedule}
                    generateAudioScript={generateAudioScript}
                />
            </main>
        )
    }

    return (
        <>
        {programEndDateInfo && programEndDateInfo.daysRemaining >= 0 && (
            <CourseDeadlineAlert
                daysRemaining={programEndDateInfo.daysRemaining}
                courseName={programEndDateInfo.courseName}
                motivationalPhrase={motivationalPhrase}
                isMuted={areAlertsMuted}
            />
        )}
        {!areAlertsMuted && updatedStudentInfo && (
            <ProgressUpdateAlert
                studentName={updatedStudentInfo.name}
                pointsIncrease={updatedStudentInfo.pointsIncrease}
                onClose={() => setUpdatedStudentInfo(null)}
            />
        )}
        <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-28">
            {activeView === 'monitor' && !selectedStudent && (
                <div className="mb-8 text-left">
                    <div className="flex justify-between items-start">
                        <div className="flex-grow">
                            <h1 className="text-4xl font-extrabold text-gray-900">Monitor de Avance <span className="text-sky-600 font-bold">Google IT Support</span></h1>
                            <p className="text-lg text-gray-500 mt-2">Registro de puntajes y estado de la certificación en tiempo real.</p>
                        </div>
                        <div className="flex items-center gap-2">
                           <AlertsMuteControl isMuted={areAlertsMuted} onToggle={toggleAlertsMuted} />
                        </div>
                    </div>
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
        
        <ReportModal 
            isOpen={!!reportModalStudent}
            onClose={handleCloseReportModal}
            student={reportModalStudent}
            generateWhatsAppLink={generateWhatsAppLink}
            weeklyScheduleText={weeklyScheduleText}
            nextCourseDeadline={nextCourseDeadline}
        />

        <BottomNav activeView={activeView} setActiveView={setActiveView} />
        </>
    );
};

export default App;