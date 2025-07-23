import React from 'react';
import { Student } from '../types';
import VerificationStatusBadge from './VerificationStatusBadge';

interface VerificationViewProps {
  students: Student[];
  onUpdateVerification: (studentId: number, type: 'identity' | 'twoFactor') => void;
  isReadOnly: boolean;
}

const VerificationView: React.FC<VerificationViewProps> = ({ students, onUpdateVerification, isReadOnly }) => {
  return (
    <section className="space-y-6">
       <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Estado de Verificación</h2>
        <p className="text-gray-500 mb-6">Haz clic en un estado para marcarlo como pendiente o realizado.</p>
        <div className="overflow-x-auto">
           <table className="min-w-full">
             <thead className="border-b border-gray-200">
               <tr>
                 <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-gray-500">Nombre</th>
                 <th scope="col" className="py-3.5 px-3 text-center text-sm font-semibold text-gray-500">Verificación de Identidad</th>
                 <th scope="col" className="py-3.5 px-3 text-center text-sm font-semibold text-gray-500">Verificación de Dos Pasos</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-200">
               {students.map((student) => (
                 <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-200">
                   <td className="whitespace-nowrap py-4 px-3 text-sm font-medium text-gray-900">{student.name}</td>
                   <td className="whitespace-nowrap py-4 px-3 text-sm text-center">
                     <VerificationStatusBadge
                       verified={student.identityVerified}
                       onClick={() => onUpdateVerification(student.id, 'identity')}
                       disabled={isReadOnly}
                     />
                   </td>
                   <td className="whitespace-nowrap py-4 px-3 text-sm text-center">
                     <VerificationStatusBadge
                       verified={student.twoFactorVerified}
                       onClick={() => onUpdateVerification(student.id, 'twoFactor')}
                       disabled={isReadOnly}
                     />
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
       </div>
    </section>
  );
};

export default VerificationView;