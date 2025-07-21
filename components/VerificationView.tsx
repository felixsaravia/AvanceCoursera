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
       <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-1">Estado de Verificación</h2>
        <p className="text-slate-400 mb-6">Haz clic en un estado para marcarlo como pendiente o realizado.</p>
        <div className="overflow-x-auto">
           <table className="min-w-full">
             <thead className="border-b border-slate-700">
               <tr>
                 <th scope="col" className="py-3.5 px-3 text-left text-sm font-semibold text-slate-300">Nombre</th>
                 <th scope="col" className="py-3.5 px-3 text-center text-sm font-semibold text-slate-300">Verificación de Identidad</th>
                 <th scope="col" className="py-3.5 px-3 text-center text-sm font-semibold text-slate-300">Verificación de Dos Pasos</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-800">
               {students.map((student) => (
                 <tr key={student.id} className="hover:bg-slate-800/60 transition-colors duration-200">
                   <td className="whitespace-nowrap py-4 px-3 text-sm font-medium text-white">{student.name}</td>
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