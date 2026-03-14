"""
Real-time weather service using OpenWeatherMap API.
Free tier: https://openweathermap.org/api — 1,000 calls/day

Set OPENWEATHER_API_KEY in backend/.env to enable.
Without a key, returns None and the frontend falls back to manual input.
"""

import httpx
from typing import Optional
from app.models.schemas import WeatherData

OWMAP_BASE = "https://api.openweathermap.org/data/2.5/weather"
# 5-day/3-hour forecast for average calculations
OWMAP_FORECAST = "https://api.openweathermap.org/data/2.5/forecast"


async def fetch_weather_by_city(city: str, api_key: str) -> Optional[dict]:
    """
    Fetch current weather + 5-day forecast for a city name.
    Returns a dict with WeatherData-compatible fields plus metadata.
    """
    params = {"q": city, "appid": api_key, "units": "metric"}
    async with httpx.AsyncClient(timeout=10.0) as client:
        current_resp = await client.get(OWMAP_BASE, params=params)
        current_resp.raise_for_status()
        current = current_resp.json()

        forecast_resp = await client.get(OWMAP_FORECAST, params=params)
        forecast_resp.raise_for_status()
        forecast = forecast_resp.json()

    return _parse_weather(current, forecast)


async def fetch_weather_by_coords(lat: float, lon: float, api_key: str) -> Optional[dict]:
    """
    Fetch current weather + 5-day forecast by GPS coordinates.
    """
    params = {"lat": lat, "lon": lon, "appid": api_key, "units": "metric"}
    async with httpx.AsyncClient(timeout=10.0) as client:
        current_resp = await client.get(OWMAP_BASE, params=params)
        current_resp.raise_for_status()
        current = current_resp.json()

        forecast_resp = await client.get(OWMAP_FORECAST, params=params)
        forecast_resp.raise_for_status()
        forecast = forecast_resp.json()

    return _parse_weather(current, forecast)


def _parse_weather(current: dict, forecast: dict) -> dict:
    """
    Extract and compute agronomically useful fields from OWM responses.

    - temperature: current temperature (°C)
    - humidity: current humidity (%)
    - rainfall: estimated annual from 5-day forecast (extrapolated)
    - sunshine_hours: estimated from cloud cover (% → hours/day)
    - description: human-readable weather summary
    - city: resolved city name
    - country: country code
    """
    temp = current["main"]["temp"]
    humidity = current["main"]["humidity"]
    cloud_pct = current.get("clouds", {}).get("all", 50)  # % cloud cover

    # Sunshine estimate: 12h max daylight, clouds reduce it linearly
    sunshine_hours = round(12.0 * (1 - cloud_pct / 100), 1)
    sunshine_hours = max(1.0, min(sunshine_hours, 14.0))

    # Rainfall from 5-day forecast: sum 3-hour rain totals then extrapolate to annual
    rain_5day_mm = 0.0
    for item in forecast.get("list", []):
        rain_5day_mm += item.get("rain", {}).get("3h", 0.0)

    # 5-day window → extrapolate to 365 days
    annual_rainfall_mm = round(rain_5day_mm * (365 / 5), 1)
    # Cap at a realistic max to avoid wild extrapolations from short wet spells
    annual_rainfall_mm = min(annual_rainfall_mm, 4000.0)

    return {
        "city": current.get("name", ""),
        "country": current.get("sys", {}).get("country", ""),
        "temperature": round(temp, 1),
        "humidity": round(humidity, 1),
        "rainfall": annual_rainfall_mm,
        "sunshine_hours": sunshine_hours,
        "description": current.get("weather", [{}])[0].get("description", "").title(),
        "wind_speed_kmh": round(current.get("wind", {}).get("speed", 0) * 3.6, 1),
        "pressure_hpa": current["main"].get("pressure", 1013),
        "feels_like": round(current["main"].get("feels_like", temp), 1),
    }
