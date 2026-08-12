import { Video } from "@/types";

export const DEMO_VIDEOS: Video[] = [
  {
    id: "gaming-room-tour",
    title: "2 Minute Ultimate Gaming Room Tour 2017",
    description:
      "Priscilla T takes viewers through a complete gaming room setup and its equipment.",
    videoSrc:
      "/videos/2 Minute Ultimate Gaming Room Tour 2017 - Priscilla T (1080p).mp4",
    thumbnailUrl: "",
    duration: "2:00",
    category: "Gaming",
    views: "Local video",
    uploadedAt: "Available now",
    placementConfidence: 95,
    aiPlacementEnabled: true,
    aiMatchScore: 95,
    status: "ready",
    creator: {
      id: "priscilla-t",
      name: "Priscilla T",
      avatarUrl: "/assets/avatar-3.svg",
      verified: false,
    },
    aiAnalysis: {
      status: "not_analyzed",
      sceneType: null,
      recommendedSurface: null,
      recommendedCategory: null,
      confidence: null,
    },
    source: {
      creator: "Priscilla T",
      sourceUrl: "",
      license: "Local demo video",
    },
  },
  {
    id: "creative-studio-tour",
    title: "Creative Studio Tour: Desk Setup, Home Office, and Journaling Nook",
    description:
      "Nache Snow shares a tour of a creative studio, desk setup, home office, and journaling nook.",
    videoSrc:
      "/videos/Creative Studio Tour Desk Setup, Home Office, and Journaling Nook - Nache Snow (1080p).mp4",
    thumbnailUrl: "",
    duration: "Studio tour",
    category: "Lifestyle",
    views: "Local video",
    uploadedAt: "Available now",
    placementConfidence: 94,
    aiPlacementEnabled: true,
    aiMatchScore: 94,
    status: "ready",
    creator: {
      id: "nache-snow",
      name: "Nache Snow",
      avatarUrl: "/assets/avatar-1.svg",
      verified: false,
    },
    aiAnalysis: {
      status: "not_analyzed",
      sceneType: null,
      recommendedSurface: null,
      recommendedCategory: null,
      confidence: null,
    },
    source: {
      creator: "Nache Snow",
      sourceUrl: "",
      license: "Local demo video",
    },
  },
  {
    id: "friends-birthday-gift",
    title: "Friends: Joey's Bad Birthday Gift (Season 4 Clip)",
    description:
      "A Friends season four clip featuring Joey's memorable birthday gift, presented by TBS.",
    videoSrc:
      "/videos/Friends Joey's Bad Birthday Gift (Season 4 Clip) TBS - TBS (1080p).mp4",
    thumbnailUrl: "",
    duration: "TV clip",
    category: "Entertainment",
    views: "Local video",
    uploadedAt: "Available now",
    placementConfidence: 92,
    aiPlacementEnabled: true,
    aiMatchScore: 92,
    status: "ready",
    creator: {
      id: "tbs",
      name: "TBS",
      avatarUrl: "/assets/avatar-4.svg",
      verified: true,
    },
    aiAnalysis: {
      status: "not_analyzed",
      sceneType: null,
      recommendedSurface: null,
      recommendedCategory: null,
      confidence: null,
    },
    source: {
      creator: "TBS",
      sourceUrl: "",
      license: "Local demo video",
    },
  },
];

export function getDemoVideoById(id: string): Video | undefined {
  return DEMO_VIDEOS.find((video) => video.id === id);
}
