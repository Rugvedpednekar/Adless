import json
import re
from datetime import UTC, datetime
from pathlib import Path
from uuid import uuid4

from app.schemas.video import Creator, Video


BACKEND_ROOT = Path(__file__).resolve().parents[2]
VIDEO_CATALOG_PATH = BACKEND_ROOT / "data" / "video_catalog.json"
VIDEO_CATALOG_PATH.parent.mkdir(parents=True, exist_ok=True)


VIDEOS: tuple[Video, ...] = (
    Video(
        id="gaming-room-tour",
        title="2 Minute Ultimate Gaming Room Tour 2017",
        creator=Creator(
            id="priscilla-t",
            name="Priscilla T",
            avatar_url="/assets/avatar-3.svg",
        ),
        description=(
            "Priscilla T takes viewers through a complete gaming room setup "
            "and its equipment."
        ),
        video_url=(
            "/videos/2 Minute Ultimate Gaming Room Tour 2017 - "
            "Priscilla T (1080p).mp4"
        ),
        duration="2:35",
        category="Gaming",
        views="Local video",
        upload_date="Available now",
    ),
    Video(
        id="creative-studio-tour",
        title=(
            "Creative Studio Tour: Desk Setup, Home Office, and "
            "Journaling Nook"
        ),
        creator=Creator(
            id="nache-snow",
            name="Nache Snow",
            avatar_url="/assets/avatar-1.svg",
        ),
        description=(
            "Nache Snow shares a tour of a creative studio, desk setup, "
            "home office, and journaling nook."
        ),
        video_url=(
            "/videos/Creative Studio Tour Desk Setup, Home Office, and "
            "Journaling Nook - Nache Snow (1080p).mp4"
        ),
        duration="5:21",
        category="Lifestyle",
        views="Local video",
        upload_date="Available now",
    ),
    Video(
        id="friends-birthday-gift",
        title="Friends: Joey's Bad Birthday Gift (Season 4 Clip)",
        creator=Creator(
            id="tbs",
            name="TBS",
            avatar_url="/assets/avatar-4.svg",
            verified=True,
        ),
        description=(
            "A Friends season four clip featuring Joey's memorable "
            "birthday gift, presented by TBS."
        ),
        video_url=(
            "/videos/Friends Joey's Bad Birthday Gift (Season 4 Clip) "
            "TBS - TBS (1080p).mp4"
        ),
        duration="2:23",
        category="Entertainment",
        views="Local video",
        upload_date="Available now",
    ),
)


def list_videos() -> tuple[Video, ...]:
    return (*_load_uploaded_videos(), *VIDEOS)


def get_video(video_id: str) -> Video | None:
    return next((video for video in list_videos() if video.id == video_id), None)


def resolve_video_file(video: Video) -> Path | None:
    if video.video_url.startswith("/videos/"):
        frontend_public = BACKEND_ROOT.parent / "frontend" / "public"
        candidate = frontend_public / video.video_url.removeprefix("/")
    else:
        return None

    resolved = candidate.resolve()
    return resolved if resolved.is_file() else None


def _load_uploaded_videos() -> tuple[Video, ...]:
    if not VIDEO_CATALOG_PATH.exists():
        return ()

    try:
        catalog = json.loads(VIDEO_CATALOG_PATH.read_text(encoding="utf-8"))
        return tuple(Video.model_validate(item) for item in catalog)
    except (OSError, ValueError):
        return ()


def _write_uploaded_videos(videos: tuple[Video, ...]) -> None:
    VIDEO_CATALOG_PATH.write_text(
        json.dumps(
            [video.model_dump() for video in videos],
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )


def _slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return slug or "video"


def generate_video_id(title: str) -> str:
    return f"{_slugify(title)}-{uuid4().hex[:8]}"


def register_uploaded_video(
    *,
    video_id: str,
    title: str,
    creator_name: str,
    description: str,
    category: str,
    storage_path: str,
) -> Video:
    video = Video(
        id=video_id,
        title=title.strip(),
        creator=Creator(
            id=_slugify(creator_name),
            name=creator_name.strip(),
            avatar_url="/assets/avatar-2.svg",
        ),
        description=description.strip(),
        video_url=f"/api/videos/{video_id}/stream",
        duration="Uploaded video",
        category=category,
        views="0 views",
        upload_date=datetime.now(UTC).date().isoformat(),
        storage_path=storage_path,
    )

    uploaded_videos = _load_uploaded_videos()
    _write_uploaded_videos((video, *uploaded_videos))

    return video
