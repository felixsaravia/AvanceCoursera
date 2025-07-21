import React, { useState } from 'react';
import { Student } from '../types';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import { TOTAL_MAX_POINTS, TOTAL_COURSES, MAX_POINTS_PER_COURSE } from '../constants';

interface LeaderboardTableProps {
  students: Student[];
  onUpdateProgress: (studentId: number, courseIndex: number, newProgress: number) => void;
  isReadOnly: boolean;
}

const LeaderboardTable: React.FC<LeaderboardTableProps> = ({ students, onUpdateProgress, isReadOnly }) => {
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
    <div className="overflow-x-auto bg-slate-800/50 rounded-lg border border-slate-700 shadow-lg">
      <table className="min-w-full divide-y divide-slate-700">
        <thead className="bg-slate-800">
          <tr>
            <th scope="col" className="w-16 text-center py-3.5 px-3 text-sm font-semibold text-slate-300">#</th>
            <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-slate-300">Nombre</th>
            <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-slate-300">Estado</th>
            <th scope="col" className="w-48 py-3.5 px-3 text-left text-sm font-semibold text-slate-300">Progreso Total</th>
            <th scope="col" className="text-center py-3.5 px-3 text-sm font-semibold text-slate-300">Puntos</th>
            <th scope="col" className="text-center py-3.5 px-3 text-sm font-semibold text-slate-300">Esperado</th>
            {[...Array(TOTAL_COURSES)].map((_, i) => (
              <th key={i} scope="col" className="text-center py-3.5 px-3 text-sm font-semibold text-slate-300">C{i + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 bg-slate-900">
          {students.map((student, index) => (
            <tr key={student.id} className="hover:bg-slate-800/60 transition-colors duration-200">
              <td className="whitespace-nowrap text-center py-4 px-3 text-lg font-bold text-slate-400">{index + 1}</td>
              <td className="whitespace-nowrap py-4 px-3 text-sm font-medium text-white">{student.name}</td>
              <td className="whitespace-nowrap py-4 px-3 text-sm"><StatusBadge status={student.status} /></td>
              <td className="whitespace-nowrap py-4 px-3 text-sm text-slate-300">
                <ProgressBar progress={(student.totalPoints / TOTAL_MAX_POINTS) * 100} />
              </td>
              <td className="whitespace-nowrap text-center py-4 px-3 text-sm font-semibold text-sky-400">{student.totalPoints}</td>
              <td className="whitespace-nowrap text-center py-4 px-3 text-sm text-slate-400">{Math.round(student.expectedPoints)}</td>
              {student.courseProgress.map((progress, i) => {
                const isEditing = editingCell?.studentId === student.id && editingCell?.courseIndex === i;
                return (
                  <td
                    key={i}
                    className="whitespace-nowrap text-center py-2 px-1 text-sm text-slate-300"
                    onClick={() => !isReadOnly && !isEditing && setEditingCell({ studentId: student.id, courseIndex: i })}
                  >
                    {isEditing ? (
                      <input
                        type="number"
                        defaultValue={progress}
                        onBlur={(e) => handleBlur(e, student.id, i)}
                        onKeyDown={(e) => handleKeyDown(e, student.id, i)}
                        autoFocus
                        className="w-20 bg-slate-700 border-slate-600 rounded-md p-2 text-center text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        min="0"
                        max="100"
                      />
                    ) : (
                      <span className={`inline-block w-full py-2 rounded-md transition-colors ${isReadOnly ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-slate-800'}`}>
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