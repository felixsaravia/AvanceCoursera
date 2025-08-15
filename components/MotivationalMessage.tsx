import React from 'react';
import { Student } from '../types';
import { Status } from '../types';

interface MotivationalMessageProps {
    student: Student;
}

const MotivationalMessage: React.FC<MotivationalMessageProps> = ({ student }) => {
    const { status, name } = student;
    const firstName = name.split(' ')[0];

    let config = {
        icon: <></>,
        title: '',
        message: '',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-300',
        iconColor: 'text-gray-500'
    };

    switch (status) {
        case Status.Riesgo:
            config = {
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>,
                title: `¡Atención, ${firstName}! Hay un desafío por delante`,
                message: "Tu progreso está en una zona crítica, pero cada experto ha estado aquí. Este es el momento de demostrar tu resiliencia. Estamos aquí para apoyarte. Revisa tu plan de acción y ¡vamos a superarlo juntos!",
                bgColor: 'bg-red-50',
                borderColor: 'border-red-500',
                iconColor: 'text-red-600',
            };
            break;
        case Status.Atrasada:
            config = {
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>,
                title: `${firstName}, este es tu mapa hacia el éxito`,
                message: "Cada experta en tecnología alguna vez se enfrentó a un desafío. Esto no es un obstáculo, es tu oportunidad para demostrar tu increíble capacidad de superación. ¡Tu próximo paso está justo aquí!",
                bgColor: 'bg-amber-50',
                borderColor: 'border-amber-400',
                iconColor: 'text-amber-500',
            };
            break;
        case Status.AlDia:
            config = {
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>,
                title: `¡Tu consistencia es tu superpoder, ${firstName}!`,
                message: "Estás construyendo el hábito más importante de un profesional de TI: la constancia. Cada día que avanzas, no solo acumulas puntos, sino que fortaleces una mentalidad de crecimiento que te llevará muy lejos.",
                bgColor: 'bg-green-50',
                borderColor: 'border-green-400',
                iconColor: 'text-green-500',
            };
            break;
        case Status.Avanzada:
        case Status.EliteI:
        case Status.EliteII:
            config = {
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 12-4-4-4 4"/><path d="m14 12v-10"/><path d="M4 12h10"/><path d="M4 20h16"/></svg>,
                title: `¡Estás marcando el ritmo, ${firstName}!`,
                message: "Tu proactividad es impresionante y te está posicionando como una líder. Aprovecha este impulso para explorar temas más a fondo y solidificar tu conocimiento. El éxito no es una meta, ¡es la dirección en la que ya estás viajando!",
                bgColor: 'bg-sky-50',
                borderColor: 'border-sky-400',
                iconColor: 'text-sky-500',
            };
            break;
        case Status.Finalizada:
            config = {
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 17 17 23 15.79 13.88"></polyline></svg>,
                title: `¡Misión cumplida, ${firstName}! Felicidades, especialista.`,
                message: "Has conquistado la certificación, demostrando dedicación y talento. Este no es el final, sino el lanzamiento de tu carrera. El mundo de la tecnología acaba de ganar una nueva estrella. ¿Qué conquistarás ahora?",
                bgColor: 'bg-yellow-50',
                borderColor: 'border-yellow-400',
                iconColor: 'text-yellow-500',
            };
            break;
        case Status.SinIniciar:
            config = {
                icon: <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>,
                title: `¡Bienvenida a tu aventura tecnológica, ${firstName}!`,
                message: "El viaje más increíble comienza con un solo paso. Hoy tienes la oportunidad de abrir la puerta a un futuro lleno de posibilidades. ¡Estamos emocionados de ver todo lo que vas a lograr!",
                bgColor: 'bg-slate-50',
                borderColor: 'border-slate-300',
                iconColor: 'text-slate-500',
            };
            break;
    }
    
    return (
        <div className={`p-6 rounded-lg border-l-4 flex items-start gap-6 ${config.bgColor} ${config.borderColor}`}>
            <div className={`flex-shrink-0 mt-1 ${config.iconColor}`}>
                {config.icon}
            </div>
            <div>
                <h2 className="text-xl font-bold text-gray-900">{config.title}</h2>
                <p className="mt-2 text-gray-600">{config.message}</p>
            </div>
        </div>
    );
};

export default MotivationalMessage;