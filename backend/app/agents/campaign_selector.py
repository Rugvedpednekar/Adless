import json

from google.auth.exceptions import DefaultCredentialsError
from google.genai import types
from pydantic import ValidationError

from app.core.config import settings
from app.schemas.campaign_selection import CampaignCandidate, SelectedCampaign
from app.services.google_credentials import create_vertex_client


class CampaignSelectionError(RuntimeError):
    pass


class CampaignSelectionValidationError(CampaignSelectionError):
    pass


class CampaignSelector:
    def __init__(self, *, client=None, model: str = settings.GEMINI_MODEL):
        self.model = model
        self._client = client

    def select(
        self,
        *,
        video_id: str,
        environment: str,
        placement_surface: str,
        recommended_categories: list[str],
        placement_confidence: float,
        market: str,
        candidates: list[CampaignCandidate],
    ) -> SelectedCampaign:
        prompt = f"""You are the Adless campaign-selection agent. Select exactly one campaign
from the supplied ClickHouse candidates for this real placement opportunity.
Consider category compatibility, scene and surface compatibility, historical
performance_score, success_rate, avg_exposure_seconds, and placement confidence.
Never invent or alter campaign facts. Return concise structured reasoning.

Video ID: {video_id}
Market: {market}
Environment: {environment}
Placement surface: {placement_surface}
Recommended categories: {json.dumps(recommended_categories)}
Placement confidence: {placement_confidence}
ClickHouse candidates: {json.dumps([candidate.model_dump() for candidate in candidates])}
"""
        try:
            client = self._client or create_vertex_client()
            response = client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=SelectedCampaign,
                    temperature=0.1,
                ),
            )
            selection = self._validate(response)
            candidate = next((item for item in candidates if item.campaign_id == selection.campaign_id), None)
            if candidate is None:
                raise CampaignSelectionValidationError("Gemini selected an unknown campaign")
            return selection.model_copy(update={
                "brand": candidate.brand,
                "product_name": candidate.product_name,
                "category": candidate.category,
                "market": market,
                "placement_surface": placement_surface,
                "performance_score": candidate.performance_score,
                "success_rate": candidate.success_rate,
                "avg_exposure_seconds": candidate.avg_exposure_seconds,
            })
        except CampaignSelectionError:
            raise
        except DefaultCredentialsError as exc:
            raise CampaignSelectionError("Google Application Default Credentials are not configured") from exc
        except Exception as exc:
            raise CampaignSelectionError(f"Gemini campaign selection failed: {exc}") from exc

    def _validate(self, response) -> SelectedCampaign:
        try:
            if response.parsed is not None:
                return SelectedCampaign.model_validate(response.parsed)
            return SelectedCampaign.model_validate_json(response.text)
        except (ValidationError, ValueError, TypeError, json.JSONDecodeError) as exc:
            raise CampaignSelectionValidationError(
                "Gemini returned malformed campaign selection"
            ) from exc
