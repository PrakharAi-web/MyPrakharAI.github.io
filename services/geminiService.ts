
import { GoogleGenAI } from "@google/genai";
import { GenerationConfig } from "../types";

// Corrected: Guideline states to use process.env.API_KEY directly when initializing.
export const generateImage = async (config: GenerationConfig): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const modelName = 'gemini-2.5-flash-image';
  
  const contents: any = {
    parts: []
  };

  if (config.base64Image && config.mimeType) {
    contents.parts.push({
      inlineData: {
        data: config.base64Image,
        mimeType: config.mimeType
      }
    });
    contents.parts.push({
      text: config.prompt || "Edit this image based on the context."
    });
  } else {
    contents.parts.push({
      text: config.prompt
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        imageConfig: {
          aspectRatio: config.aspectRatio
        }
      }
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No image was generated.");
    }

    const parts = response.candidates[0].content.parts;
    for (const part of parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data found in response.");
  } catch (error) {
    console.error("Gemini Image Generation Error:", error);
    throw error;
  }
};
