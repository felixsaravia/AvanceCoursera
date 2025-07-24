import React, { useState } from 'react';
import { Student, Status } from '../types';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import { TOTAL_MAX_POINTS, MAX_POINTS_PER_COURSE, COURSE_NAMES, COURSE_SHORT_NAMES } from '../constants';

interface LeaderboardTableProps {
  students: Student[];
  onUpdateProgress: (studentId: number, courseIndex: number, newProgress: number) => void;
  isReadOnly: boolean;
  currentCourseName: string;
}

const generateWhatsAppMessage = (student: Student): string => {
    const name = student.name.split(' ')[0]; // Use first name for a personal but formal touch
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
            footer = "¡Ánimo! 💪 Sabemos que puede ponerse al día. Organice su tiempo, enfóquese en el próximo módulo y verá cómo avanza. ¡No se rinda, cada paso cuenta! ✨";
            break;
        case Status.Riesgo:
            footer = "¡No se preocupe, estamos para apoyarla! 🙏 Es momento de redoblar esfuerzos y enfocarse. Recuerde por qué empezó este camino. Si necesita ayuda, no dude en contactarme. ¡Confío en que lo logrará! 🤝";
            break;
        case Status.SinIniciar:
            footer = "¡Es hora de empezar esta increíble aventura! 🚀 El primer paso es el más importante. Entre a la plataforma y complete su primera lección. ¡Estamos emocionados de ver su progreso! 😊";
            break;
        default:
            footer = "¡Siga adelante con sus estudios! Cada lección es un paso más hacia su meta. 💪";
            break;
    }

    return `${header}${body}${footer}`;
};

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ students, onUpdateProgress, isReadOnly, currentCourseName }) => {
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


  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-gray-200 shadow-lg custom-scrollbar">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="w-16 text-center py-3.5 px-3 text-sm font-semibold text-gray-500">#</th>
            <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-500">Nombre</th>
            <th scope="col" className="w-20 text-center py-3.5 px-3 text-sm font-semibold text-gray-500">Reporte</th>
            <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-500">Estado</th>
            <th scope="col" className="w-48 py-3.5 px-3 text-left text-sm font-semibold text-gray-500">Progreso Total</th>
            <th scope="col" className="text-center py-3.5 px-3 text-sm font-semibold text-gray-500">Puntos</th>
            <th scope="col" className="text-center py-3.5 px-3 text-sm font-semibold text-gray-500">Esperado</th>
            {COURSE_SHORT_NAMES.map((name, i) => {
              const isCurrentCourse = COURSE_NAMES[i] === currentCourseName;
              return (
                <th 
                  key={i} 
                  scope="col" 
                  className={`text-center py-3.5 px-3 text-xs text-gray-500 whitespace-nowrap transition-colors ${isCurrentCourse ? 'bg-sky-100' : ''}`} title={COURSE_NAMES[i]}>
                  <div className="font-semibold">Curso {i + 1}</div>
                  <div className="font-normal mt-1">{name}</div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {students.map((student, index) => (
            <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-200">
              <td className="whitespace-nowrap text-center py-4 px-3 text-lg font-bold text-gray-500">{index + 1}</td>
              <td className="whitespace-nowrap py-4 px-3 text-sm font-medium text-gray-900">
                {student.name}
              </td>
              <td className="whitespace-nowrap text-center py-4 px-3">
                {student.phone && (
                    <a 
                        href={`https://wa.me/${student.phone}?text=${encodeURIComponent(generateWhatsAppMessage(student))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Enviar reporte por WhatsApp"
                        className="inline-block text-green-600 hover:text-green-700 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        <span className="sr-only">Enviar reporte a {student.name}</span>
                    </a>
                )}
              </td>
              <td className="whitespace-nowrap py-4 px-3 text-sm"><StatusBadge status={student.status} /></td>
              <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-600">
                <ProgressBar progress={(student.totalPoints / TOTAL_MAX_POINTS) * 100} />
              </td>
              <td className="whitespace-nowrap text-center py-4 px-3 text-sm font-semibold text-sky-600">{student.totalPoints}</td>
              <td className="whitespace-nowrap text-center py-4 px-3 text-sm text-gray-500">{Math.round(student.expectedPoints)}</td>
              {student.courseProgress.map((progress, i) => {
                const isEditing = editingCell?.studentId === student.id && editingCell?.courseIndex === i;
                const isCurrentCourse = COURSE_NAMES[i] === currentCourseName;
                return (
                  <td
                    key={i}
                    className={`whitespace-nowrap text-center py-2 px-1 text-sm text-gray-600 transition-colors ${isCurrentCourse ? 'bg-sky-50' : ''}`}
                    onClick={() => !isReadOnly && !isEditing && setEditingCell({ studentId: student.id, courseIndex: i })}
                  >
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaderboardTable;