import React, { useState } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const AIQuickQuestion: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) return;

        setLoading(true);
        setError('');
        setResponse('');

        if (!process.env.API_KEY) {
            setError('La API Key de Google Gemini no está configurada.');
            setLoading(false);
            return;
        }

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        try {
            const result: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Eres un asistente experto en Soporte de TI. Responde la siguiente pregunta de forma concisa y clara en español. La pregunta es: "${prompt}"`,
            });
            setResponse(result.text);
        } catch (err) {
            console.error(err);
            setError('Hubo un error al generar la respuesta. Por favor, inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Consulta Rápida con IA</h3>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Ej: ¿Qué es una dirección IP estática?"
                    className="w-full bg-gray-50 border-gray-300 rounded-md p-3 text-gray-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    rows={4}
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Generando...
                        </>
                    ) : 'Obtener Respuesta'}
                </button>
            </form>

            {error && <p className="mt-4 text-red-700 bg-red-100 p-3 rounded-md">{error}</p>}

            {response && (
                <div className="mt-6 pt-4 border-t border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-2">Respuesta:</h4>
                    <pre className="text-gray-600 whitespace-pre-wrap font-sans text-sm leading-relaxed">{response}</pre>
                </div>
            )}
        </div>
    );
};

export default AIQuickQuestion;