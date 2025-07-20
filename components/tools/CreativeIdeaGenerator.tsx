import React, { useState } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const commonSituations = [
    { id: 'too_much_work', text: 'Tengo demasiadas tareas esta semana' },
    { id: 'overwhelmed', text: 'Me siento abrumada y no sé por dónde empezar' },
    { id: 'stuck', text: 'Un tema es muy difícil y me siento estancada' },
    { id: 'imposter_syndrome', text: 'Siento que no soy lo suficientemente buena' }
];

const MotivationalBoostGenerator: React.FC = () => {
    const [motivation, setMotivation] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateMotivation = async (situation?: string) => {
        setLoading(true);
        setError('');
        setMotivation('');

        if (!process.env.API_KEY) {
            setError('La API Key de Google Gemini no está configurada.');
            setLoading(false);
            return;
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        let prompt;

        if (situation) {
            prompt = `
                Eres un coach motivacional y un experto en el campo de Soporte de TI. Tu audiencia son estudiantes que se preparan para la certificación de Google Coursera.

                Un estudiante se enfrenta a la siguiente situación: "${situation}".

                Genera un mensaje de apoyo y motivación corto (2-4 frases), empático y accionable en español. Ofrece una perspectiva positiva y un pequeño consejo práctico para superar este obstáculo específico. Conecta la solución con la mentalidad de crecimiento y la resiliencia necesaria en una carrera de TI.

                Ahora, genera un mensaje para ayudar con esta situación.
            `;
        } else {
             prompt = `
                Eres un coach motivacional y un experto en el campo de Soporte de TI. Tu audiencia son estudiantes que se preparan para la certificación de Google Coursera.
                Genera un mensaje de motivación corto (1-3 frases), poderoso e inspirador en español. El mensaje debe ser alentador y relevante para alguien que estudia tecnología, redes, ciberseguridad o sistemas operativos.
                Evita clichés genéricos. Conecta la motivación con el esfuerzo, la perseverancia y las recompensas de una carrera en TI.

                Ejemplos de tono:
                - "Cada línea de comando que aprendes es un paso más para convertirte en el arquitecto de la tecnología del futuro. ¡Tu esfuerzo de hoy construye tu carrera de mañana!"
                - "Recuerda que incluso el sistema más complejo está hecho de pequeñas partes que funcionan juntas. Domina cada tema, uno a la vez, y pronto dominarás el todo. ¡Tú puedes!"

                Ahora, genera un nuevo mensaje motivacional.
            `;
        }


        try {
            const result: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            setMotivation(result.text);
        } catch (err) {
            console.error(err);
            setError('Hubo un error al generar el mensaje. Por favor, inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700">
            <div className="text-center">
                <h3 className="text-lg font-bold text-white mb-2">Impulso Motivacional</h3>
                <p className="text-slate-400 mb-6">Un pequeño empujón para recargar tu energía y seguir adelante.</p>
            </div>
            
            <div className="space-y-4">
                 <div>
                    <p className="text-sm font-semibold text-slate-300 mb-3 text-center">Si te sientes así, pide un consejo:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {commonSituations.map(situation => (
                            <button
                                key={situation.id}
                                onClick={() => generateMotivation(situation.text)}
                                disabled={loading}
                                className="w-full text-left p-3 bg-slate-700/50 rounded-lg border border-slate-600 hover:bg-slate-700 hover:border-sky-600 transition-all text-sm text-slate-300 disabled:opacity-50"
                            >
                                {situation.text}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <hr className="flex-grow border-slate-700"/>
                    <span className="text-slate-500 text-xs font-bold">O</span>
                    <hr className="flex-grow border-slate-700"/>
                </div>

                <button
                    onClick={() => generateMotivation()}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
                >
                    {loading && !motivation ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Generando...
                        </>
                    ) : 'Recibir un impulso general'}
                </button>
            </div>


            {error && <p className="mt-4 text-red-400 bg-red-500/10 p-3 rounded-md">{error}</p>}

            {loading && !motivation && (
                 <div className="mt-6 pt-6 border-t border-slate-700 text-center">
                    <p className="text-slate-400 animate-pulse">La IA está preparando el consejo perfecto para ti...</p>
                 </div>
            )}
            
            {motivation && !loading && (
                <div className="mt-6 pt-6 border-t border-slate-700">
                    <blockquote className="text-lg text-slate-200 font-semibold border-l-4 border-sky-500 pl-4 text-left">
                        {motivation}
                    </blockquote>
                </div>
            )}
        </div>
    );
};

export default MotivationalBoostGenerator;