import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const searchRealWorldFacilities = async (query: string, type: 'hospital' | 'blood_bank') => {
  try {
    const prompt = `Find real-world ${type === 'hospital' ? 'hospitals and diagnostic centers' : 'blood donation centers and blood banks'} in Bangladesh related to "${query}". 
    Provide a list of genuine facilities with their names, addresses, and contact numbers if available. 
    Format the response as a JSON array of objects with keys: name, address, contact, website.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      },
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error('Error in smart search:', error);
    return [];
  }
};
