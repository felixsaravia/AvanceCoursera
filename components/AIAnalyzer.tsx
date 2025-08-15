import React, { useState, useCallback } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Student } from '../types';
import { TOTAL_MAX_POINTS } from '../constants';

interface AIAnalyzerProps {
  students: Student[];
  expectedPointsToday: number;
}

const AnalysisRenderer: React.FC<{ text: string }> = ({ text }) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let listBuffer: React.ReactNode[] = [];
    let listType: 'ul' | 'ol' | null = null;

    const flushListBuffer = () => {
        if (listBuffer.length > 0) {
            if (listType === 'ul') {
                elements.push(<ul key={`list-${elements.length}`} className="space-y-2 list-disc list-outside pl-5 my-3">{listBuffer}</ul>);
            } else if (listType === 'ol') {
                elements.push(<ol key={`list-${elements.length}`} className="space-y-2 list-decimal list-outside pl-5 my-3">{listBuffer}</ol>);
            }
            listBuffer = [];
            listType = null;
        }
    };

    const parseLine = (line: string): React.ReactNode => {
        return line.split(/(\*\*.*?\*\*)/g).map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-semibold text-gray-700">{part.substring(2, part.length - 2)}</strong>;
            }
            return part;
        });
    };

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();

        if (trimmedLine === '') {
            if (listBuffer.length > 0) flushListBuffer();
            return;
        }
        
        if (trimmedLine.startsWith('* ')) {
            if (listType !== 'ul') {
                flushListBuffer();
                listType = 'ul';
            }
            listBuffer.push(<li key={index}>{parseLine(trimmedLine.substring(2))}</li>);
            return;
        }

        if (trimmedLine.match(/^\d+\. /)) {
            if (listType !== 'ol') {
                flushListBuffer();
                listType = 'ol';
            }
            listBuffer.push(<li key={index}>{parseLine(trimmedLine.replace(/^\d+\. /, ''))}</li>);
            return;
        }

        flushListBuffer();

        if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
            elements.push(<h4 key={index} className="font-bold text-gray-800 text-base mt-6 mb-2 first:mt-0">{trimmedLine.substring(2, trimmedLine.length - 2)}</h4>);
            return;
        }

        elements.push(<p key={index} className="text-gray-600 mb-2">{parseLine(line)}</p>);
    });

    flushListBuffer();

    return <div className="font-sans text-sm leading-relaxed">{elements}</div>;
};


const AIAnalyzer: React.FC<AIAnalyzerProps> = ({ students, expectedPointsToday }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string>('');
  const [error, setError] = useState<string>('');

  const generateAnalysis = useCallback(async () => {
    setLoading(true);
    setError('');
    setAnalysis('');

    if (!process.env.API_KEY) {
      setError('La API Key de Google Gemini no está configurada.');
      setLoading(false);
      return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const studentDataString = students
      .map(s => {
        const institution = s.institucion || 'No especificada';
        const department = s.departamento || 'No especificado';
        return `- ${s.name} (De: ${department}, Institución: ${institution}): ${s.totalPoints} puntos (Estado: ${s.status})`;
      })
      .join('\n');

    const prompt = `
      Hola, por favor analiza los siguientes datos de estudiantes para un curso de certificación de TI.
      El puntaje máximo total es ${TOTAL_MAX_POINTS}.
      El puntaje esperado a la fecha de hoy es ${expectedPointsToday.toFixed(0)}.

      Aquí está la lista de estudiantes, sus puntos totales, estado actual, departamento e institución:
      ${studentDataString}

      Basado en estos datos, por favor proporciona:
      1.  **Resumen General:** Un breve resumen del desempeño general del grupo en 2-3 frases. Considera si hay patrones por departamento o institución.
      2.  **Estudiantes Destacados:** Nombra a 2-3 estudiantes que lideran el grupo y explica brevemente por qué. Menciona su institución si parece relevante.
      3.  **Estudiantes que Necesitan Apoyo:** Identifica a los 2-3 estudiantes con el desempeño más bajo (estado 'Riesgo' o 'Atrasada') y sugiere cómo se les podría ayudar. Sé constructivo y positivo. Usa una lista con viñetas (*). Considera si pertenecen a la misma institución o departamento.
      4.  **Recomendaciones Clave para el Instructor:** Ofrece 2-3 recomendaciones accionables y específicas para el instructor para motivar al grupo y apoyar a los estudiantes con dificultades. Si observas patrones (ej. un grupo de una institución va muy bien o muy mal), sugiere acciones específicas. Usa una lista numerada.
    `;
    
    const systemInstruction = "Eres un asistente de coaching educativo experto en análisis de datos de estudiantes. Tu objetivo es ayudar a los instructores a comprender el progreso de su grupo y a tomar acciones efectivas. Proporciona un análisis conciso, positivo y orientado a la acción en español. Formatea tu respuesta claramente usando saltos de línea para separar las secciones, y usa la sintaxis solicitada (listas con '*' y numeradas) cuando sea apropiado.";

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
        },
      });
      const text = response.text;
      if (text && text.trim()) {
        setAnalysis(text.trim());
      } else {
        setError('La IA no generó una respuesta. Esto puede deberse a filtros de seguridad o a un problema temporal. Por favor, inténtelo de nuevo.');
      }
    } catch (e) {
      console.error(e);
      setError('Hubo un error al generar el análisis. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }

  }, [students, expectedPointsToday]);


  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-xl font-bold text-gray-900">Análisis con IA</h2>
            <p className="text-gray-500 mt-1">Obtén un resumen y recomendaciones sobre el progreso del grupo.</p>
        </div>
        <button
          onClick={generateAnalysis}
          disabled={loading || students.length === 0}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generando...
            </>
          ) : (
             <>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
                Generar Análisis
             </>
          )}
        </button>
      </div>

      {error && <p className="mt-4 text-red-700 bg-red-100 p-3 rounded-md">{error}</p>}
      
      {analysis && (
         <div className="mt-6 pt-4 border-t border-gray-200">
            <AnalysisRenderer text={analysis} />
         </div>
      )}
    </div>
  );
};

export default AIAnalyzer;