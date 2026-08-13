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

export interface PlacementGeometry {
  surface: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  confidence: number;
  reason: string;
}

export interface PlacementPreview {
  videoId: string;
  placementIndex: number;
  campaignId: string;
  brand: string;
  productName: string;
  surface: string;
  startTime: number;
  endTime: number;
  placementConfidence: number;
  performanceScore: number;
  previewAvailable: boolean;
  previewUrl: string;
  geometry: PlacementGeometry;
}

export interface PlacementQAChecks {
  surfaceAlignment: boolean;
  realisticScale: boolean;
  realisticPosition: boolean;
  plausiblePerspective: boolean;
  believableContactShadow: boolean;
  floatingProduct: boolean;
  faceObstruction: boolean;
  subtitleObstruction: boolean;
  importantObjectObstruction: boolean;
  mugIntersection: boolean;
  productVisibility: boolean;
  excessiveProminence: boolean;
  contextuallyAppropriate: boolean;
  safeContext: boolean;
}

export interface PlacementQAResult {
  approved: boolean;
  qualityScore: number;
  checks: PlacementQAChecks;
  issues: string[];
  reason: string;
  representativeFrameTime: number;
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
