import React, { useState, useEffect } from 'react';
import { Student } from '../types';
import { COURSE_NAMES } from '../constants';

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    student: Student | null;
    generateWhatsAppLink: (student: Student, type: string, data?: any) => string;
    weeklyScheduleText: string;
    nextCourseDeadline: { courseName: string; date: string } | null;
}

const ModalOptionButton: React.FC<{
    icon: React.ReactNode;
    title: string;
    description: string;
    href?: string;
    onClick?: () => void;
}> = ({ icon, title, description, href, onClick }) => {
    const commonClasses = "w-full text-left flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 group";

    const content = (
        <>
            <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-gray-200 group-hover:bg-sky-100 rounded-lg text-sky-600 transition-colors">
                {icon}
            </div>
            <div>
                <p className="font-semibold text-gray-800">{title}</p>
                <p className="text-xs text-gray-500">{description}</p>
            </div>
            <div className="ml-auto text-gray-400 group-hover:text-sky-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>
        </>
    );

    if (href) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={commonClasses} onClick={onClick}>
                {content}
            </a>
        );
    }

    return (
        <button onClick={onClick} className={commonClasses}>
            {content}
        </button>
    );
};


const CourseSelectionButton: React.FC<{
    courseName: string;
    isCompleted: boolean;
    onClick: () => void;
}> = ({ courseName, isCompleted, onClick }) => (
    <button onClick={onClick} className="w-full text-left flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 group">
        <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
            {isCompleted ? (
                 <svg className="w-5 h-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            ) : (
                <div className="w-4 h-4 border-2 border-gray-300 rounded-full bg-white"></div>
            )}
        </div>
        <div className="flex-grow">
            <p className="font-medium text-gray-800">{courseName}</p>
        </div>
        <div className="ml-auto text-gray-400 group-hover:text-sky-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
    </button>
);

const CertificateSelectionCheckbox: React.FC<{
    courseName: string;
    isSelected: boolean;
    onToggle: () => void;
}> = ({ courseName, isSelected, onToggle }) => (
    <button onClick={onToggle} className="w-full text-left flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200 group">
        <div className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-md border-2 transition-colors
            ${isSelected ? 'bg-sky-500 border-sky-500' : 'bg-white border-gray-300 group-hover:border-sky-400'}`}>
            {isSelected && (
                 <svg className="w-4 h-4 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
            )}
        </div>
        <div className="flex-grow">
            <p className="font-medium text-gray-800">{courseName}</p>
        </div>
    </button>
);


const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, student, generateWhatsAppLink, weeklyScheduleText, nextCourseDeadline }) => {
    const [view, setView] = useState<'main' | 'select_course' | 'select_certificate'>('main');
    const [actionType, setActionType] = useState<'felicitar' | 'felicitar_iniciar' | 'recordar_certificado' | 'iniciar_curso' | null>(null);
    const [selectedCerts, setSelectedCerts] = useState<number[]>([]);

    const [isPinVerified, setIsPinVerified] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [pinError, setPinError] = useState('');
    const CORRECT_PIN = '2450';

    useEffect(() => {
        if (!isOpen) {
            // Reset state after transition
            const timer = setTimeout(() => {
                setView('main');
                setActionType(null);
                setSelectedCerts([]);
                setIsPinVerified(false);
                setPinInput('');
                setPinError('');
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);
    
    const handlePinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pinInput === CORRECT_PIN) {
            setIsPinVerified(true);
            setPinError('');
        } else {
            setPinError('PIN incorrecto. Inténtalo de nuevo.');
            setPinInput('');
        }
    };

    if (!isOpen || !student) return null;

    const handleCourseSelection = (courseName: string, courseIndex: number) => {
        if (!actionType || actionType === 'recordar_certificado') return;
        const link = generateWhatsAppLink(student, actionType, { courseName, courseIndex });
        window.open(link, '_blank', 'noopener,noreferrer');
        onClose();
    };
    
    const handleToggleCert = (courseIndex: number) => {
        setSelectedCerts(prev => 
            prev.includes(courseIndex) 
                ? prev.filter(i => i !== courseIndex) 
                : [...prev, courseIndex]
        );
    };

    const handleSendCertificateReminder = () => {
        if (selectedCerts.length === 0) return;
        const selectedCourseNames = selectedCerts.map(index => COURSE_NAMES[index]);
        const link = generateWhatsAppLink(student, 'recordar_certificado', { courseNames: selectedCourseNames });
        window.open(link, '_blank', 'noopener,noreferrer');
        onClose();
    };

    const handleBack = () => {
        setView('main');
        setActionType(null);
        setSelectedCerts([]);
    };

    const renderMainView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-fade-in">
            <ModalOptionButton
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 4V2h10v2"/><path d="M12 18.5 9 22l3-1.5 3 1.5-3-3.5"/><path d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"/><path d="M12 15v3.5"/></svg>}
                title="Felicitar por curso"
                description="Enviar felicitaciones por completar un curso."
                onClick={() => {
                    setActionType('felicitar');
                    setView('select_course');
                }}
            />
            <ModalOptionButton
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.11S7.09 9.81 7.94 9.1c1.26-1.5 5-2 5-2s-.5 3.74-2 5c-.84.71-2.3.7-3.11.05s-1.66-1.66-1.11-2.51c.55-.85 1.26-1.5 2.51-1.11z"/><path d="m21.5 2.5-1.9 1.9"/></svg>}
                title="Felicitar y Siguiente"
                description="Motivar a comenzar el próximo curso."
                onClick={() => {
                    setActionType('felicitar_iniciar');
                    setView('select_course');
                }}
            />
            <ModalOptionButton
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>}
                title="Felicitar por avance"
                description="Mensaje genérico por buen progreso."
                href={generateWhatsAppLink(student, 'felicitar_avance')}
                onClick={onClose}
            />
            <ModalOptionButton
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 12-4-4-4 4"/><path d="m14 12v-10"/><path d="M4 12h10"/><path d="M4 20h16"/></svg>}
                title="Iniciar curso específico"
                description="Pedirle que inicie un curso en particular."
                onClick={() => { setActionType('iniciar_curso'); setView('select_course'); }}
            />
            <ModalOptionButton
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>}
                title="Enviar Reporte"
                description="Mensaje con su estado y puntajes."
                href={generateWhatsAppLink(student, 'report')}
                onClick={onClose}
            />
            <ModalOptionButton
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>}
                title="Recordar Certificado"
                description="Recordatorio para certificados pendientes."
                onClick={() => {
                    setActionType('recordar_certificado');
                    setView('select_certificate');
                }}
            />
            <ModalOptionButton
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 16-4-4V7a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2l-4 4Z"/><path d="M14 14v4"/></svg>}
                title="Invitar a Tutoría"
                description="Preguntar si puede unirse a una sesión."
                href={generateWhatsAppLink(student, 'recordar_tutoria')}
                onClick={onClose}
            />
            <ModalOptionButton
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>}
                title="Enviar Cronograma"
                description="Mandar actividades de la semana."
                href={generateWhatsAppLink(student, 'schedule', { scheduleText: weeklyScheduleText })}
                onClick={onClose}
            />
            {nextCourseDeadline && (
                 <ModalOptionButton
                    icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>}
                    title="Recordar Entrega"
                    description={`Informar sobre la fecha de fin.`}
                    href={generateWhatsAppLink(student, 'deadline', { deadline: nextCourseDeadline })}
                    onClick={onClose}
                 />
            )}
             <ModalOptionButton
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
                title="Mensaje en Blanco"
                description="Abrir chat para mensaje personalizado."
                href={generateWhatsAppLink(student, 'blank')}
                onClick={onClose}
            />
        </div>
    );

    const renderSelectCourseView = () => (
        <div className="animate-fade-in">
           <button onClick={handleBack} className="flex items-center gap-1 text-sm font-semibold text-sky-600 hover:text-sky-500 mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
               Volver
           </button>
           <h4 className="font-bold text-gray-800 mb-3">¿Sobre qué curso es el mensaje?</h4>
           <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2">
               {COURSE_NAMES.map((courseName, index) => {
                   const isCompleted = student.courseProgress[index] === 100;
                   return (
                       <CourseSelectionButton
                           key={index}
                           courseName={courseName}
                           isCompleted={isCompleted}
                           onClick={() => handleCourseSelection(courseName, index)}
                       />
                   )
               })}
           </div>
       </div>
   );

   const renderSelectCertificateView = () => {
        const pendingCertCourses = COURSE_NAMES.map((name, index) => ({
            name,
            index,
            isCompleted: student.courseProgress[index] === 100,
            isSubmitted: student.certificateStatus[index],
        })).filter(c => c.isCompleted && !c.isSubmitted);

        return (
            <div className="animate-fade-in">
                <button onClick={handleBack} className="flex items-center gap-1 text-sm font-semibold text-sky-600 hover:text-sky-500 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    Volver
                </button>
                <h4 className="font-bold text-gray-800 mb-1">¿De qué cursos le recordarás?</h4>
                <p className="text-xs text-gray-500 mb-4">Se mostrarán solo los cursos completados con certificado pendiente.</p>
                
                {pendingCertCourses.length === 0 ? (
                    <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="font-semibold text-gray-800">¡Todo en orden!</p>
                        <p className="text-sm text-gray-600 mt-1">Esta estudiante no tiene certificados pendientes de entregar.</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar pr-2 mb-4">
                            {pendingCertCourses.map(({name, index}) => (
                                <CertificateSelectionCheckbox
                                    key={index}
                                    courseName={name}
                                    isSelected={selectedCerts.includes(index)}
                                    onToggle={() => handleToggleCert(index)}
                                />
                            ))}
                        </div>
                        <button 
                            onClick={handleSendCertificateReminder}
                            disabled={selectedCerts.length === 0}
                            className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            Generar Mensaje
                        </button>
                    </>
                )}
            </div>
        );
    };

    const pinForm = (
        <form onSubmit={handlePinSubmit} className="space-y-4 animate-fade-in">
            <div className="text-center">
                 <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-400"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <div>
                <label htmlFor="pin-input" className="block text-sm font-medium text-center text-gray-700">
                    Ingresa el PIN de seguridad para continuar
                </label>
                <input
                    type="password"
                    id="pin-input"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    className="mt-2 block w-full text-center tracking-[1em] px-3 py-2 bg-gray-50 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-lg"
                    autoFocus
                    maxLength={4}
                    pattern="\d*"
                    autoComplete="one-time-code"
                />
            </div>
            {pinError && <p className="text-sm text-center text-red-600">{pinError}</p>}
            <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50"
                disabled={pinInput.length < 4}
            >
                Verificar
            </button>
        </form>
    );

    const viewSubtitles: {[key: string]: string} = {
        main: 'Selecciona una acción rápida',
        select_course: 'Selecciona el curso para el mensaje',
        select_certificate: 'Selecciona los certificados pendientes'
    };
    
    const subtitle = isPinVerified ? viewSubtitles[view] : 'PIN de seguridad requerido';

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} onClick={onClose}>
            <div className={`bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl transition-all duration-300 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Contactar a {student.name.split(' ')[0]}</h3>
                        <p className="text-sm text-gray-500">
                             {subtitle}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-full p-1 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                </div>
                {!isPinVerified ? pinForm : (
                    <>
                        {view === 'main' && renderMainView()}
                        {view === 'select_course' && renderSelectCourseView()}
                        {view === 'select_certificate' && renderSelectCertificateView()}
                    </>
                )}
            </div>
        </div>
    );
};

export default ReportModal;