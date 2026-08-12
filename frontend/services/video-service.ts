import { PlacementOpportunity } from "@/types";

export interface GeminiAnalysisResponse {
  sceneType: string;
  mood: string;
  detectedObjects: string[];
  placementOpportunities: PlacementOpportunity[];
}

/**
 * Placeholder API service for sending video to Gemini AI analysis backend.
 * Future route: POST /api/videos/:videoId/analyze
 */
export async function analyzeVideoWithGemini(videoId: string): Promise<GeminiAnalysisResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const response = await fetch(`${apiUrl}/api/videos/${videoId}/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Gemini Analysis endpoint returned status ${response.status}`);
  }

  return response.json();
}
