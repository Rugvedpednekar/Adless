import json
import subprocess
from pathlib import Path
from tempfile import TemporaryDirectory

import cv2
import imageio_ffmpeg
import numpy as np

from app.schemas.campaign_selection import SelectedCampaign
from app.schemas.placement_preview import PlacementGeometry, ProductPlacementPreview
from app.services.placement_localization_service import PlacementLocalizationService
from app.services.product_catalog import ProductAsset
from app.services.storage_service import GCSStorageService


PREVIEW_CACHE_DIRECTORY = Path(__file__).resolve().parents[2] / "cache" / "placement_previews"
PREVIEW_CACHE_DIRECTORY.mkdir(parents=True, exist_ok=True)


class ProductPlacementError(RuntimeError):
    pass


class ProductPlacementService:
    def __init__(self, *, storage: GCSStorageService, localizer: PlacementLocalizationService):
        self.storage = storage
        self.localizer = localizer
        self.ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()

    def create_preview(
        self, *, video_id: str, placement_index: int, source_uri: str,
        start_time: float, end_time: float, surface: str,
        campaign: SelectedCampaign, product: ProductAsset, force: bool = False,
    ) -> ProductPlacementPreview:
        cached = None if force else get_cached_preview(video_id, placement_index)
        if cached is not None and cached.campaign_id == campaign.campaign_id:
            return cached
        if end_time <= start_time:
            raise ProductPlacementError("Placement interval must have a positive duration")

        with TemporaryDirectory(prefix="adless-preview-") as directory:
            work = Path(directory)
            source = work / "source.mp4"
            frame = work / "representative.jpg"
            overlay = work / "overlay.png"
            output = work / "preview.mp4"
            self.storage.download_to_file(storage_path=source_uri, destination=source)
            self._extract_frame(source, frame, (start_time + end_time) / 2)
            geometry = self.localizer.localize(
                frame_path=frame, surface=surface, product_name=product.product_name
            )
            self._build_overlay(frame, product.asset_path, overlay, geometry)
            self._render(source, overlay, output, start_time, end_time)
            object_name = f"previews/{video_id}/{placement_index}/preview.mp4"
            storage_path = self.storage.upload_file(
                source=output, object_name=object_name, content_type="video/mp4"
            )

        preview = ProductPlacementPreview(
            video_id=video_id, placement_index=placement_index,
            campaign_id=campaign.campaign_id, brand=campaign.brand,
            product_name=campaign.product_name, surface=surface,
            start_time=start_time, end_time=end_time,
            placement_confidence=geometry.confidence,
            performance_score=campaign.performance_score,
            preview_available=True,
            preview_url=f"/api/videos/{video_id}/placements/{placement_index}/preview/stream",
            storage_path=storage_path, geometry=geometry,
        )
        _cache_path(video_id, placement_index).write_text(preview.model_dump_json(indent=2), encoding="utf-8")
        return preview

    def _extract_frame(self, source: Path, frame: Path, timestamp: float) -> None:
        self._run([self.ffmpeg, "-y", "-ss", f"{timestamp:.3f}", "-i", str(source),
                   "-frames:v", "1", "-q:v", "2", str(frame)])

    @staticmethod
    def _build_overlay(frame_path: Path, asset_path: Path, output: Path, geometry: PlacementGeometry) -> None:
        frame = cv2.imread(str(frame_path), cv2.IMREAD_COLOR)
        asset = cv2.imread(str(asset_path), cv2.IMREAD_UNCHANGED)
        if frame is None or asset is None or asset.shape[2] != 4:
            raise ProductPlacementError("Unable to load representative frame or transparent product asset")
        frame_height, frame_width = frame.shape[:2]
        width, height = max(2, round(geometry.width * frame_width)), max(2, round(geometry.height * frame_height))
        asset = cv2.resize(asset, (width, height), interpolation=cv2.INTER_AREA)
        if geometry.rotation:
            matrix = cv2.getRotationMatrix2D((width / 2, height / 2), geometry.rotation, 1)
            asset = cv2.warpAffine(asset, matrix, (width, height), flags=cv2.INTER_LINEAR,
                                   borderMode=cv2.BORDER_CONSTANT, borderValue=(0, 0, 0, 0))
        x, y = round(geometry.x * frame_width), round(geometry.y * frame_height)
        canvas = np.zeros((frame_height, frame_width, 4), dtype=np.uint8)
        alpha = asset[:, :, 3]
        shadow_alpha = cv2.GaussianBlur(alpha, (0, 0), sigmaX=max(2, width * 0.035))
        shadow = np.zeros_like(asset)
        shadow[:, :, 3] = (shadow_alpha.astype(np.float32) * 0.28).astype(np.uint8)
        shadow_y = min(frame_height - height, y + max(2, round(height * 0.025)))
        canvas[shadow_y:shadow_y + height, x:x + width] = shadow
        region = canvas[y:y + height, x:x + width].astype(np.float32)
        foreground = asset.astype(np.float32)
        a = foreground[:, :, 3:4] / 255.0
        region[:, :, :3] = foreground[:, :, :3] * a + region[:, :, :3] * (1 - a)
        region[:, :, 3:4] = (a + region[:, :, 3:4] / 255.0 * (1 - a)) * 255
        canvas[y:y + height, x:x + width] = region.astype(np.uint8)
        if not cv2.imwrite(str(output), canvas):
            raise ProductPlacementError("Unable to write product overlay")

    def _render(self, source: Path, overlay: Path, output: Path, start: float, end: float) -> None:
        enable = f"between(t,{start:.3f},{end:.3f})"
        self._run([
            self.ffmpeg, "-y", "-i", str(source), "-i", str(overlay),
            "-filter_complex", f"[0:v][1:v]overlay=0:0:enable='{enable}':format=auto:eof_action=repeat[v]",
            "-map", "[v]", "-map", "0:a?", "-c:v", "libx264", "-preset", "medium",
            "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "copy", str(output),
        ])

    @staticmethod
    def _run(command: list[str]) -> None:
        try:
            result = subprocess.run(command, capture_output=True, text=True, timeout=180, check=False)
        except subprocess.TimeoutExpired as exc:
            raise ProductPlacementError("FFmpeg processing timed out") from exc
        if result.returncode != 0:
            raise ProductPlacementError(f"FFmpeg processing failed: {result.stderr[-1200:]}")


def get_cached_preview(video_id: str, placement_index: int) -> ProductPlacementPreview | None:
    path = _cache_path(video_id, placement_index)
    if not path.exists():
        return None
    try:
        return ProductPlacementPreview.model_validate_json(path.read_text(encoding="utf-8"))
    except (OSError, ValueError, json.JSONDecodeError):
        return None


def _cache_path(video_id: str, placement_index: int) -> Path:
    safe_id = "".join(character for character in video_id if character.isalnum() or character in "-_")
    return PREVIEW_CACHE_DIRECTORY / f"{safe_id}-{placement_index}.json"
