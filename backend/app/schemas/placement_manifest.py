from pydantic import BaseModel, Field, model_validator

class ManifestProduct(BaseModel):
    product_id: str
    brand: str
    name: str
    category: str
    price: str
    image_url: str
    landing_path: str

class PlacementCTA(BaseModel):
    label: str = "Buy Now"
    show_at: float = Field(ge=0)
    hide_at: float = Field(gt=0)
    position: str = "bottom_right"

    @model_validator(mode="after")
    def valid_interval(self):
        if self.hide_at <= self.show_at:
            raise ValueError("CTA hide time must follow show time")
        return self

class ManifestPlacement(BaseModel):
    placement_id: str
    placement_index: int = Field(ge=0)
    campaign_id: str
    product_id: str
    start_time: float = Field(ge=0)
    end_time: float = Field(gt=0)
    surface: str
    scene_environment: str
    placement_confidence: float = Field(ge=0, le=1)
    performance_score: float
    product: ManifestProduct
    cta: PlacementCTA

class PlacementManifest(BaseModel):
    video_id: str
    playback_url: str | None = None
    placements: list[ManifestPlacement]

class CreatorPlacementDecision(BaseModel):
    approved: bool
