from fastapi import APIRouter, HTTPException, Query
from app.services.weather_service import fetch_weather_by_city, fetch_weather_by_coords
from app.config import settings

router = APIRouter()


@router.get("/city/{city_name}")
async def get_weather_by_city(city_name: str):
    """
    Fetch real-time weather data for a city.
    Returns temperature, rainfall, humidity, and sunshine hours
    ready to be used in prediction/optimization forms.
    """
    if not settings.OPENWEATHER_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Weather API key not configured. Set OPENWEATHER_API_KEY in backend/.env "
                   "(get a free key at https://openweathermap.org/api).",
        )
    try:
        data = await fetch_weather_by_city(city_name, settings.OPENWEATHER_API_KEY)
        return data
    except Exception as exc:
        raise HTTPException(
            status_code=404,
            detail=f"Could not fetch weather for '{city_name}'. "
                   f"Check the city name and try again. Details: {str(exc)}",
        )


@router.get("/coords")
async def get_weather_by_coords(
    lat: float = Query(..., ge=-90, le=90, description="Latitude"),
    lon: float = Query(..., ge=-180, le=180, description="Longitude"),
):
    """
    Fetch real-time weather data by GPS coordinates (auto-detect location).
    """
    if not settings.OPENWEATHER_API_KEY:
        raise HTTPException(
            status_code=503,
            detail="Weather API key not configured. Set OPENWEATHER_API_KEY in backend/.env.",
        )
    try:
        data = await fetch_weather_by_coords(lat, lon, settings.OPENWEATHER_API_KEY)
        return data
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Could not fetch weather for coords ({lat}, {lon}). Details: {str(exc)}",
        )
