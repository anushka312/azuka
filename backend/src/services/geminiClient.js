import { GoogleGenAI } from "@google/genai"; // New SDK import
import dotenv from "dotenv";
dotenv.config();

// The client now uses a configuration object
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY.trim() // Force trim to avoid hidden spaces
});

export async function callGemini(prompt, imageBase64 = null) {
  // Use 'gemini-3-flash' for the best speed/intelligence ratio in 2026
  const modelId = "gemini-2.5-flash-lite"; 

  const config = {
    model: modelId,
    contents: []
  };

  if (imageBase64) {
    config.contents = [
      {
        parts: [
          { text: prompt },
          { inlineData: { data: imageBase64, mimeType: "image/jpeg" } }
        ]
      }
    ];
  } else {
    config.contents = prompt;
  }

  try {
    const response = await ai.models.generateContent(config);
    return response.text; // The .text property is now direct
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw error;
  }
}