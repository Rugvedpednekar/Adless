from datetime import datetime, timezone
from enum import Enum
from pydantic import BaseModel, Field

class PlacementEventType(str, Enum):
    PLACEMENT_IMPRESSION="placement_impression"
    CTA_IMPRESSION="cta_impression"
    CTA_CLICK="cta_click"
    CTA_DISMISS="cta_dismiss"
    EXPOSURE_COMPLETED="placement_exposure_completed"

class PlacementEvent(BaseModel):
    event_type: PlacementEventType
    video_id: str = Field(min_length=1,max_length=200)
    placement_id: str = Field(min_length=1,max_length=200)
    campaign_id: str = Field(min_length=1,max_length=200)
    product_id: str = Field(min_length=1,max_length=200)
    viewer_session_id: str = Field(min_length=8,max_length=100)
    playback_second: float = Field(ge=0)
    placement_start: float = Field(ge=0)
    placement_end: float = Field(gt=0)
    cta_show: float = Field(ge=0)
    cta_hide: float = Field(gt=0)
    surface: str
    scene_environment: str
    market: str = "US"

class PlacementEventAccepted(BaseModel):
    accepted: bool

class PlacementAnalyticsSummary(BaseModel):
    placement_impressions:int=0
    cta_impressions:int=0
    cta_clicks:int=0
    cta_dismissals:int=0
    exposure_completions:int=0
    cta_ctr:float=0
