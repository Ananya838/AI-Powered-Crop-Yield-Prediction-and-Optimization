from fastapi import APIRouter, HTTPException
from app.models.schemas import OptimizationRequest, OptimizationResponse
from app.services.prediction_service import get_optimization, CROP_ENCODING

router = APIRouter()


@router.post("/", response_model=OptimizationResponse)
def optimize_farm(request: OptimizationRequest):
    """
    Analyze farm conditions and return actionable optimization recommendations
    to improve crop yield. Includes alternative crop suggestions.
    """
    if request.crop_type.lower() not in CROP_ENCODING:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported crop type '{request.crop_type}'.",
        )
    return get_optimization(request)
