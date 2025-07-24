import React from 'react';

interface ProgressSummaryProps {
  expectedPointsToday: number;
  currentCourseName: string;
  currentModuleName: string;
  currentModuleNumber: number;
}

const ProgressSummary: React.FC<ProgressSummaryProps> = ({ expectedPointsToday, currentCourseName, currentModuleName, currentModuleNumber }) => {
  const courseParts = currentCourseName.split('. ');
  const courseNumber = courseParts[0] || '1';
  const courseTitle = courseParts.slice(1).join('. ');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Card for Expected Points */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <p className="text-sm text-gray-500 font-medium">Puntaje Esperado a la Fecha</p>
        <p className="text-5xl font-extrabold text-gray-900 mt-2">{expectedPointsToday.toFixed(2)}</p>
      </div>
      
      {/* Card for Current Focus */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <p className="text-sm text-gray-500 font-medium">Curso y módulo al día</p>
        <div className="mt-3 space-y-1">
            <p className="text-lg font-bold text-gray-900 leading-tight">
              {`Curso ${courseNumber}: ${courseTitle}`}
            </p>
            <p className="text-md text-sky-600 font-semibold">
              {`Módulo ${currentModuleNumber}: ${currentModuleName}`}
            </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressSummary;