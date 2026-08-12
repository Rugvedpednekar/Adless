from pydantic import BaseModel


class Creator(BaseModel):
    id: str
    name: str
    avatar_url: str
    verified: bool = False


class Video(BaseModel):
    id: str
    title: str
    creator: Creator
    description: str
    video_url: str
    duration: str
    category: str
    views: str
    upload_date: str
    storage_path: str | None = None
