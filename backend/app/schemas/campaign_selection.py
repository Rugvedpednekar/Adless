from pydantic import BaseModel, Field


class CampaignSelectionRequest(BaseModel):
    market: str = Field(default="US", min_length=2, max_length=8, pattern=r"^[A-Za-z]+$")


class CampaignCandidate(BaseModel):
    campaign_id: str
    brand: str
    product_name: str
    category: str
    impressions: int = Field(ge=0)
    avg_exposure_seconds: float = Field(ge=0)
    success_rate: float = Field(ge=0, le=1)
    performance_score: float = Field(ge=0)


class SelectedCampaign(BaseModel):
    campaign_id: str
    brand: str
    product_name: str
    category: str
    market: str
    placement_surface: str
    performance_score: float = Field(ge=0)
    success_rate: float = Field(ge=0, le=1)
    avg_exposure_seconds: float = Field(ge=0)
    selection_confidence: float = Field(ge=0, le=1)
    reason: str = Field(min_length=1)
