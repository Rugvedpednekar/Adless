import json
import subprocess
from pathlib import Path
from tempfile import TemporaryDirectory

import imageio_ffmpeg
from google import genai
from google.auth.exceptions import DefaultCredentialsError
from google.genai import types
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.campaign_selection import SelectedCampaign
from app.schemas.placement_preview import ProductPlacementPreview
from app.schemas.placement_qa import PlacementQAResult
from app.services.storage_service import GCSStorageService, StorageOperationError


class PlacementQAError(RuntimeError):
    pass


class PlacementQAValidationError(PlacementQAError):
    pass


class PlacementQAAgent:
    def __init__(
        self,
        *,
        storage: GCSStorageService,
        client=None,
        model: str = settings.GEMINI_MODEL,
    ):
        self.storage = storage
        self._client = client
        self.model = model
        self.ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()

    def review(
        self,
        *,
        preview: ProductPlacementPreview,
        campaign: SelectedCampaign,
        environment: str,
        recommended_categories: list[str],
    ) -> PlacementQAResult:
        frame_time = (preview.start_time + preview.end_time) / 2
        with TemporaryDirectory(prefix="adless-qa-") as directory:
            work = Path(directory)
            preview_file = work / "preview.mp4"
            frame_file = work / "qa-frame.jpg"
            try:
                self.storage.download_to_file(
                    storage_path=preview.storage_path,
                    destination=preview_file,
                )
                self._extract_frame(preview_file, frame_file, frame_time)
                result = self._analyze_frame(
                    frame_file=frame_file,
                    preview=preview,
                    campaign=campaign,
                    environment=environment,
                    recommended_categories=recommended_categories,
                )
                return result.model_copy(update={"representative_frame_time": frame_time})
            except PlacementQAError:
                raise
            except StorageOperationError as exc:
                raise PlacementQAError(str(exc)) from exc

    def _extract_frame(self, source: Path, destination: Path, timestamp: float) -> None:
        try:
            result = subprocess.run(
                [
                    self.ffmpeg, "-y", "-ss", f"{timestamp:.3f}", "-i", str(source),
                    "-frames:v", "1", "-q:v", "2", "-update", "1", str(destination),
                ],
                capture_output=True,
                text=True,
                timeout=60,
                check=False,
            )
        except subprocess.TimeoutExpired as exc:
            raise PlacementQAError("QA frame extraction timed out") from exc
        if result.returncode != 0 or not destination.is_file():
            raise PlacementQAError(f"QA frame extraction failed: {result.stderr[-800:]}")

    def _analyze_frame(
        self,
        *,
        frame_file: Path,
        preview: ProductPlacementPreview,
        campaign: SelectedCampaign,
        environment: str,
        recommended_categories: list[str],
    ) -> PlacementQAResult:
        prompt = f"""You are the Adless visual product-placement QA agent. Inspect the actual
rendered preview frame supplied with this request. Judge visible evidence in the image, not only
the metadata. The fictional product is {campaign.brand} {campaign.product_name}, category
{campaign.category}. Intended environment: {environment}. Intended surface: {preview.surface}.
Recommended categories: {json.dumps(recommended_categories)}.

Evaluate every structured check carefully: whether the product is truly on the intended surface;
scale, position, perspective, floating, and contact-shadow realism; visibility and excessive
prominence; overlap with any face, subtitle/text, important scene object, or the existing mug;
category/context fit; and advertising safety. Obstruction/intersection/floating/prominence fields
are true only when the problem exists. Boolean positive-quality fields are true only when the
quality is acceptable. List concise visible issues. Approve only when no blocking safety,
obstruction, alignment, visibility, scale, or context problem exists. Do not force approval.
The representative frame timestamp field may be zero in your response because the backend will
replace it with the exact extracted timestamp.
"""
        try:
            client = self._client or genai.Client(
                vertexai=True,
                project=settings.GOOGLE_CLOUD_PROJECT,
                location=settings.GOOGLE_CLOUD_LOCATION,
                http_options=types.HttpOptions(api_version="v1"),
            )
            response = client.models.generate_content(
                model=self.model,
                contents=[
                    types.Part.from_bytes(data=frame_file.read_bytes(), mime_type="image/jpeg"),
                    prompt,
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=PlacementQAResult,
                    temperature=0.1,
                ),
            )
            return self._validate(response)
        except PlacementQAError:
            raise
        except DefaultCredentialsError as exc:
            raise PlacementQAError("Google Application Default Credentials are not configured") from exc
        except Exception as exc:
            raise PlacementQAError(f"Gemini placement QA failed: {exc}") from exc

    @staticmethod
    def _validate(response) -> PlacementQAResult:
        try:
            if response.parsed is not None:
                return PlacementQAResult.model_validate(response.parsed)
            return PlacementQAResult.model_validate_json(response.text)
        except (ValidationError, ValueError, TypeError, json.JSONDecodeError) as exc:
            raise PlacementQAValidationError("Gemini returned malformed placement QA") from exc

