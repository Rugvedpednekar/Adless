"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

interface VideoThumbnailProps {
  thumbnailUrl?: string;
  videoSrc?: string;
  alt: string;
  fallbackSvg?: string;
  className?: string;
  priority?: boolean;
}

export const VideoThumbnail: React.FC<VideoThumbnailProps> = ({
  thumbnailUrl,
  videoSrc,
  alt,
  fallbackSvg = "/assets/thumb-ai-placement.svg",
  className = "object-cover",
  priority = false,
}) => {
  const [currentSrc, setCurrentSrc] = useState<string>(
    thumbnailUrl || fallbackSvg
  );
  const [isGeneratingFromVideo, setIsGeneratingFromVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Sync state if prop changes
  useEffect(() => {
    if (thumbnailUrl) {
      setCurrentSrc(thumbnailUrl);
    } else if (videoSrc) {
      generateThumbnailFromVideo(videoSrc);
    } else {
      setCurrentSrc(fallbackSvg);
    }
  }, [thumbnailUrl, videoSrc, fallbackSvg]);

  // Extract frame from video clip onto HTML5 canvas
  const generateThumbnailFromVideo = (src: string) => {
    if (isGeneratingFromVideo) return;
    setIsGeneratingFromVideo(true);

    const tempVideo = document.createElement("video");
    tempVideo.src = src;
    tempVideo.crossOrigin = "anonymous";
    tempVideo.preload = "metadata";
    tempVideo.muted = true;

    tempVideo.onloadeddata = () => {
      // Seek to 1 second or 10% of duration
      tempVideo.currentTime = Math.min(1.0, (tempVideo.duration || 10) * 0.1);
    };

    tempVideo.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = tempVideo.videoWidth || 640;
        canvas.height = tempVideo.videoHeight || 360;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL("image/jpeg");
          setCurrentSrc(dataUrl);
        }
      } catch {
        setCurrentSrc(fallbackSvg);
      } finally {
        tempVideo.remove();
      }
    };

    tempVideo.onerror = () => {
      setCurrentSrc(fallbackSvg);
      tempVideo.remove();
    };
  };

  // Handle main image error (e.g., missing .jpg file)
  const handleImageError = () => {
    if (videoSrc && currentSrc !== fallbackSvg && !isGeneratingFromVideo) {
      // If JPG image was missing, attempt video frame extraction!
      generateThumbnailFromVideo(videoSrc);
    } else {
      setCurrentSrc(fallbackSvg);
    }
  };

  return (
    <Image
      src={currentSrc}
      alt={alt}
      fill
      className={className}
      onError={handleImageError}
      unoptimized
      priority={priority}
    />
  );
};
