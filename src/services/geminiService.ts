import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function identifyWaste(base64Image: string) {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image.split(",")[1] || base64Image,
              },
            },
            {
              text: "Identify the type of waste in this image. Categorize it as one of: Plastic, Organic, Paper, Metal, Glass, or Other. Provide a short description of how to recycle it, its environmental impact, and the recommended delivery/disposal method (e.g., Curbside Pickup, Local Drop-off Center, Special Collection). Return the result in JSON format with keys: 'type', 'howToRecycle', 'impact', 'deliveryMethod', and 'points' (assign points: Plastic: 10, Paper: 8, Metal: 12, Organic: 6, Glass: 9, Other: 5).",
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    if (error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED') {
      throw new Error("Quota exceeded. Please set your own Gemini API key in Profile > Gemini API Settings to continue.");
    }
    console.error("Error identifying waste:", error);
    throw error;
  }
}

export async function findNearbyBanks(lat?: number, lng?: number) {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Find and list 5 nearby trash banks, recycling centers, or waste collection points. Include their names, addresses, and a brief description of what they accept.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: (lat && lng) ? { latitude: lat, longitude: lng } : undefined
          }
        }
      }
    });

    // Extract grounding chunks for URLs
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const banks = chunks?.map((chunk: any) => ({
      name: chunk.maps?.title || "Recycling Center",
      address: chunk.maps?.address || "Nearby",
      url: chunk.maps?.uri,
    })) || [];

    return {
      text: response.text,
      banks: banks
    };
  } catch (error: any) {
    if (error?.message?.includes('429') || error?.status === 'RESOURCE_EXHAUSTED') {
      throw new Error("Quota exceeded. Please set your own Gemini API key in Profile > Gemini API Settings to continue.");
    }
    console.error("Error finding nearby banks:", error);
    throw error;
  }
}
