from pydantic import BaseModel, Field, model_validator


class PlacementGeometry(BaseModel):
    surface: str = Field(min_length=1)
    x: float = Field(ge=0, le=1)
    y: float = Field(ge=0, le=1)
    width: float = Field(ge=0, le=1)
    height: float = Field(ge=0, le=1)
    rotation: float = Field(ge=-30, le=30)
    confidence: float = Field(ge=0, le=1)
    reason: str = Field(min_length=1)

    @model_validator(mode="after")
    def validate_bounds(self):
        if self.width <= 0 or self.height <= 0:
            raise ValueError("placement geometry must have positive dimensions")
        if self.x + self.width > 1 or self.y + self.height > 1:
            raise ValueError("placement geometry must remain inside the frame")
        return self


class ProductPlacementPreview(BaseModel):
    video_id: str
    placement_index: int = Field(ge=0)
    campaign_id: str
    brand: str
    product_name: str
    surface: str
    start_time: float = Field(ge=0)
    end_time: float = Field(ge=0)
    placement_confidence: float = Field(ge=0, le=1)
    performance_score: float = Field(ge=0)
    preview_available: bool
    preview_url: str
    storage_path: str
    geometry: PlacementGeometry
