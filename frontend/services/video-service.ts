import { ManifestPlacement, NavCategory, PlacementEventType, PlacementManifest, PlacementPreview, PlacementQAResult, SelectedCampaign, Video, VideoAnalysis } from "@/types";

interface ApiCreator {
  id: string;
  name: string;
  avatar_url: string;
  verified: boolean;
}

interface ApiVideo {
  id: string;
  title: string;
  creator: ApiCreator;
  description: string;
  video_url: string;
  duration: string;
  category: Exclude<NavCategory, "All">;
  views: string;
  upload_date: string;
  storage_path?: string | null;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL ??
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:8000");

function toVideo(video: ApiVideo): Video {
  const videoSrc = video.video_url.startsWith("/api/")
    ? `${apiUrl}${video.video_url}`
    : video.video_url;

  return {
    id: video.id,
    title: video.title,
    description: video.description,
    videoSrc,
    thumbnailUrl: "",
    duration: video.duration,
    category: video.category,
    views: video.views,
    uploadedAt: video.upload_date,
    creator: {
      id: video.creator.id,
      name: video.creator.name,
      avatarUrl: video.creator.avatar_url,
      verified: video.creator.verified,
    },
    placementConfidence: 95,
    aiPlacementEnabled: false,
    status: "ready",
    aiAnalysis: { status: "not_analyzed" },
    source: {
      creator: video.creator.name,
      sourceUrl: "",
      license: "Local development video",
    },
    storagePath: video.storage_path,
  };
}

export interface UploadVideoInput {
  file: File;
  title: string;
  creator: string;
  description: string;
  category: Exclude<NavCategory, "All">;
}

export function uploadVideo(
  input: UploadVideoInput,
  onProgress: (progress: number) => void
): Promise<Video> {
  const formData = new FormData();
  formData.append("file", input.file);
  formData.append("title", input.title);
  formData.append("creator", input.creator);
  formData.append("description", input.description);
  formData.append("category", input.category);

  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open("POST", `${apiUrl}/api/videos/upload`);

    request.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });

    request.addEventListener("load", () => {
      if (request.status === 201) {
        resolve(toVideo(JSON.parse(request.responseText) as ApiVideo));
        return;
      }

      let message = `Upload failed with status ${request.status}`;
      try {
        message = JSON.parse(request.responseText).detail || message;
      } catch {
        // Keep the status-based error when the response is not JSON.
      }
      reject(new Error(message));
    });

    request.addEventListener("error", () => {
      reject(new Error("Unable to reach the video upload service."));
    });

    request.send(formData);
  });
}

async function requestVideoApi<T>(path: string): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`);
  if (!response.ok) {
    throw new Error(`Video API returned status ${response.status}`);
  }
  return response.json();
}

export async function getVideos(): Promise<Video[]> {
  const videos = await requestVideoApi<ApiVideo[]>("/api/videos");
  return videos.map(toVideo);
}

export async function getVideo(videoId: string): Promise<Video> {
  const video = await requestVideoApi<ApiVideo>(
    `/api/videos/${encodeURIComponent(videoId)}`
  );
  return toVideo(video);
}

interface ApiPlacementOpportunity {
  surface: string;
  recommended_categories: string[];
  confidence: number;
  reason: string;
}

interface ApiSceneAnalysis {
  start_time: number;
  end_time: number;
  environment: string;
  mood: string;
  objects: string[];
  placement_opportunities: ApiPlacementOpportunity[];
}

interface ApiVideoAnalysis {
  video_id: string;
  summary: string;
  scenes: ApiSceneAnalysis[];
}

export async function analyzeVideoWithGemini(
  videoId: string,
  force = false
): Promise<VideoAnalysis> {
  const forceQuery = force ? "?force=true" : "";
  const response = await fetch(`${apiUrl}/api/videos/${videoId}/analyze${forceQuery}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let message = `Gemini analysis failed with status ${response.status}`;
    try {
      const errorBody = await response.json();
      message = errorBody.detail || message;
    } catch {
      // Keep the status-based message if the response is not JSON.
    }
    throw new Error(message);
  }

  const analysis = (await response.json()) as ApiVideoAnalysis;
  return {
    videoId: analysis.video_id,
    summary: analysis.summary,
    scenes: analysis.scenes.map((scene) => ({
      startTime: scene.start_time,
      endTime: scene.end_time,
      environment: scene.environment,
      mood: scene.mood,
      objects: scene.objects,
      placementOpportunities: scene.placement_opportunities.map((item) => ({
        surface: item.surface,
        recommendedCategories: item.recommended_categories,
        confidence: item.confidence,
        reason: item.reason,
      })),
    })),
  };
}

interface ApiSelectedCampaign {
  campaign_id: string;
  brand: string;
  product_name: string;
  category: string;
  market: string;
  placement_surface: string;
  performance_score: number;
  success_rate: number;
  avg_exposure_seconds: number;
  selection_confidence: number;
  reason: string;
}

export async function selectBestCampaign(
  videoId: string,
  placementIndex: number,
  market = "US"
): Promise<SelectedCampaign> {
  const response = await fetch(
    `${apiUrl}/api/videos/${encodeURIComponent(videoId)}/placements/${placementIndex}/select-campaign`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ market }),
    }
  );
  if (!response.ok) {
    let message = `Campaign selection failed with status ${response.status}`;
    try {
      message = (await response.json()).detail || message;
    } catch {}
    throw new Error(message);
  }
  const result = (await response.json()) as ApiSelectedCampaign;
  return {
    campaignId: result.campaign_id,
    brand: result.brand,
    productName: result.product_name,
    category: result.category,
    market: result.market,
    placementSurface: result.placement_surface,
    performanceScore: result.performance_score,
    successRate: result.success_rate,
    avgExposureSeconds: result.avg_exposure_seconds,
    selectionConfidence: result.selection_confidence,
    reason: result.reason,
  };
}

interface ApiPlacementPreview {
  video_id: string;
  placement_index: number;
  campaign_id: string;
  brand: string;
  product_name: string;
  surface: string;
  start_time: number;
  end_time: number;
  placement_confidence: number;
  performance_score: number;
  preview_available: boolean;
  preview_url: string;
  geometry: {
    surface: string;
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    confidence: number;
    reason: string;
  };
}

export async function createPlacementPreview(
  videoId: string,
  placementIndex: number,
  force = false
): Promise<PlacementPreview> {
  const response = await fetch(
    `${apiUrl}/api/videos/${encodeURIComponent(videoId)}/placements/${placementIndex}/preview${force ? "?force=true" : ""}`,
    { method: "POST" }
  );
  if (!response.ok) {
    let message = `Preview rendering failed with status ${response.status}`;
    try {
      message = (await response.json()).detail || message;
    } catch {}
    throw new Error(message);
  }
  const result = (await response.json()) as ApiPlacementPreview;
  return {
    videoId: result.video_id,
    placementIndex: result.placement_index,
    campaignId: result.campaign_id,
    brand: result.brand,
    productName: result.product_name,
    surface: result.surface,
    startTime: result.start_time,
    endTime: result.end_time,
    placementConfidence: result.placement_confidence,
    performanceScore: result.performance_score,
    previewAvailable: result.preview_available,
    previewUrl: `${apiUrl}${result.preview_url}`,
    geometry: result.geometry,
  };
}

interface ApiPlacementQAResult {
  approved: boolean;
  quality_score: number;
  checks: {
    surface_alignment: boolean;
    realistic_scale: boolean;
    realistic_position: boolean;
    plausible_perspective: boolean;
    believable_contact_shadow: boolean;
    floating_product: boolean;
    face_obstruction: boolean;
    subtitle_obstruction: boolean;
    important_object_obstruction: boolean;
    mug_intersection: boolean;
    product_visibility: boolean;
    excessive_prominence: boolean;
    contextually_appropriate: boolean;
    safe_context: boolean;
  };
  issues: string[];
  reason: string;
  representative_frame_time: number;
}

export async function runPlacementQA(
  videoId: string,
  placementIndex: number
): Promise<PlacementQAResult> {
  const response = await fetch(
    `${apiUrl}/api/videos/${encodeURIComponent(videoId)}/placements/${placementIndex}/qa`,
    { method: "POST" }
  );
  if (!response.ok) {
    let message = `AI quality check failed with status ${response.status}`;
    try {
      message = (await response.json()).detail || message;
    } catch {}
    throw new Error(message);
  }
  const result = (await response.json()) as ApiPlacementQAResult;
  return {
    approved: result.approved,
    qualityScore: result.quality_score,
    checks: {
      surfaceAlignment: result.checks.surface_alignment,
      realisticScale: result.checks.realistic_scale,
      realisticPosition: result.checks.realistic_position,
      plausiblePerspective: result.checks.plausible_perspective,
      believableContactShadow: result.checks.believable_contact_shadow,
      floatingProduct: result.checks.floating_product,
      faceObstruction: result.checks.face_obstruction,
      subtitleObstruction: result.checks.subtitle_obstruction,
      importantObjectObstruction: result.checks.important_object_obstruction,
      mugIntersection: result.checks.mug_intersection,
      productVisibility: result.checks.product_visibility,
      excessiveProminence: result.checks.excessive_prominence,
      contextuallyAppropriate: result.checks.contextually_appropriate,
      safeContext: result.checks.safe_context,
    },
    issues: result.issues,
    reason: result.reason,
    representativeFrameTime: result.representative_frame_time,
  };
}

export async function saveCreatorDecision(videoId:string,placementIndex:number,approved:boolean){const response=await fetch(`${apiUrl}/api/videos/${encodeURIComponent(videoId)}/placements/${placementIndex}/creator-decision`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({approved})});if(!response.ok)throw new Error("Creator decision could not be saved");return response.json()}
export async function getPlacementManifest(videoId:string):Promise<PlacementManifest>{const response=await fetch(`${apiUrl}/api/videos/${encodeURIComponent(videoId)}/placement-manifest`);if(!response.ok)throw new Error("Placement manifest unavailable");const data=await response.json();return{videoId:data.video_id,playbackUrl:data.playback_url?`${apiUrl}${data.playback_url}`:null,placements:data.placements.map((p:any)=>({placementId:p.placement_id,placementIndex:p.placement_index,campaignId:p.campaign_id,productId:p.product_id,startTime:p.start_time,endTime:p.end_time,surface:p.surface,sceneEnvironment:p.scene_environment,placementConfidence:p.placement_confidence,performanceScore:p.performance_score,product:{productId:p.product.product_id,brand:p.product.brand,name:p.product.name,category:p.product.category,price:p.product.price,imageUrl:p.product.image_url,landingPath:p.product.landing_path},cta:{label:p.cta.label,showAt:p.cta.show_at,hideAt:p.cta.hide_at,position:p.cta.position}}))}}
export async function recordPlacementEvent(eventType:PlacementEventType,videoId:string,placement:ManifestPlacement,viewerSessionId:string,playbackSecond:number){try{await fetch(`${apiUrl}/api/analytics/placement-events`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({event_type:eventType,video_id:videoId,placement_id:placement.placementId,campaign_id:placement.campaignId,product_id:placement.productId,viewer_session_id:viewerSessionId,playback_second:playbackSecond,placement_start:placement.startTime,placement_end:placement.endTime,cta_show:placement.cta.showAt,cta_hide:placement.cta.hideAt,surface:placement.surface,scene_environment:placement.sceneEnvironment,market:"US"})})}catch{/* Analytics never interrupts playback. */}}
export async function getProduct(productId:string):Promise<import("@/types").ProductDetail>{const response=await fetch(`${apiUrl}/api/products/${encodeURIComponent(productId)}`);if(!response.ok)throw new Error("Product not found");const p=await response.json();return{productId:p.product_id,brand:p.brand,name:p.product_name,category:p.category,price:p.price,imageUrl:p.thumbnail,landingPath:p.landing_path,description:p.description,compatibleSurfaces:p.compatible_surfaces,compatibleEnvironments:p.compatible_environments}}
export async function getPlacementAnalyticsSummary():Promise<import("@/types").PlacementAnalyticsSummary>{const response=await fetch(`${apiUrl}/api/analytics/placement-events/summary`);if(!response.ok)throw new Error("Placement metrics unavailable");const s=await response.json();return{placementImpressions:s.placement_impressions,ctaImpressions:s.cta_impressions,ctaClicks:s.cta_clicks,ctaDismissals:s.cta_dismissals,exposureCompletions:s.exposure_completions,ctaCtr:s.cta_ctr}}
