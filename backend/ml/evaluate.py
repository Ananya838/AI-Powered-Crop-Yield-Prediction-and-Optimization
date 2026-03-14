"""
Model evaluation script — generates performance plots and a detailed report.

Usage:
    cd backend
    python ml/evaluate.py
"""

import json
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error

MODEL_DIR = Path(__file__).parent / "models"
DATA_PATH = Path(__file__).parent.parent / "data" / "training_data.csv"
REPORT_DIR = Path(__file__).parent.parent / "data" / "reports"
REPORT_DIR.mkdir(exist_ok=True)


def evaluate():
    if not DATA_PATH.exists():
        print("Training data not found. Run ml/train.py first.")
        return

    df = pd.read_csv(DATA_PATH)
    feature_cols = [
        "nitrogen", "phosphorus", "potassium", "ph", "organic_carbon",
        "temperature", "rainfall", "humidity", "sunshine_hours",
        "crop_code", "season",
    ]

    X = df[feature_cols].values
    y = df["yield_kg_per_ha"].values

    model = joblib.load(MODEL_DIR / "yield_predictor.joblib")
    scaler = joblib.load(MODEL_DIR / "scaler.joblib")

    X_scaled = scaler.transform(X)
    preds = model.predict(X_scaled)

    mae = mean_absolute_error(y, preds)
    rmse = np.sqrt(mean_squared_error(y, preds))
    r2 = r2_score(y, preds)

    print(f"Overall Evaluation:")
    print(f"  MAE:  {mae:.2f} kg/ha")
    print(f"  RMSE: {rmse:.2f} kg/ha")
    print(f"  R²:   {r2:.4f}")

    # --- Plot 1: Actual vs Predicted ---
    fig, axes = plt.subplots(1, 2, figsize=(14, 5))
    axes[0].scatter(y, preds, alpha=0.3, s=5, color="steelblue")
    max_val = max(y.max(), preds.max())
    axes[0].plot([0, max_val], [0, max_val], "r--", lw=1.5)
    axes[0].set_xlabel("Actual Yield (kg/ha)")
    axes[0].set_ylabel("Predicted Yield (kg/ha)")
    axes[0].set_title(f"Actual vs Predicted (R²={r2:.3f})")

    # --- Plot 2: Residuals ---
    residuals = preds - y
    axes[1].hist(residuals, bins=60, color="coral", edgecolor="white")
    axes[1].axvline(0, color="black", lw=1.5, linestyle="--")
    axes[1].set_xlabel("Residual (kg/ha)")
    axes[1].set_ylabel("Frequency")
    axes[1].set_title("Prediction Residuals")

    plt.tight_layout()
    plt.savefig(REPORT_DIR / "evaluation_plots.png", dpi=150)
    print(f"Plots saved to {REPORT_DIR / 'evaluation_plots.png'}")

    # --- Feature importance ---
    if hasattr(model, "feature_importances_"):
        importance_df = pd.DataFrame({
            "Feature": feature_cols,
            "Importance": model.feature_importances_,
        }).sort_values("Importance", ascending=False)

        fig2, ax = plt.subplots(figsize=(10, 5))
        sns.barplot(data=importance_df, x="Importance", y="Feature", palette="viridis", ax=ax)
        ax.set_title("Feature Importance")
        plt.tight_layout()
        plt.savefig(REPORT_DIR / "feature_importance.png", dpi=150)
        print(f"Feature importance saved to {REPORT_DIR / 'feature_importance.png'}")
        print("\nTop Features:")
        print(importance_df.to_string(index=False))

    # --- Per-crop metrics ---
    df["predicted"] = preds
    crop_metrics = []
    for crop in df["crop"].unique():
        mask = df["crop"] == crop
        actual = df.loc[mask, "yield_kg_per_ha"]
        predicted = df.loc[mask, "predicted"]
        crop_metrics.append({
            "crop": crop,
            "mae": round(mean_absolute_error(actual, predicted), 2),
            "r2": round(r2_score(actual, predicted), 4),
            "count": int(mask.sum()),
        })
    crop_df = pd.DataFrame(crop_metrics).sort_values("mae")
    print("\nPer-Crop Performance:")
    print(crop_df.to_string(index=False))
    crop_df.to_csv(REPORT_DIR / "per_crop_metrics.csv", index=False)


if __name__ == "__main__":
    evaluate()
