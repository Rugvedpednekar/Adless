export interface Creator {
  id: string;
  name: string;
  avatarUrl: string;
  verified?: boolean;
  subscribers?: string;
}

export interface PlacementOpportunity {
  surface: string;
  recommendedCategories: string[];
  confidence: number;
  reason: string;
}

export interface SceneAnalysis {
  startTime: number;
  endTime: number;
  environment: string;
  mood: string;
  objects: string[];
  placementOpportunities: PlacementOpportunity[];
}

export interface VideoAnalysis {
  videoId: string;
  summary: string;
  scenes: SceneAnalysis[];
}

export interface SelectedCampaign {
  campaignId: string;
  brand: string;
  productName: string;
  category: string;
  market: string;
  placementSurface: string;
  performanceScore: number;
  successRate: number;
  avgExposureSeconds: number;
  selectionConfidence: number;
  reason: string;
}

export interface AIAnalysisState {
  status: "not_analyzed" | "analyzing" | "completed" | "failed" | "ready";
  sceneType?: string | null;
  mood?: string | null;
  detectedObjects?: string[];
  recommendedSurface?: string | null;
  recommendedCategory?: string | null;
  confidence?: number | null;
  placementOpportunities?: PlacementOpportunity[];
}

export interface VideoSourceMetadata {
  creator: string;
  sourceUrl: string;
  license: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  videoSrc: string;
  thumbnailUrl: string;
  duration: string;
  category: NavCategory;
  views: string;
  uploadedAt: string;
  creator: Creator;
  placementConfidence: number;
  aiPlacementEnabled?: boolean;
  aiMatchScore?: number;
  status: "ready" | "processing" | "draft";
  aiAnalysis: AIAnalysisState;
  source: VideoSourceMetadata;
  storagePath?: string | null;
}

export type NavCategory = "All" | "Technology" | "Gaming" | "Entertainment" | "AI & Future" | "Lifestyle";
