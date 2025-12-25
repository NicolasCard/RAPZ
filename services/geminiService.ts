
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface PricingAnalysis {
  fairPrice: number;
  justification: string;
  estimatedTime: number;
}

export async function analyzeFairPricing(
  distance: number,
  isUrgent: boolean,
  currentWeather: string = "bom"
): Promise<PricingAnalysis> {
  const prompt = `Analise um valor justo para uma entrega de motoboy com distância de ${distance}km. 
  Considere urgência: ${isUrgent ? 'Sim' : 'Não'}. 
  Clima atual: ${currentWeather}.
  Retorne um JSON com: fairPrice (número), justification (string curta em PT-BR), estimatedTime (número em minutos).`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            fairPrice: { type: Type.NUMBER },
            justification: { type: Type.STRING },
            estimatedTime: { type: Type.NUMBER }
          },
          required: ["fairPrice", "justification", "estimatedTime"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return result;
  } catch (error) {
    console.error("Gemini pricing error:", error);
    // Fallback simple calculation
    return {
      fairPrice: 5 + (distance * 2),
      justification: "Cálculo baseado em distância padrão (fallback).",
      estimatedTime: Math.round(10 + distance * 3)
    };
  }
}
