from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "AI Crop Yield Prediction API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    MODEL_PATH: str = "ml/models"
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000"]

    class Config:
        env_file = ".env"


settings = Settings()
