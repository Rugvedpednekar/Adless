from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.api import videos as video_routes
from app.api.videos import (
    get_gemini_analyzer,
    get_product_placement_service,
)
from app.main import app
from app.schemas.campaign_selection import SelectedCampaign
from app.schemas.placement_preview import PlacementGeometry, ProductPlacementPreview
from app.schemas.video import Creator, Video
from app.schemas.video_analysis import PlacementOpportunity, SceneAnalysis, VideoAnalysis
from app.services.product_placement_service import ProductPlacementError


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
            surface="coffee_table", recommended_categories=["snack"],
            reason="Clear table", confidence=0.95,
        )],
    )],
)
CAMPAIGN = SelectedCampaign(
    campaign_id="camp_001", brand="CrunchPop", product_name="CrunchPop Classic Chips",
    category="snack", market="US", placement_surface="coffee_table",
    performance_score=8.8, success_rate=0.91, avg_exposure_seconds=6.8,
    selection_confidence=0.95, reason="Best campaign",
)
GEOMETRY = PlacementGeometry(
    surface="coffee_table", x=0.3, y=0.6, width=0.15, height=0.25,
    rotation=0, confidence=0.94, reason="Clear space away from the mug",
)
PREVIEW = ProductPlacementPreview(
    video_id="demo", placement_index=0, campaign_id="camp_001", brand="CrunchPop",
    product_name="CrunchPop Classic Chips", surface="coffee_table", start_time=0,
    end_time=5, placement_confidence=0.94, performance_score=8.8,
    preview_available=True, preview_url="/api/videos/demo/placements/0/preview/stream",
    storage_path="gs://bucket/previews/demo/0/preview.mp4", geometry=GEOMETRY,
)


@pytest.fixture(autouse=True)
def setup(monkeypatch):
    monkeypatch.setattr(video_routes, "get_video", lambda video_id: VIDEO if video_id == "demo" else None)
    monkeypatch.setattr(video_routes, "get_selected_campaign", lambda video_id, index: CAMPAIGN)
    app.dependency_overrides[get_gemini_analyzer] = lambda: SimpleNamespace(
        get_cached_analysis=lambda **kwargs: ANALYSIS
    )
    yield
    app.dependency_overrides.clear()


def test_preview_uses_selected_campaign_and_placement_context():
    class PlacementService:
        def create_preview(self, **kwargs):
            assert kwargs["campaign"] == CAMPAIGN
            assert kwargs["surface"] == "coffee_table"
            assert kwargs["start_time"] == 0
            assert kwargs["end_time"] == 5
            return PREVIEW
    app.dependency_overrides[get_product_placement_service] = PlacementService
    response = client.post("/api/videos/demo/placements/0/preview")
    assert response.status_code == 200
    assert response.json()["preview_available"] is True
    assert response.json()["geometry"]["confidence"] == 0.94


def test_preview_requires_selected_campaign(monkeypatch):
    monkeypatch.setattr(video_routes, "get_selected_campaign", lambda video_id, index: None)
    app.dependency_overrides[get_product_placement_service] = lambda: SimpleNamespace()
    response = client.post("/api/videos/demo/placements/0/preview")
    assert response.status_code == 409


def test_preview_rejects_invalid_placement_index():
    app.dependency_overrides[get_product_placement_service] = lambda: SimpleNamespace()
    response = client.post("/api/videos/demo/placements/2/preview")
    assert response.status_code == 404


def test_preview_renderer_failure_is_safe():
    class PlacementService:
        def create_preview(self, **kwargs):
            raise ProductPlacementError("FFmpeg failed")
    app.dependency_overrides[get_product_placement_service] = PlacementService
    response = client.post("/api/videos/demo/placements/0/preview")
    assert response.status_code == 502


def test_geometry_must_stay_inside_frame():
    with pytest.raises(ValidationError):
        PlacementGeometry(
            surface="coffee_table", x=0.9, y=0.6, width=0.2, height=0.2,
            rotation=0, confidence=0.9, reason="Invalid overflow",
        )

