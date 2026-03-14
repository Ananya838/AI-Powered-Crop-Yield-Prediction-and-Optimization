from fastapi import APIRouter, HTTPException
from app.models.schemas import CropInfo
from app.services.crop_service import get_all_crops, get_crop_by_name, get_crop_names

router = APIRouter()


@router.get("/", response_model=list[CropInfo])
def list_crops():
    """Return information about all supported crops."""
    return get_all_crops()


@router.get("/names")
def list_crop_names():
    """Return a simple list of supported crop names."""
    return {"crops": get_crop_names()}


@router.get("/{crop_name}", response_model=CropInfo)
def get_crop(crop_name: str):
    """Return detailed information for a specific crop."""
    info = get_crop_by_name(crop_name)
    if not info:
        raise HTTPException(status_code=404, detail=f"Crop '{crop_name}' not found.")
    return info
