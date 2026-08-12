import os
from pathlib import Path

from pydantic import BaseModel
from dotenv import load_dotenv


BACKEND_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(BACKEND_ROOT / ".env")


class Settings(BaseModel):
    PROJECT_NAME: str = "Adless"
    VERSION: str = "0.1.0"
    API_PREFIX: str = "/api"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    GOOGLE_CLOUD_PROJECT: str = os.getenv(
        "GOOGLE_CLOUD_PROJECT", "adless-ai-2026"
    )
    GOOGLE_CLOUD_LOCATION: str = os.getenv("GOOGLE_CLOUD_LOCATION", "global")
    GCS_BUCKET: str | None = os.getenv("GCS_BUCKET")


settings = Settings()
