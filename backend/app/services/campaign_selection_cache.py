from pathlib import Path

from app.schemas.campaign_selection import SelectedCampaign


CACHE_DIRECTORY = Path(__file__).resolve().parents[2] / "cache" / "campaign_selections"
CACHE_DIRECTORY.mkdir(parents=True, exist_ok=True)


def save_selected_campaign(video_id: str, placement_index: int, campaign: SelectedCampaign) -> None:
    _path(video_id, placement_index).write_text(campaign.model_dump_json(indent=2), encoding="utf-8")


def get_selected_campaign(video_id: str, placement_index: int) -> SelectedCampaign | None:
    path = _path(video_id, placement_index)
    if not path.exists():
        return None
    try:
        return SelectedCampaign.model_validate_json(path.read_text(encoding="utf-8"))
    except (OSError, ValueError):
        return None


def _path(video_id: str, placement_index: int) -> Path:
    safe_id = "".join(character for character in video_id if character.isalnum() or character in "-_")
    return CACHE_DIRECTORY / f"{safe_id}-{placement_index}.json"

