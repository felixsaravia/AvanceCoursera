import React from 'react';
import { Student } from '../types';
import VerificationStatusBadge from './VerificationStatusBadge';
import { TOTAL_COURSES, COURSE_SHORT_NAMES, COURSE_NAMES } from '../constants';

interface CertificatesViewProps {
  students: Student[];
  onUpdateCertificateStatus: (studentId: number, courseIndex: number) => void;
  onUpdateOtherStatus: (studentId: number, type: 'final' | 'dtv') => void;
  isReadOnly: boolean;
}

const CertificatesView: React.FC<CertificatesViewProps> = ({ students, onUpdateCertificateStatus, onUpdateOtherStatus, isReadOnly }) => {
  return (
    <section className="space-y-6">
       <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Entrega de Certificados</h2>
            <p className="text-gray-500">Haz clic en el estado de un certificado para marcarlo como entregado o pendiente.</p>
          </div>
          <a
            href="https://drive.google.com/drive/u/1/folders/1cwbcQi4frV5iI8YXLFeuzLapYGdM6SAH"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
            <span>Subir a Drive</span>
          </a>
        </div>
        <div className="overflow-x-auto">
           <table className="min-w-full">
             <thead className="bg-gray-50">
               <tr>
                 <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-500">Nombre</th>
                 {COURSE_SHORT_NAMES.map((name, i) => (
                    <th key={i} scope="col" className="py-3.5 px-3 text-center text-xs text-gray-500 whitespace-nowrap" title={`Certificado: ${COURSE_NAMES[i]}`}>
                        <div className="font-semibold">Cert. Curso {i + 1}</div>
                        <div className="font-normal mt-1">{name}</div>
                    </th>
                 ))}
                 <th scope="col" className="py-3.5 px-3 text-center text-sm font-semibold text-gray-500 whitespace-nowrap">Certificado Final</th>
                 <th scope="col" className="py-3.5 px-3 text-center text-sm font-semibold text-gray-500 whitespace-nowrap">Certificado DTV</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-200 bg-white">
               {students.map((student) => (
                 <tr key={student.id} className="hover:bg-gray-50 group">
                   <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">{student.name}</td>
                   {student.certificateStatus.map((status, index) => (
                     <td key={index} className="whitespace-nowrap py-4 px-3 text-sm text-center">
                       <VerificationStatusBadge
                         verified={status}
                         onClick={() => onUpdateCertificateStatus(student.id, index)}
                         verifiedText="Entregado"
                         disabled={isReadOnly}
                       />
                     </td>
                   ))}
                   <td className="whitespace-nowrap py-4 px-3 text-sm text-center">
                       <VerificationStatusBadge
                         verified={student.finalCertificateStatus}
                         onClick={() => onUpdateOtherStatus(student.id, 'final')}
                         verifiedText="Entregado"
                         disabled={isReadOnly}
                       />
                   </td>
                   <td className="whitespace-nowrap py-4 px-3 text-sm text-center">
                       <VerificationStatusBadge
                         verified={student.dtvStatus}
                         onClick={() => onUpdateOtherStatus(student.id, 'dtv')}
                         verifiedText="Entregado"
                         disabled={isReadOnly}
                       />
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
       </div>
       <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Tutorial: Cómo subir tu certificado</h2>
          <p className="text-gray-500 mb-4">Este video te guiará en el proceso para subir correctamente tus certificados a la carpeta compartida de Drive.</p>
          <div className="aspect-video">
              <iframe 
                  className="w-full h-full rounded-lg" 
                  src="https://www.youtube.com/embed/DZq0-TUd2MQ" 
                  title="Video de Inducción y Subida de Certificados" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                  allowFullScreen>
              </iframe>
          </div>
      </div>
    </section>
  );
};

export default CertificatesView;