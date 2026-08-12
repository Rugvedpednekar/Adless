from pydantic import BaseModel


class Settings(BaseModel):
    PROJECT_NAME: str = "Adless"
    VERSION: str = "0.1.0"
    API_PREFIX: str = "/api"
    ALLOWED_ORIGINS: list[str] = ["http://localhost:3000"]


settings = Settings()
