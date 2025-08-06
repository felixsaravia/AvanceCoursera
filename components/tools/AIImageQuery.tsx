import React, { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Function to convert a file to a base64 string
const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                // Remove the data:image/...;base64, prefix
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error("Error reading file."));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

const AIImageQuery: React.FC = () => {
    const [image, setImage] = useState<File | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImage(file);
            setImageUrl(URL.createObjectURL(file));
            setResponse('');
            setError('');
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const file = event.dataTransfer.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setImage(file);
            setImageUrl(URL.createObjectURL(file));
            setResponse('');
            setError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim() || !image) {
            setError('Por favor, sube una imagen y escribe una pregunta.');
            return;
        }

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
            const imagePart = await fileToGenerativePart(image);
            const textPart = { text: prompt };

            const result: GenerateContentResponse = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [imagePart, textPart] },
            });
            const text = result.text;
            if (text && text.trim()) {
                setResponse(text.trim());
            } else {
                setError('La IA no pudo procesar la imagen o la pregunta. Inténtalo de nuevo.');
            }

        } catch (err) {
            console.error(err);
            setError('Hubo un error al procesar la imagen. Por favor, inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };
    
    const removeImage = () => {
        setImage(null);
        if(imageUrl) {
            URL.revokeObjectURL(imageUrl);
        }
        setImageUrl(null);
        if(fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Consulta con Imagen</h3>
            <p className="text-sm text-gray-500 mb-4">Sube una imagen y hazle una pregunta a la IA. Útil para identificar hardware, interpretar capturas de pantalla, etc.</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                {!imageUrl ? (
                    <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-sky-500 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                    >
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                            ref={fileInputRef}
                        />
                         <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-gray-400 mb-2"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                        <p className="text-gray-500">Arrastra una imagen aquí o haz clic para seleccionar</p>
                    </div>
                ) : (
                    <div className="relative">
                        <img src={imageUrl} alt="Preview" className="w-full max-h-64 object-contain rounded-lg bg-gray-100" />
                        <button 
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/75 transition-colors"
                            aria-label="Quitar imagen"
                        >
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                        </button>
                    </div>
                )}
                
                <textarea
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    placeholder="Ej: ¿Qué componente de PC es este y para qué sirve?"
                    className="w-full bg-gray-50 border-gray-300 rounded-md p-3 text-gray-900 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    rows={3}
                    disabled={loading || !image}
                />
                <button
                    type="submit"
                    disabled={loading || !prompt.trim() || !image}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            Analizando...
                        </>
                    ) : 'Preguntar a la IA'}
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

export default AIImageQuery;