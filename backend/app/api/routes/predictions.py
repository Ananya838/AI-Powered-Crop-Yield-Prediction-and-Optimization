from fastapi import APIRouter, HTTPException
from app.models.schemas import PredictionRequest, PredictionResponse
from app.services.prediction_service import predict_yield, CROP_ENCODING

router = APIRouter()


@router.post("/", response_model=PredictionResponse)
def predict_crop_yield(request: PredictionRequest):
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
    return predict_yield(request)


@router.get("/supported-crops")
def get_supported_crops():
    """Return list of crops supported by the prediction model."""
    return {"crops": list(CROP_ENCODING.keys())}
