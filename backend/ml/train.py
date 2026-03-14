"""
ML model training script for Crop Yield Prediction.

Generates synthetic training data based on agronomic knowledge,
trains XGBoost and Random Forest models, and saves the best model.

Usage:
    cd backend
    python ml/train.py
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error

try:
    from xgboost import XGBRegressor
    HAS_XGBOOST = True
except ImportError:
    HAS_XGBOOST = False

MODEL_DIR = Path(__file__).parent / "models"
MODEL_DIR.mkdir(exist_ok=True)

CROP_ENCODING = {
    "rice": 0, "wheat": 1, "maize": 2, "chickpea": 3, "kidneybeans": 4,
    "pigeonpeas": 5, "mothbeans": 6, "mungbean": 7, "blackgram": 8,
    "lentil": 9, "pomegranate": 10, "banana": 11, "mango": 12,
    "grapes": 13, "watermelon": 14, "muskmelon": 15, "apple": 16,
    "orange": 17, "papaya": 18, "coconut": 19, "cotton": 20,
    "jute": 21, "coffee": 22,
}

# (base_yield, temp_min, temp_max, rain_min, rain_max, ph_min, ph_max)
CROP_PROFILES = {
    "rice":        (4200, 20, 35, 1000, 2000, 5.5, 7.0),
    "wheat":       (3500, 10, 25,  400, 1200, 6.0, 7.5),
    "maize":       (4800, 18, 35,  500, 1500, 5.5, 7.5),
    "chickpea":    (1500, 15, 30,  300,  800, 6.0, 8.0),
    "kidneybeans": (1200, 15, 30,  400,  900, 6.0, 7.0),
    "pigeonpeas":  (1000, 18, 32,  500, 1000, 5.5, 7.0),
    "mothbeans":   ( 900, 22, 38,  200,  600, 6.0, 8.0),
    "mungbean":    (1100, 18, 30,  600, 1100, 5.5, 7.0),
    "blackgram":   (1000, 20, 35,  600, 1100, 5.5, 7.0),
    "lentil":      (1300, 10, 25,  300,  700, 6.0, 8.0),
    "pomegranate": (15000, 15, 35,  500, 1200, 5.5, 7.5),
    "banana":      (20000, 20, 35, 1200, 2500, 5.5, 7.0),
    "mango":       (10000, 22, 40,  600, 1500, 5.5, 7.5),
    "grapes":      (18000, 15, 35,  400,  800, 6.0, 7.5),
    "watermelon":  (25000, 22, 38,  500, 1000, 6.0, 7.0),
    "muskmelon":   (18000, 22, 38,  500, 1000, 6.0, 7.5),
    "apple":       (12000,  5, 20,  600, 1200, 5.5, 7.0),
    "orange":      (14000, 15, 30,  600, 1500, 6.0, 7.5),
    "papaya":      (30000, 22, 38,  800, 2000, 5.5, 7.0),
    "coconut":     ( 8000, 22, 35, 1400, 2500, 5.5, 8.0),
    "cotton":      ( 1800, 24, 37,  600, 1200, 6.0, 7.5),
    "jute":        ( 2500, 24, 37, 1200, 2500, 5.5, 7.0),
    "coffee":      (  900, 15, 28, 1200, 2500, 6.0, 6.5),
}


def generate_synthetic_data(n_per_crop: int = 400) -> pd.DataFrame:
    rng = np.random.default_rng(42)
    records = []

    for crop, (base_yield, t_min, t_max, r_min, r_max, ph_min, ph_max) in CROP_PROFILES.items():
        for _ in range(n_per_crop):
            temp = rng.uniform(t_min - 5, t_max + 5)
            rain = rng.uniform(max(r_min - 200, 0), r_max + 400)
            ph = rng.uniform(max(ph_min - 1, 3.5), min(ph_max + 1, 9.5))
            nitrogen = rng.uniform(0, 200)
            phosphorus = rng.uniform(0, 150)
            potassium = rng.uniform(0, 200)
            humidity = rng.uniform(20, 95)
            sunshine = rng.uniform(3, 14)
            organic_carbon = rng.uniform(0.1, 8.0)

            # Compute penalty factors
            temp_penalty = max(0, (temp - t_max) / 10) + max(0, (t_min - temp) / 10)
            rain_penalty = max(0, (rain - r_max) / r_max) + max(0, (r_min - rain) / r_min) if r_min > 0 else 0
            ph_penalty = max(0, (ph - ph_max) / 2) + max(0, (ph_min - ph) / 2)
            nutrient_bonus = (
                min(nitrogen / 120, 1.0) * 0.15
                + min(phosphorus / 60, 1.0) * 0.08
                + min(potassium / 80, 1.0) * 0.07
            )

            penalty = min(temp_penalty + rain_penalty + ph_penalty, 0.8)
            yield_val = base_yield * (1 - penalty) * (1 + nutrient_bonus)
            noise = rng.normal(0, base_yield * 0.06)
            yield_val = max(yield_val + noise, 0)

            records.append({
                "crop": crop,
                "crop_code": CROP_ENCODING[crop],
                "nitrogen": nitrogen,
                "phosphorus": phosphorus,
                "potassium": potassium,
                "ph": ph,
                "organic_carbon": organic_carbon,
                "temperature": temp,
                "rainfall": rain,
                "humidity": humidity,
                "sunshine_hours": sunshine,
                "season": 0,  # simplified
                "yield_kg_per_ha": yield_val,
            })

    return pd.DataFrame(records)


def train():
    print("Generating synthetic training data...")
    df = generate_synthetic_data(n_per_crop=400)
    print(f"Dataset shape: {df.shape}")

    # Save sample data
    data_dir = Path(__file__).parent.parent / "data"
    data_dir.mkdir(exist_ok=True)
    df.to_csv(data_dir / "training_data.csv", index=False)
    print(f"Training data saved to {data_dir / 'training_data.csv'}")

    feature_cols = [
        "nitrogen", "phosphorus", "potassium", "ph", "organic_carbon",
        "temperature", "rainfall", "humidity", "sunshine_hours",
        "crop_code", "season",
    ]
    X = df[feature_cols].values
    y = df["yield_kg_per_ha"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    scaler = StandardScaler()
    X_train_s = scaler.fit_transform(X_train)
    X_test_s = scaler.transform(X_test)

    models = {
        "RandomForest": RandomForestRegressor(n_estimators=200, random_state=42, n_jobs=-1),
        "GradientBoosting": GradientBoostingRegressor(n_estimators=200, random_state=42),
    }
    if HAS_XGBOOST:
        models["XGBoost"] = XGBRegressor(
            n_estimators=300, learning_rate=0.05, max_depth=6,
            random_state=42, n_jobs=-1, verbosity=0,
        )

    results = {}
    best_model_name = None
    best_r2 = -np.inf
    best_model = None

    for name, model in models.items():
        print(f"\nTraining {name}...")
        model.fit(X_train_s, y_train)
        preds = model.predict(X_test_s)
        mae = mean_absolute_error(y_test, preds)
        rmse = np.sqrt(mean_squared_error(y_test, preds))
        r2 = r2_score(y_test, preds)
        results[name] = {"MAE": round(mae, 2), "RMSE": round(rmse, 2), "R2": round(r2, 4)}
        print(f"  MAE: {mae:.2f}  RMSE: {rmse:.2f}  R²: {r2:.4f}")

        if r2 > best_r2:
            best_r2 = r2
            best_model_name = name
            best_model = model

    print(f"\nBest model: {best_model_name} (R²={best_r2:.4f})")

    joblib.dump(best_model, MODEL_DIR / "yield_predictor.joblib")
    joblib.dump(scaler, MODEL_DIR / "scaler.joblib")

    metrics = {
        "best_model": best_model_name,
        "feature_columns": feature_cols,
        "test_metrics": results[best_model_name],
        "all_results": results,
    }
    with open(MODEL_DIR / "metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"\nModels saved to {MODEL_DIR}")
    print(f"Metrics: {metrics['test_metrics']}")
    return metrics


if __name__ == "__main__":
    train()
