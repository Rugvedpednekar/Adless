import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]/"cache"/"placement_approvals";ROOT.mkdir(parents=True,exist_ok=True)
def _path(video_id,index):
    safe="".join(c for c in video_id if c.isalnum() or c in "-_")
    return ROOT/f"{safe}-{index}.json"
def set_approval(video_id:str,index:int,approved:bool):_path(video_id,index).write_text(json.dumps({"approved":approved}),encoding="utf-8")
def is_approved(video_id:str,index:int)->bool:
    try:return bool(json.loads(_path(video_id,index).read_text(encoding="utf-8"))["approved"])
    except (OSError,ValueError,KeyError,TypeError):return False
