from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "AI Crop Yield Prediction API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    MODEL_PATH: str = "ml/models"
    CORS_ORIGINS: list = ["http://localhost:5173", "http://localhost:3000"]
    OPENWEATHER_API_KEY: str = ""  # Get free key at https://openweathermap.org/api
    DATABASE_URL: str = "sqlite:///./cropai.db"

    class Config:
        env_file = ".env"


settings = Settings()
