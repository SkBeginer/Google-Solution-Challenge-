import { GoogleGenAI, Type } from "@google/genai";

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set. Please add it to your Netlify environment variables.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

const damageAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    damagedParts: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of damaged parts identified (e.g. Bumper, Hood, Headlight)"
    },
    severity: {
      type: Type.STRING,
      enum: ["minor", "moderate", "severe", "total loss"],
      description: "Overall severity of the damage"
    },
    estimatedCost: {
      type: Type.NUMBER,
      description: "Rough estimated repair cost in INR"
    },
    fraudRisk: {
      type: Type.STRING,
      enum: ["low", "medium", "high"],
      description: "Risk of fraud based on image consistency and lighting"
    },
    confidence: {
      type: Type.NUMBER,
      description: "Confidence score of the analysis (0-100)"
    },
    findings: {
      type: Type.STRING,
      description: "Technical explanation of the damage found"
    },
    recommendation: {
      type: Type.STRING,
      description: "Short recommended next step for the insurer"
    }
  },
  required: ["damagedParts", "severity", "estimatedCost", "fraudRisk", "confidence", "findings", "recommendation"]
};

export async function analyzeVehicleDamage(imageB64: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `Analyze this vehicle damage image for an insurance claim. Perform a detailed audit.`
          },
          {
            inlineData: {
              data: imageB64,
              mimeType: "image/jpeg"
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: damageAnalysisSchema
    }
  });

  return JSON.parse(response.text);
}

export async function analyzeMultiImage(imagesB64: string[]) {
  const ai = getAI();
  const imageParts = imagesB64.map(image => ({
    inlineData: { data: image, mimeType: "image/jpeg" }
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `Analyze these multiple views of the same vehicle accident. Consolidate findings to avoid duplicate damage counts and provide a more accurate assessment. 
            Focus on merging findings from different angles into a single report.`
          },
          ...imageParts
        ]
      }
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: damageAnalysisSchema
    }
  });

  return JSON.parse(response.text);
}

export async function getVoiceAnalysis(transcript: string) {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Extract vehicle damage details from this transcript: "${transcript}". 
    Focus on parts mentioned, how it happened, and any severity indicators.
    Return a summarized report for the claim description.`
  });
  return response.text;
}
