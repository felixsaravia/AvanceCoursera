import React, { useState } from 'react';
import { CommunityQuestion, Answer } from '../types';

interface HelpViewProps {
    questions: CommunityQuestion[];
    onAskQuestion: (questionText: string) => void;
    onAddAnswer: (questionId: number, answerText: string) => void;
    driveFolderUrl: string;
}

const formatRelativeTime = (date: Date) => {
    // Get the current time in UTC and adjust it for El Salvador (UTC-6)
    const nowInUTC = new Date();
    const now = new Date(nowInUTC.getTime() - (6 * 60 * 60 * 1000));
    
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return `hace ${Math.floor(interval)} años`;
    interval = seconds / 2592000;
    if (interval > 1) return `hace ${Math.floor(interval)} meses`;
    interval = seconds / 86400;
    if (interval > 1) return `hace ${Math.floor(interval)} días`;
    interval = seconds / 3600;
    if (interval > 1) return `hace ${Math.floor(interval)} horas`;
    interval = seconds / 60;
    if (interval > 1) return `hace ${Math.floor(interval)} minutos`;
    return `hace ${Math.floor(seconds)} segundos`;
}

const AnswerForm: React.FC<{ questionId: number; onAddAnswer: (questionId: number, answerText: string) => void; }> = ({ questionId, onAddAnswer }) => {
    const [answer, setAnswer] = useState('');
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!answer.trim()) return;
        onAddAnswer(questionId, answer);
        setAnswer('');
    };

    return (
        <form onSubmit={handleSubmit} className="flex gap-2 mt-4">
            <input
                type="text"
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Escribe tu respuesta..."
                className="flex-grow bg-white border-gray-300 rounded-md p-2 text-gray-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            <button type="submit" className="px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors disabled:bg-gray-400" disabled={!answer.trim()}>
                Responder
            </button>
        </form>
    );
};

const HelpView: React.FC<HelpViewProps> = ({ questions, onAskQuestion, onAddAnswer, driveFolderUrl }) => {
    const [newQuestion, setNewQuestion] = useState('');
    
    const handleAskSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newQuestion.trim()) return;
        onAskQuestion(newQuestion);
        setNewQuestion('');
    };

    return (
        <section className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Contacto de Soporte</h2>
                    <div className="space-y-4">
                        <a href="https://wa.me/50370685475" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            <div>
                                <p className="font-semibold text-gray-900">WhatsApp</p>
                                <p className="text-sm text-gray-500">7068-5475</p>
                            </div>
                        </a>
                        <a href="mailto:felixsaravia@campus.agape.edu.sv" className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500"><rect x="2" y="4" width="20" height="16" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                           <div>
                                <p className="font-semibold text-gray-900">Correo Electrónico</p>
                                <p className="text-sm text-gray-500">felixsaravia@campus.agape.edu.sv</p>
                            </div>
                        </a>
                        <a href="https://meet.google.com/jpj-nibe-hro" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="m21 16-4-4V7a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2l-4 4Z"/><path d="M14 14v4"/></svg>
                            <div>
                                <p className="font-semibold text-gray-900">Enlace de tutoria</p>
                                <p className="text-sm text-gray-500">meet.google.com/jpj-nibe-hro</p>
                            </div>
                        </a>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Aula Virtual</h2>
                     <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500 mb-4"><path d="M20 22h-2"/><path d="M20 15v2h-2"/><path d="M4 22h2"/><path d="M4 17v-2h2"/><path d="M15 4h2v2h-2"/><path d="M8.5 12.5a3.5 3.5 0 1 1 7 0c0 .9-.2 1.5-.5 2-.3.5-.8 1-1.5 1.5-1 .8-2.5 1.5-3.5 1.5-1 0-2.5-.7-3.5-1.5-.7-.5-1.2-1-1.5-1.5-.3-.5-.5-1.1-.5-2Z"/><path d="M12 8V4H8.5C6 4 4 6.5 4 9.5c0 1.2.3 2.3.8 3.3"/><path d="m12 8 3.5 2"/><path d="M12 4h3.5c2.5 0 4.5 2.5 4.5 5.5 0 1.2-.3 2.3-.8 3.3"/><path d="m12 8-3.5 2"/></svg>
                    <a href="https://classroom.google.com/c/NzAwMzQwNzgxNzgz" target="_blank" rel="noopener noreferrer" className="w-full bg-amber-500 text-white font-semibold rounded-lg hover:bg-amber-600 transition-colors py-3 px-5">
                        Ir a Classroom
                    </a>
                </div>

                {driveFolderUrl && (
                    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center items-center text-center">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Certificados en Drive</h2>
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500 mb-4"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"></path><path d="M12 10v6"></path><path d="m15 13-3-3-3 3"></path></svg>
                        <a href={driveFolderUrl} target="_blank" rel="noopener noreferrer" className="w-full bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors py-3 px-5">
                            Ir a Carpeta de Drive
                        </a>
                        <p className="text-xs text-gray-500 mt-3">Sube tus certificados a la carpeta compartida.</p>
                    </div>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Video de Inducción</h2>
                <div className="aspect-video">
                    <iframe 
                        className="w-full h-full rounded-lg" 
                        src="https://www.youtube.com/embed/DZq0-TUd2MQ" 
                        title="Video de Inducción de Coursera" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        allowFullScreen>
                    </iframe>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-1">Preguntas de la Comunidad</h2>
                <p className="text-gray-500 mb-6">¿Tienes una duda? Publícala aquí para que tus compañeros te ayuden.</p>
                
                <form onSubmit={handleAskSubmit} className="mb-8">
                    <textarea 
                        value={newQuestion}
                        onChange={e => setNewQuestion(e.target.value)}
                        placeholder="Escribe tu pregunta aquí..."
                        className="w-full bg-gray-50 border-gray-300 rounded-md p-3 text-gray-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        rows={3}
                    />
                    <button type="submit" disabled={!newQuestion.trim()} className="mt-3 w-full sm:w-auto float-right px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
                        Publicar Pregunta
                    </button>
                </form>

                <div className="space-y-6 pt-4 border-t border-gray-200">
                    {questions.map(q => (
                        <div key={q.id} className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-800 mb-2">{q.text}</p>
                            <div className="flex items-center justify-between mb-4">
                               <p className="text-xs text-sky-600 font-semibold">{q.author}</p>
                               <p className="text-xs text-gray-500">{formatRelativeTime(q.timestamp)}</p>
                            </div>
                           
                            <div className="border-t border-gray-200 pt-4 pl-4 space-y-4">
                                {q.answers.map(a => (
                                    <div key={a.id} className="text-sm">
                                        <p className="text-gray-700">{a.text}</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-xs text-green-600 font-medium">{a.author}</p>
                                            <p className="text-xs text-gray-500">{formatRelativeTime(a.timestamp)}</p>
                                        </div>
                                    </div>
                                ))}
                                {q.answers.length === 0 && <p className="text-sm text-gray-500">Aún no hay respuestas. ¡Sé el primero en ayudar!</p>}
                            </div>

                             <div className="mt-4 border-t border-gray-200/50 pt-4">
                                 <AnswerForm questionId={q.id} onAddAnswer={onAddAnswer} />
                             </div>
                        </div>
                    ))}
                     {questions.length === 0 && <p className="text-center text-gray-500 py-8">No hay preguntas todavía. ¡Anímate a publicar la primera!</p>}
                </div>
            </div>
        </section>
    );
};

export default HelpView;