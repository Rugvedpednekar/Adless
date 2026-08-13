from pydantic import BaseModel, Field, model_validator


class PlacementQAChecks(BaseModel):
    surface_alignment: bool
    realistic_scale: bool
    realistic_position: bool
    plausible_perspective: bool
    believable_contact_shadow: bool
    floating_product: bool
    face_obstruction: bool
    subtitle_obstruction: bool
    important_object_obstruction: bool
    mug_intersection: bool
    product_visibility: bool
    excessive_prominence: bool
    contextually_appropriate: bool
    safe_context: bool


class PlacementQAResult(BaseModel):
    approved: bool
    quality_score: float = Field(ge=0, le=1)
    checks: PlacementQAChecks
    issues: list[str]
    reason: str = Field(min_length=1)
    representative_frame_time: float = Field(ge=0)

    @model_validator(mode="after")
    def validate_approval_consistency(self):
        blocking_failure = (
            not self.checks.surface_alignment
            or not self.checks.realistic_scale
            or not self.checks.realistic_position
            or self.checks.floating_product
            or self.checks.face_obstruction
            or self.checks.subtitle_obstruction
            or self.checks.important_object_obstruction
            or self.checks.mug_intersection
            or not self.checks.product_visibility
            or not self.checks.contextually_appropriate
            or not self.checks.safe_context
        )
        if self.approved and blocking_failure:
            raise ValueError("approved QA cannot contain a blocking placement failure")
        return self

