import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const AIImageQuery: React.FC = () => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const openCamera = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsCameraOpen(true);
            setImageSrc(null);
            setResponse('');
            setError('');
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError("No se pudo acceder a la cámara. Asegúrate de haber dado permiso.");
        }
    }, []);

    const closeCamera = useCallback(() => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraOpen(false);
    }, []);
    
    const captureImage = useCallback(() => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const dataUrl = canvas.toDataURL('image/jpeg');
                setImageSrc(dataUrl);
            }
            closeCamera();
        }
    }, [closeCamera]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || !imageSrc) return;

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
            const base64Data = imageSrc.split(',')[1];
            
            const imagePart = {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Data,
                },
            };
            
            const textPart = {
                text: `Eres un asistente experto en Soporte de TI. Analiza la siguiente imagen y responde la pregunta del usuario. Sé claro y conciso. La pregunta es: "${prompt}"`,
            };

            const result: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
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
        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700 space-y-4">
            <h3 className="text-lg font-bold text-white">Análisis de Imagen con IA</h3>

            {!isCameraOpen && !imageSrc && (
                <button onClick={openCamera} className="w-full flex items-center justify-center gap-3 p-4 bg-slate-700 rounded-lg hover:bg-slate-600 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                    Abrir Cámara para Tomar Foto
                </button>
            )}

            {isCameraOpen && (
                <div className="space-y-4">
                    <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="flex gap-4">
                        <button onClick={captureImage} className="w-full py-2 px-4 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500">Capturar</button>
                        <button onClick={closeCamera} className="w-full py-2 px-4 bg-slate-600 text-slate-200 font-semibold rounded-lg hover:bg-slate-500">Cancelar</button>
                    </div>
                </div>
            )}
            
            {imageSrc && (
                <div className="space-y-4">
                    <img src={imageSrc} alt="Captura del usuario" className="w-full max-w-sm mx-auto rounded-lg" />
                    <button onClick={() => { setImageSrc(null); setResponse(''); }} className="w-full text-sm text-sky-400 hover:text-sky-300">Tomar otra foto</button>
                    
                    <form onSubmit={handleSubmit}>
                        <textarea
                            value={prompt}
                            onChange={e => setPrompt(e.target.value)}
                            placeholder="Ej: ¿Qué tipo de puerto es este? ¿Para qué sirve?"
                            className="w-full bg-slate-700 border-slate-600 rounded-md p-3 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
                            rows={3}
                            disabled={loading}
                        />
                         <button type="submit" disabled={loading || !prompt.trim()} className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed">
                             {loading ? 'Analizando...' : 'Preguntar a la IA'}
                         </button>
                    </form>
                </div>
            )}
            
            {error && <p className="text-red-400 bg-red-500/10 p-3 rounded-md">{error}</p>}

            {response && (
                <div className="pt-4 border-t border-slate-700">
                    <h4 className="font-semibold text-white mb-2">Respuesta:</h4>
                    <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm leading-relaxed">{response}</pre>
                </div>
            )}
        </div>
    );
};

export default AIImageQuery;