import json
from hashlib import sha256
from pathlib import Path

from google.auth.exceptions import DefaultCredentialsError
from google.genai import types
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.video_analysis import VideoAnalysis
from app.services.google_credentials import create_vertex_client


ANALYSIS_CACHE_DIRECTORY = Path(__file__).resolve().parents[2] / "cache" / "video_analysis"
ANALYSIS_CACHE_DIRECTORY.mkdir(parents=True, exist_ok=True)

ANALYSIS_PROMPT = """
You are the Adless scene intelligence engine. Analyze the complete supplied
video, including its visual content and audio, and return a concise overall
summary plus a chronological list of meaningful scenes.

For each scene, estimate start and end times in seconds, name the environment
and mood with short snake_case labels, list important visible objects, and
identify zero or more natural virtual product-placement opportunities.

An opportunity is valid only when a stable, visible physical surface has
unused space and a product could appear there at realistic scale without
changing the scene's meaning. Recommend generic product categories only, never
brands. Explain the visual and contextual reason and give calibrated confidence
from 0.0 to 1.0.

Use short snake_case object labels for placement surfaces, such as
coffee_table, desk, shelf, or kitchen_counter. Recommended categories must be
commercial product verticals that naturally fit the scene, such as snack,
beverage, coffee, book, home_decor, gaming_accessory, or electronics. A snack
or beverage may be appropriate on an unused coffee table in a calm living-room
scene, but recommend it only when it is genuinely natural.

Return no placement for any scene involving violence, medical emergencies,
serious injury, grief, highly emotional distress, sensitive political context,
or dangerous activity. Never place over or in front of faces, people,
subtitles, active hands, important foreground objects, or the focus of an
action. Reject visually unstable, obstructed, distracting, or physically
implausible surfaces. Do not force a placement into every scene.
""".strip()


class GeminiAnalysisError(RuntimeError):
    pass


class GeminiConfigurationError(GeminiAnalysisError):
    pass


class GeminiResponseValidationError(GeminiAnalysisError):
    pass


class GeminiVideoAnalyzer:
    def __init__(
        self,
        *,
        project: str = settings.GOOGLE_CLOUD_PROJECT,
        location: str = settings.GOOGLE_CLOUD_LOCATION,
        model: str = settings.GEMINI_MODEL,
        client=None,
    ):
        self.project = project
        self.location = location
        self.model = model
        self._client = client

    def analyze(self, *, video_id: str, gcs_uri: str, force: bool = False) -> VideoAnalysis:
        if not gcs_uri.startswith("gs://"):
            raise GeminiConfigurationError(
                "Gemini analysis requires a Google Cloud Storage video"
            )

        cache_path = ANALYSIS_CACHE_DIRECTORY / f"{self._fingerprint(video_id, gcs_uri)}.json"
        if not force:
            cached = self._read_cache(cache_path)
            if cached is not None:
                return cached

        try:
            client = self._client or create_vertex_client()
            response = client.models.generate_content(
                model=self.model,
                contents=[
                    types.Part.from_uri(file_uri=gcs_uri, mime_type="video/mp4"),
                    ANALYSIS_PROMPT,
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=VideoAnalysis,
                    temperature=0.1,
                ),
            )
            analysis = self._validate_response(response, video_id)
            cache_path.write_text(analysis.model_dump_json(indent=2), encoding="utf-8")
            return analysis
        except GeminiAnalysisError:
            raise
        except DefaultCredentialsError as exc:
            raise GeminiConfigurationError(
                "Google Application Default Credentials are not configured"
            ) from exc
        except Exception as exc:
            raise GeminiAnalysisError(f"Gemini video analysis failed: {exc}") from exc

    def get_cached_analysis(self, *, video_id: str, gcs_uri: str) -> VideoAnalysis | None:
        cache_path = ANALYSIS_CACHE_DIRECTORY / f"{self._fingerprint(video_id, gcs_uri)}.json"
        return self._read_cache(cache_path)

    def _validate_response(self, response, video_id: str) -> VideoAnalysis:
        try:
            if response.parsed is not None:
                analysis = VideoAnalysis.model_validate(response.parsed)
            else:
                analysis = VideoAnalysis.model_validate_json(response.text)
        except (ValidationError, ValueError, TypeError, json.JSONDecodeError) as exc:
            raise GeminiResponseValidationError(
                "Gemini returned invalid structured analysis"
            ) from exc
        return analysis.model_copy(update={"video_id": video_id})

    def _fingerprint(self, video_id: str, gcs_uri: str) -> str:
        source = f"scene-v2:{video_id}:{gcs_uri}:{self.model}"
        return sha256(source.encode("utf-8")).hexdigest()

    def _read_cache(self, cache_path: Path) -> VideoAnalysis | None:
        if not cache_path.exists():
            return None
        try:
            return VideoAnalysis.model_validate_json(cache_path.read_text(encoding="utf-8"))
        except (OSError, ValidationError, ValueError):
            return None
