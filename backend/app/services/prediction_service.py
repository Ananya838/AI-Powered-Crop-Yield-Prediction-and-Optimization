import os
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from app.models.schemas import (
    PredictionRequest,
    PredictionResponse,
    OptimizationRequest,
    OptimizationResponse,
    Recommendation,
)

MODEL_DIR = Path(__file__).parent.parent.parent / "ml" / "models"

_model_cache: dict = {}


def _load_model(name: str):
    if name not in _model_cache:
        path = MODEL_DIR / f"{name}.joblib"
        if path.exists():
            _model_cache[name] = joblib.load(path)
        else:
            _model_cache[name] = None
    return _model_cache[name]


CROP_ENCODING = {
    "rice": 0, "wheat": 1, "maize": 2, "chickpea": 3, "kidneybeans": 4,
    "pigeonpeas": 5, "mothbeans": 6, "mungbean": 7, "blackgram": 8,
    "lentil": 9, "pomegranate": 10, "banana": 11, "mango": 12,
    "grapes": 13, "watermelon": 14, "muskmelon": 15, "apple": 16,
    "orange": 17, "papaya": 18, "coconut": 19, "cotton": 20,
    "jute": 21, "coffee": 22,
}

SEASON_ENCODING = {"kharif": 0, "rabi": 1, "zaid": 2}


def _build_feature_vector(request: PredictionRequest) -> np.ndarray:
    crop_code = CROP_ENCODING.get(request.crop_type.lower(), -1)
    season_code = SEASON_ENCODING.get(request.season.lower(), 0)
    return np.array([[
        request.soil.nitrogen,
        request.soil.phosphorus,
        request.soil.potassium,
        request.soil.ph,
        request.soil.organic_carbon,
        request.weather.temperature,
        request.weather.rainfall,
        request.weather.humidity,
        request.weather.sunshine_hours,
        crop_code,
        season_code,
    ]])


# Fallback heuristic model when no trained model is available
_BASE_YIELDS = {
    "rice": 4200, "wheat": 3500, "maize": 4800, "chickpea": 1500,
    "kidneybeans": 1200, "pigeonpeas": 1000, "mothbeans": 900, "mungbean": 1100,
    "blackgram": 1000, "lentil": 1300, "pomegranate": 15000, "banana": 20000,
    "mango": 10000, "grapes": 18000, "watermelon": 25000, "muskmelon": 18000,
    "apple": 12000, "orange": 14000, "papaya": 30000, "coconut": 8000,
    "cotton": 1800, "jute": 2500, "coffee": 900,
}


def _heuristic_yield(request: PredictionRequest) -> tuple[float, float]:
    base = _BASE_YIELDS.get(request.crop_type.lower(), 2000)
    soil = request.soil
    weather = request.weather

    # Soil pH factor (optimal 6.0–7.0)
    ph_score = 1.0 - min(abs(soil.ph - 6.5) / 3.5, 0.4)
    # Nutrient score
    n_score = min(soil.nitrogen / 100, 1.0)
    p_score = min(soil.phosphorus / 60, 1.0)
    k_score = min(soil.potassium / 80, 1.0)
    nutrient_score = (n_score + p_score + k_score) / 3

    # Weather factor
    rain_optimal = 1000
    rain_score = 1.0 - min(abs(weather.rainfall - rain_optimal) / rain_optimal, 0.5)
    temp_score = 1.0 - min(abs(weather.temperature - 25) / 20, 0.4)

    factor = (ph_score * 0.2 + nutrient_score * 0.35 + rain_score * 0.25 + temp_score * 0.2)
    predicted = base * (0.6 + factor * 0.8)
    confidence = 0.55 + factor * 0.3
    return round(predicted, 2), round(min(confidence, 0.92), 4)


def predict_yield(request: PredictionRequest) -> PredictionResponse:
    model = _load_model("yield_predictor")
    scaler = _load_model("scaler")

    if model is not None and scaler is not None:
        features = _build_feature_vector(request)
        features_scaled = scaler.transform(features)
        yield_per_ha = float(model.predict(features_scaled)[0])
        confidence = 0.87
        model_used = "XGBoost (trained)"
    else:
        yield_per_ha, confidence = _heuristic_yield(request)
        model_used = "Heuristic (train model for higher accuracy)"

    yield_per_ha = max(yield_per_ha, 0)
    total_yield = round(yield_per_ha * request.area_hectares, 2)

    if yield_per_ha < 1500:
        category = "Low"
    elif yield_per_ha < 4000:
        category = "Medium"
    else:
        category = "High"

    return PredictionResponse(
        crop_type=request.crop_type,
        predicted_yield_kg_per_ha=round(yield_per_ha, 2),
        total_predicted_yield_kg=total_yield,
        confidence_score=confidence,
        yield_category=category,
        model_used=model_used,
    )


def get_optimization(request: OptimizationRequest) -> OptimizationResponse:
    pred_req = PredictionRequest(
        crop_type=request.crop_type,
        soil=request.soil,
        weather=request.weather,
        area_hectares=request.area_hectares,
        season=request.season,
    )
    current_yield, _ = _heuristic_yield(pred_req)

    recommendations: list[Recommendation] = []

    # pH recommendations
    if request.soil.ph < 6.0:
        recommendations.append(Recommendation(
            category="Soil Health",
            action=f"Apply agricultural lime to raise soil pH from {request.soil.ph} to 6.0–6.5.",
            expected_improvement="5–15% yield increase",
            priority="High",
        ))
    elif request.soil.ph > 7.5:
        recommendations.append(Recommendation(
            category="Soil Health",
            action=f"Apply elemental sulfur or organic matter to lower soil pH from {request.soil.ph} to 6.5–7.0.",
            expected_improvement="5–10% yield increase",
            priority="High",
        ))

    # Nitrogen
    if request.soil.nitrogen < 60:
        recommendations.append(Recommendation(
            category="Fertilizer",
            action=f"Increase nitrogen application. Current: {request.soil.nitrogen} kg/ha. Target: 80–120 kg/ha using urea or ammonium nitrate.",
            expected_improvement="10–20% yield increase",
            priority="High",
        ))
    elif request.soil.nitrogen > 150:
        recommendations.append(Recommendation(
            category="Fertilizer",
            action=f"Reduce nitrogen to avoid toxicity. Current: {request.soil.nitrogen} kg/ha. Target: 80–120 kg/ha.",
            expected_improvement="Prevents 10–15% yield loss",
            priority="Medium",
        ))

    # Phosphorus
    if request.soil.phosphorus < 30:
        recommendations.append(Recommendation(
            category="Fertilizer",
            action=f"Apply phosphate fertilizer (DAP/SSP). Current: {request.soil.phosphorus} kg/ha. Target: 40–60 kg/ha.",
            expected_improvement="5–10% yield increase",
            priority="Medium",
        ))

    # Potassium
    if request.soil.potassium < 40:
        recommendations.append(Recommendation(
            category="Fertilizer",
            action=f"Apply potash (MOP/SOP). Current: {request.soil.potassium} kg/ha. Target: 60–80 kg/ha.",
            expected_improvement="5–8% yield increase",
            priority="Medium",
        ))

    # Rainfall
    if request.weather.rainfall < 600:
        recommendations.append(Recommendation(
            category="Irrigation",
            action="Implement drip or sprinkler irrigation to compensate for low rainfall. Consider drought-resistant varieties.",
            expected_improvement="15–30% yield improvement in dry conditions",
            priority="High",
        ))
    elif request.weather.rainfall > 2500:
        recommendations.append(Recommendation(
            category="Drainage",
            action="Install proper field drainage channels to prevent waterlogging and root diseases.",
            expected_improvement="Prevents 20–40% yield loss",
            priority="High",
        ))

    # Organic carbon
    if request.soil.organic_carbon < 1.0:
        recommendations.append(Recommendation(
            category="Soil Health",
            action="Apply compost or farmyard manure (10–15 tons/ha) to boost organic carbon.",
            expected_improvement="8–12% long-term yield improvement",
            priority="Medium",
        ))

    # Default recommendation if soil is already good
    if not recommendations:
        recommendations.append(Recommendation(
            category="General",
            action="Soil and weather conditions are near optimal. Maintain current practices and consider precision farming tools.",
            expected_improvement="2–5% incremental improvement",
            priority="Low",
        ))

    # Estimate optimized yield
    improvement_factor = 1.0 + (len([r for r in recommendations if r.priority == "High"]) * 0.12
                                  + len([r for r in recommendations if r.priority == "Medium"]) * 0.06)
    optimized_yield = round(current_yield * improvement_factor, 2)
    improvement_pct = round((optimized_yield - current_yield) / current_yield * 100, 2)

    # Best crop alternatives based on conditions
    alternatives = _suggest_crops(request)

    return OptimizationResponse(
        crop_type=request.crop_type,
        current_estimated_yield_kg_per_ha=round(current_yield, 2),
        optimized_estimated_yield_kg_per_ha=optimized_yield,
        yield_improvement_percent=improvement_pct,
        recommendations=recommendations,
        best_crop_alternatives=alternatives,
    )


def _suggest_crops(request: OptimizationRequest) -> list[str]:
    temp = request.weather.temperature
    rain = request.weather.rainfall
    ph = request.soil.ph
    candidates = []

    if 20 <= temp <= 35 and rain >= 1000 and 5.5 <= ph <= 7.0:
        candidates.append("rice")
    if 10 <= temp <= 25 and 400 <= rain <= 1200 and 6.0 <= ph <= 7.5:
        candidates.append("wheat")
    if 18 <= temp <= 32 and 500 <= rain <= 1500 and 5.5 <= ph <= 7.5:
        candidates.append("maize")
    if 18 <= temp <= 30 and 600 <= rain <= 1100 and 5.5 <= ph <= 7.0:
        candidates.append("mungbean")
    if 24 <= temp <= 35 and rain >= 600 and 6.0 <= ph <= 7.5:
        candidates.append("cotton")
    if 15 <= temp <= 30 and 300 <= rain <= 800 and 6.0 <= ph <= 8.0:
        candidates.append("chickpea")

    current = request.crop_type.lower()
    candidates = [c for c in candidates if c != current]
    return candidates[:3] if candidates else ["wheat", "maize", "chickpea"]
