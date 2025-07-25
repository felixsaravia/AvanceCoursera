import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

type ConversationTurn = {
    role: 'interviewer' | 'applicant' | 'feedback';
    content: string;
};

const AIInterviewSimulator: React.FC = () => {
    const [conversation, setConversation] = useState<ConversationTurn[]>([]);
    const [userAnswer, setUserAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [interviewState, setInterviewState] = useState<'idle' | 'waiting_for_answer' | 'answer_submitted'>('idle');
    const conversationEndRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        conversationEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);

    const callGemini = async (prompt: string): Promise<string> => {
        if (!process.env.API_KEY) {
            throw new Error('La API Key de Google Gemini no está configurada.');
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const result: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return result.text;
    };

    const startInterview = async () => {
        setLoading(true);
        setError('');
        setConversation([]);
        setInterviewState('waiting_for_answer');
        try {
            const prompt = `
                Eres un amigable y profesional entrevistador para un puesto de "Especialista de Soporte de TI" de nivel de entrada. 
                Estás entrevistando a una estudiante que acaba de terminar una certificación.
                Comienza la entrevista con una pregunta de apertura común. Solo proporciona la pregunta, sin saludos adicionales.
                Ejemplos: "¿Puedes contarme un poco sobre ti y por qué te interesa el soporte de TI?" o "¿Qué te motivó a buscar una carrera en tecnología?".
            `;
            const firstQuestion = await callGemini(prompt);
            setConversation([{ role: 'interviewer', content: firstQuestion }]);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'Error al iniciar la entrevista.');
            setInterviewState('idle');
        } finally {
            setLoading(false);
        }
    };

    const submitAnswer = () => {
        if (!userAnswer.trim()) return;
        setConversation(prev => [...prev, { role: 'applicant', content: userAnswer }]);
        setUserAnswer('');
        setInterviewState('answer_submitted');
    };
    
    const generateHistoryPrompt = () => {
        return conversation.map(turn => {
            if (turn.role === 'interviewer') return `ENTREVISTADOR: ${turn.content}`;
            if (turn.role === 'applicant') return `CANDIDATO: ${turn.content}`;
            if (turn.role === 'feedback') return `FEEDBACK: ${turn.content}`;
            return '';
        }).join('\n\n');
    }

    const getFeedback = async () => {
        setLoading(true);
        setError('');
        try {
            const history = generateHistoryPrompt();
            const prompt = `
                ${history}

                ---
                Eres un coach de carrera. Basado en la última pregunta del entrevistador y la respuesta del candidato, proporciona feedback constructivo en español. 
                El feedback debe ser:
                1.  **Positivo:** Comienza con algo que el candidato hizo bien.
                2.  **Específico:** Ofrece 1 o 2 sugerencias claras para mejorar.
                3.  **Conciso:** Mantén el feedback breve y al punto.
                No hagas una nueva pregunta. Solo proporciona el feedback.
            `;
            const feedbackText = await callGemini(prompt);
            setConversation(prev => [...prev, { role: 'feedback', content: feedbackText }]);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'Error al obtener feedback.');
        } finally {
            setLoading(false);
        }
    };
    
    const getNextQuestion = async () => {
        setLoading(true);
        setError('');
        setInterviewState('waiting_for_answer');
        try {
            const history = generateHistoryPrompt();
            const prompt = `
                ${history}

                ---
                Eres el entrevistador. Basado en la conversación hasta ahora, haz la siguiente pregunta. 
                Varía el tipo de pregunta. Puede ser técnica (sobre redes, sistemas operativos, hardware) o de comportamiento (ej. "describe una situación donde...").
                Asegúrate de que la pregunta sea apropiada para un rol de Soporte de TI de nivel de entrada.
                Solo proporciona la pregunta.
            `;
            const nextQuestion = await callGemini(prompt);
            setConversation(prev => [...prev, { role: 'interviewer', content: nextQuestion }]);
        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : 'Error al obtener la siguiente pregunta.');
            setInterviewState('idle');
        } finally {
            setLoading(false);
        }
    }
    
    const renderTurn = (turn: ConversationTurn, index: number) => {
        switch (turn.role) {
            case 'interviewer':
                return (
                    <div key={index} className="flex gap-3 my-4">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center text-white font-bold">IA</div>
                        <div className="bg-slate-100 p-4 rounded-lg rounded-tl-none">
                            <p className="text-gray-800">{turn.content}</p>
                        </div>
                    </div>
                );
            case 'applicant':
                 return (
                    <div key={index} className="flex gap-3 my-4 flex-row-reverse">
                        <div className="w-10 h-10 rounded-full bg-sky-500 flex-shrink-0 flex items-center justify-center text-white font-bold">TÚ</div>
                        <div className="bg-sky-50 p-4 rounded-lg rounded-tr-none">
                            <p className="text-gray-800 whitespace-pre-wrap font-sans">{turn.content}</p>
                        </div>
                    </div>
                );
            case 'feedback':
                return (
                     <div key={index} className="my-4 p-4 border-l-4 border-yellow-400 bg-yellow-50 rounded-r-lg">
                        <h4 className="font-bold text-yellow-800 flex items-center gap-2">
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                           Sugerencia de la IA
                        </h4>
                        <p className="text-yellow-700 mt-2 text-sm">{turn.content}</p>
                    </div>
                );
            default: return null;
        }
    }

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Simulador de Entrevistas con IA</h3>
             <p className="text-sm text-gray-500 mb-6">Practica para tu próxima entrevista de Soporte de TI y recibe feedback instantáneo.</p>
            
            {interviewState === 'idle' && (
                 <div className="text-center py-8">
                     <button onClick={startInterview} disabled={loading} className="px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors disabled:bg-gray-300">
                         {loading ? 'Iniciando...' : 'Comenzar Simulación'}
                     </button>
                 </div>
            )}
            
            {conversation.length > 0 && (
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar pr-4 mb-4 border-b border-gray-200 pb-4">
                    {conversation.map(renderTurn)}
                    <div ref={conversationEndRef} />
                </div>
            )}

            {loading && interviewState !== 'idle' && (
                 <div className="flex gap-3 my-4 items-center">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center text-white font-bold">IA</div>
                    <div className="bg-slate-100 p-4 rounded-lg rounded-tl-none">
                       <p className="text-gray-500 animate-pulse">Escribiendo...</p>
                    </div>
                </div>
            )}
            
             {interviewState === 'waiting_for_answer' && !loading && (
                <div>
                     <textarea
                        value={userAnswer}
                        onChange={e => setUserAnswer(e.target.value)}
                        placeholder="Escribe tu respuesta aquí..."
                        className="w-full bg-gray-50 border-gray-300 rounded-md p-3 text-gray-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                        rows={5}
                        disabled={loading}
                    />
                    <button onClick={submitAnswer} disabled={!userAnswer.trim() || loading} className="mt-3 w-full px-6 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors disabled:bg-gray-300">
                        Enviar Respuesta
                    </button>
                </div>
             )}
             
            {interviewState === 'answer_submitted' && !loading && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <button onClick={getFeedback} disabled={loading} className="px-6 py-2 bg-yellow-400 text-yellow-900 font-semibold rounded-lg hover:bg-yellow-500 transition-colors disabled:bg-gray-300">
                         Pedir Sugerencia
                     </button>
                     <button onClick={getNextQuestion} disabled={loading} className="px-6 py-2 bg-slate-700 text-white font-semibold rounded-lg hover:bg-slate-600 transition-colors disabled:bg-gray-300">
                         Siguiente Pregunta
                     </button>
                 </div>
            )}
            
            {error && <p className="mt-4 text-red-700 bg-red-100 p-3 rounded-md">{error}</p>}
        </div>
    );
};

export default AIInterviewSimulator;