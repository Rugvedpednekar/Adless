import asyncio
from typing import Annotated

from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    Header,
    HTTPException,
    Query,
    UploadFile,
    status,
)
from fastapi.responses import Response

from app.schemas.video import Video
from app.schemas.video_analysis import VideoAnalysis
from app.schemas.campaign_selection import CampaignSelectionRequest, SelectedCampaign
from app.agents.campaign_selector import (
    CampaignSelectionError,
    CampaignSelectionValidationError,
    CampaignSelector,
)
from app.services.clickhouse_mcp_service import (
    ClickHouseMCPError,
    ClickHouseMCPService,
    NoCompatibleCampaignsError,
)
from app.services.gemini_video_analyzer import (
    GeminiAnalysisError,
    GeminiConfigurationError,
    GeminiResponseValidationError,
    GeminiVideoAnalyzer,
)
from app.services.video_catalog import (
    generate_video_id,
    get_video,
    list_videos,
    register_uploaded_video,
)
from app.services.storage_service import (
    GCSStorageService,
    StorageConfigurationError,
    StorageOperationError,
    build_video_object_name,
)


router = APIRouter(prefix="/videos", tags=["Videos"])


def get_gemini_analyzer() -> GeminiVideoAnalyzer:
    return GeminiVideoAnalyzer()


def get_clickhouse_mcp_service() -> ClickHouseMCPService:
    return ClickHouseMCPService()


def get_campaign_selector() -> CampaignSelector:
    return CampaignSelector()


def get_storage_service() -> GCSStorageService:
    try:
        return GCSStorageService()
    except StorageConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc


@router.get("", response_model=list[Video])
async def read_videos() -> tuple[Video, ...]:
    return list_videos()


@router.post("/upload", response_model=Video, status_code=status.HTTP_201_CREATED)
async def upload_video(
    storage_service: Annotated[GCSStorageService, Depends(get_storage_service)],
    file: UploadFile = File(...),
    title: str = Form(..., min_length=1, max_length=200),
    creator: str = Form(..., min_length=1, max_length=100),
    description: str = Form(..., max_length=2000),
    category: str = Form(..., min_length=1, max_length=50),
) -> Video:
    filename = file.filename or ""
    if file.content_type != "video/mp4" or not filename.lower().endswith(".mp4"):
        await file.close()
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only MP4 video files are supported",
        )

    video_id = generate_video_id(title)
    object_name = build_video_object_name(video_id, filename)
    storage_path = None
    try:
        storage_path = await asyncio.to_thread(
            storage_service.upload_video,
            file_object=file.file,
            object_name=object_name,
            content_type="video/mp4",
        )
        return register_uploaded_video(
            video_id=video_id,
            title=title,
            creator_name=creator,
            description=description,
            category=category,
            storage_path=storage_path,
        )
    except StorageOperationError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc
    except Exception:
        if storage_path is not None:
            try:
                await asyncio.to_thread(storage_service.delete_object, storage_path)
            except StorageOperationError:
                pass
        raise
    finally:
        await file.close()


@router.get("/{video_id}/stream")
async def stream_video(
    video_id: str,
    storage_service: Annotated[GCSStorageService, Depends(get_storage_service)],
    range_header: Annotated[str | None, Header(alias="Range")] = None,
) -> Response:
    video = get_video(video_id)
    if video is None:
        raise HTTPException(status_code=404, detail="Video not found")
    if not video.storage_path:
        raise HTTPException(status_code=404, detail="Video is not stored in Cloud Storage")

    try:
        start, end = _parse_range_header(range_header)
        media = await asyncio.to_thread(
            storage_service.download_range,
            storage_path=video.storage_path,
            start=start,
            end=end,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_416_REQUESTED_RANGE_NOT_SATISFIABLE,
            detail=str(exc),
        ) from exc
    except StorageOperationError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc

    headers = {
        "Accept-Ranges": "bytes",
        "Content-Length": str(len(media.data)),
    }
    response_status = status.HTTP_200_OK
    if range_header:
        response_status = status.HTTP_206_PARTIAL_CONTENT
        headers["Content-Range"] = (
            f"bytes {media.start}-{media.end}/{media.total_size}"
        )

    return Response(
        content=media.data,
        status_code=response_status,
        media_type=media.content_type,
        headers=headers,
    )


def _parse_range_header(range_header: str | None) -> tuple[int, int | None]:
    if not range_header:
        return 0, None
    if not range_header.startswith("bytes=") or "," in range_header:
        raise ValueError("Only a single byte range is supported")
    start_text, separator, end_text = range_header.removeprefix("bytes=").partition("-")
    if not separator or not start_text.isdigit():
        raise ValueError("Invalid video byte range")
    if end_text and not end_text.isdigit():
        raise ValueError("Invalid video byte range")
    return int(start_text), int(end_text) if end_text else None


@router.post("/{video_id}/analyze", response_model=VideoAnalysis)
async def analyze_video(
    video_id: str,
    analyzer: Annotated[GeminiVideoAnalyzer, Depends(get_gemini_analyzer)],
    force: bool = Query(default=False),
) -> VideoAnalysis:
    video = get_video(video_id)
    if video is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found",
        )

    if not video.storage_path:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Gemini analysis is available for uploaded GCS videos only",
        )

    try:
        return await asyncio.to_thread(
            analyzer.analyze,
            video_id=video_id,
            gcs_uri=video.storage_path,
            force=force,
        )
    except GeminiConfigurationError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except GeminiResponseValidationError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc
    except GeminiAnalysisError as exc:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(exc),
        ) from exc


@router.post(
    "/{video_id}/placements/{placement_index}/select-campaign",
    response_model=SelectedCampaign,
)
async def select_campaign(
    video_id: str,
    placement_index: int,
    request: CampaignSelectionRequest,
    analyzer: Annotated[GeminiVideoAnalyzer, Depends(get_gemini_analyzer)],
    mcp_service: Annotated[ClickHouseMCPService, Depends(get_clickhouse_mcp_service)],
    selector: Annotated[CampaignSelector, Depends(get_campaign_selector)],
) -> SelectedCampaign:
    video = get_video(video_id)
    if video is None:
        raise HTTPException(status_code=404, detail="Video not found")
    if not video.storage_path:
        raise HTTPException(status_code=409, detail="Video has no Gemini analysis")

    analysis = analyzer.get_cached_analysis(video_id=video_id, gcs_uri=video.storage_path)
    if analysis is None:
        raise HTTPException(status_code=409, detail="Gemini analysis has not been completed")

    placements = [
        (scene, opportunity)
        for scene in analysis.scenes
        for opportunity in scene.placement_opportunities
    ]
    if placement_index < 0 or placement_index >= len(placements):
        raise HTTPException(status_code=404, detail="Placement opportunity not found")

    scene, opportunity = placements[placement_index]
    market = request.market.upper()
    try:
        candidates, _query = await asyncio.to_thread(
            mcp_service.query_campaigns,
            market=market,
            environment=scene.environment,
            placement_surface=opportunity.surface,
            categories=opportunity.recommended_categories,
        )
        return await asyncio.to_thread(
            selector.select,
            video_id=video_id,
            environment=scene.environment,
            placement_surface=opportunity.surface,
            recommended_categories=opportunity.recommended_categories,
            placement_confidence=opportunity.confidence,
            market=market,
            candidates=candidates,
        )
    except NoCompatibleCampaignsError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except ClickHouseMCPError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except CampaignSelectionValidationError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except CampaignSelectionError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@router.get("/{video_id}", response_model=Video)
async def read_video(video_id: str) -> Video:
    video = get_video(video_id)
    if video is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Video not found",
        )
    return video
