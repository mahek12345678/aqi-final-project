import { GoogleGenAI, Type } from "@google/genai";
import { PredictionResponse, ModelType } from "../types";

// NOTE: In a real production environment, this logic would reside in a Supabase Edge Function.
// We are simulating the "Edge Function" behavior here to make the app functional in the browser.

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const predictAQI = async (
  city: string,
  modelType: ModelType,
  inputs: { pm25: number; pm10: number; no2: number; co: number; so2: number; o3: number }
): Promise<PredictionResponse> => {
  
  try {
    const prompt = `
      Act as a highly accurate Statistical and Machine Learning Air Quality Forecasting Engine.
      
      Task: Predict the Air Quality Index (AQI) based on the provided pollutant concentrations.
      
      Context:
      - Location: ${city}, India
      - ML Model Used for Inference: ${modelType}
      - Pollutant Data:
        * PM2.5: ${inputs.pm25} µg/m³
        * PM10: ${inputs.pm10} µg/m³
        * NO2: ${inputs.no2} µg/m³
        * CO: ${inputs.co} mg/m³
        * SO2: ${inputs.so2} µg/m³
        * Ozone: ${inputs.o3} µg/m³

      Instructions:
      1. Calculate a realistic AQI based on Indian CPCB standards using the input data.
      2. Assign a category (Good, Moderate, Poor, Very Poor, Severe).
      3. Identify the top contributing pollutants.
      4. Provide brief scientific notes explaining the prediction and why the AQI is at this level.
      
      Return ONLY JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            predictedAQI: { type: Type.NUMBER },
            category: { type: Type.STRING, enum: ["Good", "Moderate", "Poor", "Very Poor", "Severe"] },
            contributors: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            notes: { type: Type.STRING }
          },
          required: ["predictedAQI", "category", "contributors", "notes"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
        throw new Error("No response from prediction service");
    }

    return JSON.parse(resultText) as PredictionResponse;

  } catch (error) {
    console.error("Prediction Service Error:", error);
    // Fallback mock response in case of API failure to keep UI working for demo
    return {
      predictedAQI: Math.round(inputs.pm25 * 2.5 + inputs.pm10 * 0.5),
      category: "Poor",
      contributors: ["PM2.5", "PM10"],
      notes: "Service unavailable. Estimated based on raw PM2.5 levels."
    };
  }
};