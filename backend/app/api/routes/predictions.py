from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.schemas import DashboardResponse, PredictionRequest, PredictionResponse
from app.services.history_service import get_dashboard_data, save_prediction_record
from app.services.prediction_service import predict_yield, CROP_ENCODING

router = APIRouter()


@router.post("/", response_model=PredictionResponse)
def predict_crop_yield(request: PredictionRequest, db: Session = Depends(get_db)):
    """
    Predict crop yield based on soil conditions, weather data, and crop type.
    Returns predicted yield per hectare, total yield, confidence score, and yield category.
    """
    if request.crop_type.lower() not in CROP_ENCODING:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported crop type '{request.crop_type}'. "
                   f"Supported crops: {list(CROP_ENCODING.keys())}",
        )
    response = predict_yield(request)
    save_prediction_record(db, request, response)
    return response


@router.get("/dashboard", response_model=DashboardResponse)
def get_prediction_dashboard(
    limit: int = Query(10, ge=1, le=50, description="Maximum number of recent predictions"),
    db: Session = Depends(get_db),
):
    """Return aggregated dashboard stats and recent prediction history."""
    return get_dashboard_data(db, limit=limit)


@router.get("/supported-crops")
def get_supported_crops():
    """Return list of crops supported by the prediction model."""
    return {"crops": list(CROP_ENCODING.keys())}
