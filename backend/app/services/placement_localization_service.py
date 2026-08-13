import json
from pathlib import Path

from google.auth.exceptions import DefaultCredentialsError
from google.genai import types
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.placement_preview import PlacementGeometry
from app.services.google_credentials import create_vertex_client


class PlacementLocalizationError(RuntimeError):
    pass


class PlacementLocalizationService:
    def __init__(self, *, client=None, model: str = settings.GEMINI_MODEL):
        self._client = client
        self.model = model

    def localize(self, *, frame_path: Path, surface: str, product_name: str) -> PlacementGeometry:
        prompt = f"""You are the Adless placement-localization vision agent. Inspect this real
representative video frame and locate an unoccupied portion of the {surface} where an upright
{product_name} snack bag can sit naturally. Return normalized top-left x/y and width/height
relative to the full frame. Keep the complete product inside the frame. It must rest on the
surface, not float, and must not overlap people, faces, hands, subtitles, the existing mug,
important objects, or the edge of the table. Choose a realistic scale. Rotation is degrees.
Coordinates must come only from this image. If space is limited, use a smaller realistic box.
"""
        try:
            client = self._client or create_vertex_client()
            response = client.models.generate_content(
                model=self.model,
                contents=[
                    types.Part.from_bytes(data=frame_path.read_bytes(), mime_type="image/jpeg"),
                    prompt,
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=PlacementGeometry,
                    temperature=0.1,
                ),
            )
            geometry = self._validate(response)
            if geometry.surface != surface:
                geometry = geometry.model_copy(update={"surface": surface})
            return geometry
        except PlacementLocalizationError:
            raise
        except DefaultCredentialsError as exc:
            raise PlacementLocalizationError("Google Application Default Credentials are not configured") from exc
        except Exception as exc:
            raise PlacementLocalizationError(f"Gemini placement localization failed: {exc}") from exc

    @staticmethod
    def _validate(response) -> PlacementGeometry:
        try:
            if response.parsed is not None:
                return PlacementGeometry.model_validate(response.parsed)
            return PlacementGeometry.model_validate_json(response.text)
        except (ValidationError, ValueError, TypeError, json.JSONDecodeError) as exc:
            raise PlacementLocalizationError("Gemini returned malformed placement geometry") from exc
