import shutil
from pathlib import Path
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.api import videos as video_routes
from app.api.videos import get_storage_service
from app.main import app
from app.services import video_catalog
from app.services.storage_service import StoredMedia, StorageOperationError


client = TestClient(app)


EXPECTED_IDS = {
    "gaming-room-tour",
    "creative-studio-tour",
    "friends-birthday-gift",
}


@pytest.fixture(autouse=True)
def isolated_upload_catalog(monkeypatch):
    catalog_directory = (
        Path(__file__).resolve().parents[1]
        / ".test-uploads"
        / uuid4().hex
    )
    catalog_directory.mkdir(parents=True)
    monkeypatch.setattr(
        video_catalog,
        "VIDEO_CATALOG_PATH",
        catalog_directory / "catalog.json",
    )
    yield
    app.dependency_overrides.clear()
    shutil.rmtree(catalog_directory, ignore_errors=True)


def test_list_videos_returns_only_local_catalog():
    response = client.get("/api/videos")

    assert response.status_code == 200
    videos = response.json()
    assert len(videos) == 3
    assert {video["id"] for video in videos} == EXPECTED_IDS
    assert all(video["video_url"].startswith("/videos/") for video in videos)


def test_get_video_by_id():
    response = client.get("/api/videos/creative-studio-tour")

    assert response.status_code == 200
    video = response.json()
    assert video["id"] == "creative-studio-tour"
    assert video["creator"]["name"] == "Nache Snow"
    assert video["duration"] == "5:21"


def test_get_unknown_video_returns_404():
    response = client.get("/api/videos/not-a-video")

    assert response.status_code == 404
    assert response.json() == {"detail": "Video not found"}


def test_upload_video_adds_it_to_catalog():
    class FakeStorage:
        def upload_video(self, **kwargs):
            assert kwargs["object_name"].startswith("videos/uploaded-test-clip-")
            assert kwargs["object_name"].endswith("/test.mp4")
            assert kwargs["content_type"] == "video/mp4"
            assert kwargs["file_object"].read() == b"small-mp4-test"
            return f"gs://test-bucket/{kwargs['object_name']}"

        def delete_object(self, storage_path):
            raise AssertionError("Successful upload should not be deleted")

    app.dependency_overrides[get_storage_service] = FakeStorage
    response = client.post(
        "/api/videos/upload",
        data={
            "title": "Uploaded Test Clip",
            "creator": "Test Creator",
            "description": "A local upload workflow test.",
            "category": "Technology",
        },
        files={"file": ("test.mp4", b"small-mp4-test", "video/mp4")},
    )

    assert response.status_code == 201
    uploaded = response.json()
    assert uploaded["title"] == "Uploaded Test Clip"
    assert uploaded["video_url"].endswith("/stream")
    assert uploaded["storage_path"].startswith("gs://test-bucket/videos/")
    assert uploaded["storage_path"].endswith("/test.mp4")

    detail_response = client.get(f"/api/videos/{uploaded['id']}")
    assert detail_response.status_code == 200
    assert detail_response.json()["creator"]["name"] == "Test Creator"

    catalog_response = client.get("/api/videos")
    assert len(catalog_response.json()) == 4


def test_upload_rejects_non_mp4_files():
    app.dependency_overrides[get_storage_service] = lambda: object()
    response = client.post(
        "/api/videos/upload",
        data={
            "title": "Invalid Upload",
            "creator": "Test Creator",
            "description": "Not a video.",
            "category": "Technology",
        },
        files={"file": ("notes.txt", b"not-video", "text/plain")},
    )

    assert response.status_code == 415
    assert response.json() == {"detail": "Only MP4 video files are supported"}


def test_uploaded_video_stream_supports_byte_ranges():
    class FakeStorage:
        def upload_video(self, **kwargs):
            return f"gs://test-bucket/{kwargs['object_name']}"

        def delete_object(self, storage_path):
            pass

        def download_range(self, **kwargs):
            assert kwargs["start"] == 0
            assert kwargs["end"] == 3
            return StoredMedia(
                data=b"test",
                content_type="video/mp4",
                total_size=10,
                start=0,
                end=3,
            )

    fake_storage = FakeStorage()
    app.dependency_overrides[get_storage_service] = lambda: fake_storage
    upload_response = client.post(
        "/api/videos/upload",
        data={
            "title": "Stream Test",
            "creator": "Test Creator",
            "description": "Streaming test.",
            "category": "Technology",
        },
        files={"file": ("test.mp4", b"test-video", "video/mp4")},
    )
    video_id = upload_response.json()["id"]

    response = client.get(
        f"/api/videos/{video_id}/stream",
        headers={"Range": "bytes=0-3"},
    )

    assert response.status_code == 206
    assert response.content == b"test"
    assert response.headers["content-range"] == "bytes 0-3/10"
    assert response.headers["accept-ranges"] == "bytes"


def test_gcs_upload_failure_does_not_add_catalog_entry():
    class FailingStorage:
        def upload_video(self, **kwargs):
            raise StorageOperationError("Cloud Storage upload failed")

    app.dependency_overrides[get_storage_service] = FailingStorage
    response = client.post(
        "/api/videos/upload",
        data={
            "title": "Failed Upload",
            "creator": "Test Creator",
            "description": "Should not be cataloged.",
            "category": "Technology",
        },
        files={"file": ("test.mp4", b"test-video", "video/mp4")},
    )

    assert response.status_code == 502
    assert len(client.get("/api/videos").json()) == 3


def test_upload_without_gcs_bucket_returns_503(monkeypatch):
    def missing_bucket():
        from app.services.storage_service import StorageConfigurationError

        raise StorageConfigurationError("GCS_BUCKET is not configured")

    monkeypatch.setattr(video_routes, "GCSStorageService", missing_bucket)
    response = client.post(
        "/api/videos/upload",
        data={
            "title": "Unconfigured Upload",
            "creator": "Test Creator",
            "description": "Missing bucket.",
            "category": "Technology",
        },
        files={"file": ("test.mp4", b"test-video", "video/mp4")},
    )

    assert response.status_code == 503
    assert response.json() == {"detail": "GCS_BUCKET is not configured"}
