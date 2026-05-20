"""
NEW FILE: soil.py (API route)
Exposes the SoilGrids-backed soil data endpoint.
"""

from fastapi import APIRouter, HTTPException, Query
from app.services.soil_service import fetch_soil_by_coords

router = APIRouter()


@router.get("/coords")
async def get_soil_by_coords(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude"),
):
    """
    Fetch real-time soil data by GPS coordinates using the SoilGrids API.

    Returns:
    - ph: Soil pH (0–14)
    - organic_carbon: Organic carbon (%)
    - nitrogen: Derived nitrogen estimate (kg/ha)
    - phosphorus: Regional default (kg/ha) — SoilGrids free tier limitation
    - potassium: Regional default (kg/ha) — SoilGrids free tier limitation
    - source: "SoilGrids" if live data, "Default" if fallback was used
    - note: Explanation of any fallback or limitation
    """
    try:
        data = await fetch_soil_by_coords(lat, lon)
        return data
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch soil data for coords ({lat}, {lon}): {str(exc)}",
        )
