from pydantic import BaseModel, Field, model_validator


class PlacementOpportunity(BaseModel):
    surface: str = Field(min_length=1)
    recommended_categories: list[str]
    reason: str = Field(min_length=1)
    confidence: float = Field(ge=0, le=1)


class SceneAnalysis(BaseModel):
    start_time: float = Field(ge=0)
    end_time: float = Field(ge=0)
    environment: str = Field(min_length=1)
    mood: str = Field(min_length=1)
    objects: list[str]
    placement_opportunities: list[PlacementOpportunity]

    @model_validator(mode="after")
    def validate_time_range(self):
        if self.end_time < self.start_time:
            raise ValueError("end_time must be greater than or equal to start_time")
        return self


class VideoAnalysis(BaseModel):
    video_id: str = Field(min_length=1)
    summary: str = Field(min_length=1)
    scenes: list[SceneAnalysis]
