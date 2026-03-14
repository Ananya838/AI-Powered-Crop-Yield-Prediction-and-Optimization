from typing import Optional
from pydantic import BaseModel, Field


class SoilData(BaseModel):
    nitrogen: float = Field(..., ge=0, le=200, description="Nitrogen content (kg/ha)")
    phosphorus: float = Field(..., ge=0, le=200, description="Phosphorus content (kg/ha)")
    potassium: float = Field(..., ge=0, le=200, description="Potassium content (kg/ha)")
    ph: float = Field(..., ge=0, le=14, description="Soil pH level")
    organic_carbon: float = Field(..., ge=0, le=10, description="Organic carbon (%)")


class WeatherData(BaseModel):
    temperature: float = Field(..., ge=-10, le=60, description="Average temperature (°C)")
    rainfall: float = Field(..., ge=0, le=5000, description="Annual rainfall (mm)")
    humidity: float = Field(..., ge=0, le=100, description="Average humidity (%)")
    sunshine_hours: float = Field(..., ge=0, le=16, description="Daily sunshine hours")


class PredictionRequest(BaseModel):
    crop_type: str = Field(..., description="Type of crop (e.g., wheat, rice, maize)")
    soil: SoilData
    weather: WeatherData
    area_hectares: float = Field(..., ge=0.1, description="Farm area in hectares")
    season: str = Field(..., description="Growing season (Kharif/Rabi/Zaid)")

    class Config:
        json_schema_extra = {
            "example": {
                "crop_type": "rice",
                "soil": {
                    "nitrogen": 90,
                    "phosphorus": 42,
                    "potassium": 43,
                    "ph": 6.5,
                    "organic_carbon": 2.1,
                },
                "weather": {
                    "temperature": 25,
                    "rainfall": 1200,
                    "humidity": 80,
                    "sunshine_hours": 7,
                },
                "area_hectares": 2.5,
                "season": "Kharif",
            }
        }


class PredictionResponse(BaseModel):
    crop_type: str
    predicted_yield_kg_per_ha: float
    total_predicted_yield_kg: float
    confidence_score: float
    yield_category: str  # Low / Medium / High
    model_used: str


class OptimizationRequest(BaseModel):
    crop_type: str
    soil: SoilData
    weather: WeatherData
    area_hectares: float
    season: str
    budget_inr: Optional[float] = None


class Recommendation(BaseModel):
    category: str
    action: str
    expected_improvement: str
    priority: str  # High / Medium / Low


class OptimizationResponse(BaseModel):
    crop_type: str
    current_estimated_yield_kg_per_ha: float
    optimized_estimated_yield_kg_per_ha: float
    yield_improvement_percent: float
    recommendations: list[Recommendation]
    best_crop_alternatives: list[str]


class CropInfo(BaseModel):
    name: str
    season: str
    ideal_temperature_min: float
    ideal_temperature_max: float
    ideal_rainfall_min: float
    ideal_rainfall_max: float
    ideal_ph_min: float
    ideal_ph_max: float
    average_yield_kg_per_ha: float
    description: str
