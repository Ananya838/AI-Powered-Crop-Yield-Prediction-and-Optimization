from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.routes import predictions, optimization, crops, weather

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-powered API for crop yield prediction and farm optimization",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(predictions.router, prefix="/api/v1/predictions", tags=["Predictions"])
app.include_router(optimization.router, prefix="/api/v1/optimization", tags=["Optimization"])
app.include_router(crops.router, prefix="/api/v1/crops", tags=["Crops"])
app.include_router(weather.router, prefix="/api/v1/weather", tags=["Weather"])


@app.get("/")
def root():
    return {"message": "AI Crop Yield Prediction API", "version": settings.APP_VERSION}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
