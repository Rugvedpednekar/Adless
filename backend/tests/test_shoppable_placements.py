from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.api import analytics as analytics_routes
from app.main import app
from app.schemas.campaign_selection import SelectedCampaign
from app.schemas.video_analysis import PlacementOpportunity, SceneAnalysis, VideoAnalysis
from app.services import placement_manifest_service as manifests
from app.services.placement_analytics_service import PlacementAnalyticsError
from app.services.product_catalog import get_product_by_id, list_products


def analysis(start=0.0, end=6.0):
    return VideoAnalysis(video_id="video", summary="Room", scenes=[SceneAnalysis(
        start_time=start, end_time=end, environment="living_room", mood="positive", objects=["table"],
        placement_opportunities=[PlacementOpportunity(surface="coffee_table", recommended_categories=["snack"], reason="Open surface", confidence=.91)],
    )])


def campaign():
    return SelectedCampaign(campaign_id="camp_001", brand="CrunchPop", product_name="CrunchPop Classic Chips", category="snack", market="US", placement_surface="coffee_table", performance_score=8.8, success_rate=.86, avg_exposure_seconds=5.2, selection_confidence=.94, reason="Best match")


def test_catalog_has_ten_fictional_products():
    assert len(list_products()) == 10
    assert get_product_by_id("crunchpop-classic").campaign_id == "camp_001"


def test_manifest_includes_only_approved_preview_and_uses_timing(monkeypatch):
    monkeypatch.setattr(manifests, "is_approved", lambda *_: True)
    monkeypatch.setattr(manifests, "get_selected_campaign", lambda *_: campaign())
    monkeypatch.setattr(manifests, "get_cached_preview", lambda *_: SimpleNamespace(preview_available=True))
    result = manifests.build_manifest("video", analysis())
    assert len(result.placements) == 1
    assert result.placements[0].cta.show_at == 1.5
    assert result.placements[0].cta.hide_at == 5.0
    assert result.playback_url.endswith("/0/preview/stream")


def test_manifest_excludes_rejected_and_too_short_placements(monkeypatch):
    monkeypatch.setattr(manifests, "get_selected_campaign", lambda *_: campaign())
    monkeypatch.setattr(manifests, "get_cached_preview", lambda *_: SimpleNamespace(preview_available=True))
    monkeypatch.setattr(manifests, "is_approved", lambda *_: False)
    assert manifests.build_manifest("video", analysis()).placements == []
    monkeypatch.setattr(manifests, "is_approved", lambda *_: True)
    assert manifests.build_manifest("video", analysis(end=3.9)).placements == []


class FailingAnalytics:
    def record(self, _event):
        raise PlacementAnalyticsError("offline")
    def summary(self):
        raise PlacementAnalyticsError("offline")


def test_analytics_rejects_unknown_event_and_failure_is_non_fatal():
    app.dependency_overrides[analytics_routes.get_service] = lambda: FailingAnalytics()
    client = TestClient(app)
    base = {"video_id":"v","placement_id":"p","campaign_id":"c","product_id":"x","viewer_session_id":"session-123","playback_second":2,"placement_start":0,"placement_end":6,"cta_show":1.5,"cta_hide":5,"surface":"table","scene_environment":"room","market":"US"}
    invalid = client.post("/api/analytics/placement-events", json={**base, "event_type":"unknown"})
    accepted = client.post("/api/analytics/placement-events", json={**base, "event_type":"cta_click"})
    app.dependency_overrides.clear()
    assert invalid.status_code == 422
    assert accepted.status_code == 200 and accepted.json() == {"accepted": False}
