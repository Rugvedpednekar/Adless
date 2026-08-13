from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

from app.api import videos as video_routes
from app.api.videos import (
    get_campaign_selector,
    get_clickhouse_mcp_service,
    get_gemini_analyzer,
)
from app.main import app
from app.schemas.campaign_selection import CampaignCandidate, SelectedCampaign
from app.schemas.video import Creator, Video
from app.schemas.video_analysis import PlacementOpportunity, SceneAnalysis, VideoAnalysis
from app.services.clickhouse_mcp_service import ClickHouseMCPError, NoCompatibleCampaignsError


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
        objects=["coffee_table"], placement_opportunities=[PlacementOpportunity(
            surface="coffee_table", recommended_categories=["snack", "beverage"],
            reason="Clear table", confidence=0.95,
        )],
    )],
)
CANDIDATE = CampaignCandidate(
    campaign_id="camp_001", brand="CrunchPop", product_name="CrunchPop Classic Chips",
    category="snack", impressions=12500, avg_exposure_seconds=6.8,
    success_rate=0.91, performance_score=8.8,
)
SELECTION = SelectedCampaign(
    campaign_id="camp_001", brand="CrunchPop", product_name="CrunchPop Classic Chips",
    category="snack", market="US", placement_surface="coffee_table",
    performance_score=8.8, success_rate=0.91, avg_exposure_seconds=6.8,
    selection_confidence=0.94, reason="Best compatible historical performance.",
)


@pytest.fixture(autouse=True)
def setup(monkeypatch):
    monkeypatch.setattr(video_routes, "get_video", lambda video_id: VIDEO if video_id == "demo" else None)
    app.dependency_overrides[get_gemini_analyzer] = lambda: SimpleNamespace(
        get_cached_analysis=lambda **kwargs: ANALYSIS
    )
    yield
    app.dependency_overrides.clear()


def test_campaign_selection_uses_analysis_context_and_defaults_to_us():
    class MCP:
        def query_campaigns(self, **kwargs):
            assert kwargs == {"market": "US", "environment": "living_room", "placement_surface": "coffee_table", "categories": ["snack", "beverage"]}
            return [CANDIDATE], "SELECT ..."
    class Selector:
        def select(self, **kwargs):
            assert kwargs["placement_confidence"] == 0.95
            assert kwargs["candidates"] == [CANDIDATE]
            return SELECTION
    app.dependency_overrides[get_clickhouse_mcp_service] = MCP
    app.dependency_overrides[get_campaign_selector] = Selector
    response = client.post("/api/videos/demo/placements/0/select-campaign", json={})
    assert response.status_code == 200
    assert response.json()["campaign_id"] == "camp_001"


def test_campaign_selection_missing_video_returns_404():
    response = client.post("/api/videos/missing/placements/0/select-campaign", json={})
    assert response.status_code == 404


def test_campaign_selection_missing_analysis_returns_409():
    app.dependency_overrides[get_gemini_analyzer] = lambda: SimpleNamespace(get_cached_analysis=lambda **kwargs: None)
    response = client.post("/api/videos/demo/placements/0/select-campaign", json={})
    assert response.status_code == 409


def test_campaign_selection_invalid_index_returns_404():
    response = client.post("/api/videos/demo/placements/4/select-campaign", json={})
    assert response.status_code == 404


@pytest.mark.parametrize("error,expected", [
    (NoCompatibleCampaignsError("No compatible campaigns were found"), 404),
    (ClickHouseMCPError("MCP failed"), 502),
])
def test_campaign_selection_mcp_failures(error, expected):
    class MCP:
        def query_campaigns(self, **kwargs):
            raise error
    app.dependency_overrides[get_clickhouse_mcp_service] = MCP
    response = client.post("/api/videos/demo/placements/0/select-campaign", json={})
    assert response.status_code == expected
