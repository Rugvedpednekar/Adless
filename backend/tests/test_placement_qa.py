from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.api import videos as video_routes
from app.api.videos import get_gemini_analyzer, get_placement_qa_agent
from app.agents.placement_qa_agent import PlacementQAAgent, PlacementQAError, PlacementQAValidationError
from app.main import app
from app.schemas.campaign_selection import SelectedCampaign
from app.schemas.placement_preview import PlacementGeometry, ProductPlacementPreview
from app.schemas.placement_qa import PlacementQAChecks, PlacementQAResult
from app.schemas.video import Creator, Video
from app.schemas.video_analysis import PlacementOpportunity, SceneAnalysis, VideoAnalysis


client = TestClient(app)
VIDEO = Video(
    id="demo", title="Demo", creator=Creator(id="c", name="Creator", avatar_url="/a.svg"),
    description="Demo", video_url="/api/videos/demo/stream", duration="0:05",
    category="Lifestyle", views="0", upload_date="2026-08-12",
    storage_path="gs://bucket/videos/demo/demo.mp4",
)
ANALYSIS = VideoAnalysis(
    video_id="demo", summary="Living room", scenes=[SceneAnalysis(
        start_time=0, end_time=5, environment="living_room", mood="calm",
        objects=["coffee_table", "mug"], placement_opportunities=[PlacementOpportunity(
            surface="coffee_table", recommended_categories=["snack", "beverage"],
            reason="Open table", confidence=0.95,
        )],
    )],
)
CAMPAIGN = SelectedCampaign(
    campaign_id="camp_001", brand="CrunchPop", product_name="CrunchPop Classic Chips",
    category="snack", market="US", placement_surface="coffee_table",
    performance_score=8.8, success_rate=0.91, avg_exposure_seconds=6.8,
    selection_confidence=0.95, reason="Best campaign",
)
PREVIEW = ProductPlacementPreview(
    video_id="demo", placement_index=0, campaign_id="camp_001", brand="CrunchPop",
    product_name="CrunchPop Classic Chips", surface="coffee_table", start_time=0,
    end_time=5, placement_confidence=0.9, performance_score=8.8,
    preview_available=True, preview_url="/api/videos/demo/placements/0/preview/stream",
    storage_path="gs://bucket/previews/demo/0/preview.mp4",
    geometry=PlacementGeometry(surface="coffee_table", x=0.3, y=0.5, width=0.2,
                               height=0.2, rotation=0, confidence=0.9, reason="Open area"),
)
CHECKS = PlacementQAChecks(
    surface_alignment=True, realistic_scale=True, realistic_position=True,
    plausible_perspective=True, believable_contact_shadow=True,
    floating_product=False, face_obstruction=False, subtitle_obstruction=False,
    important_object_obstruction=False, mug_intersection=False,
    product_visibility=True, excessive_prominence=False,
    contextually_appropriate=True, safe_context=True,
)
QA = PlacementQAResult(
    approved=True, quality_score=0.91, checks=CHECKS, issues=[],
    reason="Natural placement with no mug overlap.", representative_frame_time=2.5,
)


@pytest.fixture(autouse=True)
def setup(monkeypatch):
    monkeypatch.setattr(video_routes, "get_video", lambda video_id: VIDEO if video_id == "demo" else None)
    monkeypatch.setattr(video_routes, "get_cached_preview", lambda video_id, index: PREVIEW)
    monkeypatch.setattr(video_routes, "get_selected_campaign", lambda video_id, index: CAMPAIGN)
    app.dependency_overrides[get_gemini_analyzer] = lambda: SimpleNamespace(
        get_cached_analysis=lambda **kwargs: ANALYSIS
    )
    yield
    app.dependency_overrides.clear()


def test_qa_route_passes_real_preview_context_to_agent():
    class Agent:
        def review(self, **kwargs):
            assert kwargs["preview"] == PREVIEW
            assert kwargs["campaign"] == CAMPAIGN
            assert kwargs["environment"] == "living_room"
            assert kwargs["recommended_categories"] == ["snack", "beverage"]
            return QA
    app.dependency_overrides[get_placement_qa_agent] = Agent
    response = client.post("/api/videos/demo/placements/0/qa")
    assert response.status_code == 200
    assert response.json()["approved"] is True
    assert response.json()["quality_score"] == 0.91


def test_qa_requires_preview(monkeypatch):
    monkeypatch.setattr(video_routes, "get_cached_preview", lambda video_id, index: None)
    app.dependency_overrides[get_placement_qa_agent] = lambda: SimpleNamespace()
    response = client.post("/api/videos/demo/placements/0/qa")
    assert response.status_code == 409


def test_qa_rejects_invalid_placement_index():
    app.dependency_overrides[get_placement_qa_agent] = lambda: SimpleNamespace()
    response = client.post("/api/videos/demo/placements/3/qa")
    assert response.status_code == 404


def test_qa_gemini_failure_returns_502():
    class Agent:
        def review(self, **kwargs):
            raise PlacementQAError("Gemini QA failed")
    app.dependency_overrides[get_placement_qa_agent] = Agent
    response = client.post("/api/videos/demo/placements/0/qa")
    assert response.status_code == 502


def test_approved_schema_rejects_blocking_failure():
    invalid_checks = CHECKS.model_copy(update={"mug_intersection": True})
    with pytest.raises(ValidationError):
        PlacementQAResult(
            approved=True, quality_score=0.9, checks=invalid_checks, issues=["Mug overlap"],
            reason="Invalid approval", representative_frame_time=2.5,
        )


def test_malformed_gemini_qa_is_rejected():
    with pytest.raises(PlacementQAValidationError):
        PlacementQAAgent._validate(SimpleNamespace(parsed=None, text='{"approved": true}'))
