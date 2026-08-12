from types import SimpleNamespace
from pathlib import Path
import shutil
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient
from pydantic import ValidationError

from app.api import videos as video_routes
from app.api.videos import get_gemini_analyzer
from app.main import app
from app.schemas.video import Creator, Video
from app.schemas.video_analysis import PlacementOpportunity, SceneAnalysis, VideoAnalysis
from app.services.gemini_video_analyzer import (
    GeminiAnalysisError,
    GeminiResponseValidationError,
    GeminiVideoAnalyzer,
)


client = TestClient(app)

GCS_VIDEO = Video(
    id="uploaded-video",
    title="Uploaded Video",
    creator=Creator(id="creator", name="Creator", avatar_url="/avatar.svg"),
    description="An uploaded test video.",
    video_url="/api/videos/uploaded-video/stream",
    duration="Uploaded video",
    category="Lifestyle",
    views="0 views",
    upload_date="2026-08-12",
    storage_path="gs://test-bucket/videos/uploaded-video/original.mp4",
)

VALID_ANALYSIS = VideoAnalysis(
    video_id="uploaded-video",
    summary="A casual living-room conversation.",
    scenes=[
        SceneAnalysis(
            start_time=3.2,
            end_time=11.5,
            environment="living_room",
            mood="casual_positive",
            objects=["table", "sofa", "cup"],
            placement_opportunities=[
                PlacementOpportunity(
                    surface="table",
                    recommended_categories=["snack", "beverage"],
                    confidence=0.92,
                    reason="Unused tabletop space remains stable and visible.",
                )
            ],
        )
    ],
)


@pytest.fixture(autouse=True)
def clear_dependency_overrides():
    yield
    app.dependency_overrides.clear()


def test_unknown_video_analysis_returns_404():
    response = client.post("/api/videos/not-a-video/analyze")
    assert response.status_code == 404


def test_local_video_analysis_is_rejected():
    response = client.post("/api/videos/gaming-room-tour/analyze")
    assert response.status_code == 422
    assert "uploaded GCS videos only" in response.json()["detail"]


def test_valid_gcs_video_analysis_uses_service_mock(monkeypatch):
    monkeypatch.setattr(video_routes, "get_video", lambda video_id: GCS_VIDEO)

    class SuccessfulAnalyzer:
        def analyze(self, **kwargs):
            assert kwargs == {
                "video_id": "uploaded-video",
                "gcs_uri": GCS_VIDEO.storage_path,
                "force": True,
            }
            return VALID_ANALYSIS

    app.dependency_overrides[get_gemini_analyzer] = SuccessfulAnalyzer
    response = client.post("/api/videos/uploaded-video/analyze?force=true")
    assert response.status_code == 200
    assert VideoAnalysis.model_validate(response.json()) == VALID_ANALYSIS


def test_gemini_service_error_returns_502(monkeypatch):
    monkeypatch.setattr(video_routes, "get_video", lambda video_id: GCS_VIDEO)

    class FailingAnalyzer:
        def analyze(self, **kwargs):
            raise GeminiAnalysisError("Gemini request failed")

    app.dependency_overrides[get_gemini_analyzer] = FailingAnalyzer
    response = client.post("/api/videos/uploaded-video/analyze")
    assert response.status_code == 502
    assert response.json() == {"detail": "Gemini request failed"}


def test_vertex_client_receives_gcs_video_and_structured_schema(monkeypatch):
    cache_path = Path(__file__).resolve().parents[1] / ".test-uploads" / uuid4().hex
    cache_path.mkdir(parents=True)
    monkeypatch.setattr(
        "app.services.gemini_video_analyzer.ANALYSIS_CACHE_DIRECTORY", cache_path
    )
    captured = {}

    class FakeModels:
        def generate_content(self, **kwargs):
            captured.update(kwargs)
            return SimpleNamespace(parsed=VALID_ANALYSIS, text=None)

    analyzer = GeminiVideoAnalyzer(
        project="adless-ai-2026",
        location="global",
        model="gemini-2.5-flash",
        client=SimpleNamespace(models=FakeModels()),
    )
    result = analyzer.analyze(
        video_id="uploaded-video", gcs_uri=GCS_VIDEO.storage_path, force=True
    )

    assert result == VALID_ANALYSIS
    assert captured["model"] == "gemini-2.5-flash"
    assert captured["contents"][0].file_data.file_uri == GCS_VIDEO.storage_path
    assert captured["config"].response_mime_type == "application/json"
    assert captured["config"].response_schema is VideoAnalysis
    shutil.rmtree(cache_path, ignore_errors=True)


def test_invalid_gemini_structured_output_is_rejected_safely():
    analyzer = GeminiVideoAnalyzer(client=object())
    invalid_response = SimpleNamespace(
        parsed=None,
        text='{"video_id":"uploaded-video","summary":"test","scenes":[{"start_time":9,"end_time":2}]}',
    )
    with pytest.raises(GeminiResponseValidationError):
        analyzer._validate_response(invalid_response, "uploaded-video")


def test_analysis_schema_rejects_out_of_range_confidence():
    with pytest.raises(ValidationError):
        PlacementOpportunity(
            surface="desk",
            recommended_categories=["laptop"],
            confidence=1.5,
            reason="Visible surface",
        )
