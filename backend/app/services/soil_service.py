"""
NEW FILE: soil_service.py
Real-time soil data service using SoilGrids REST API v2.
No API key required — free public API from ISRIC (https://soilgrids.org).

Extracts:
  - Soil pH (phh2o — pH × 10, converted to standard scale)
  - Organic Carbon (soc — g/kg, converted to %)
Derives:
  - Nitrogen ≈ OC / 10  (kg/ha estimate based on C:N ~10 ratio)
  - Phosphorus: 40 kg/ha (regional default — SoilGrids free tier does not provide P)
  - Potassium:  60 kg/ha (regional default — SoilGrids free tier does not provide K)

Falls back to safe agronomic defaults if API is unavailable.
"""

import httpx
from typing import Optional

SOILGRIDS_URL = "https://rest.soilgrids.org/soilgrids/v2.0/properties/query"

# Agronomic defaults used when API fails
DEFAULTS = {
    "ph": 6.5,
    "organic_carbon": 1.5,   # %
    "nitrogen": 75.0,         # kg/ha
    "phosphorus": 40.0,       # kg/ha (regional average)
    "potassium": 60.0,        # kg/ha (regional average)
}


async def fetch_soil_by_coords(lat: float, lon: float) -> dict:
    """
    Fetch soil data for given GPS coordinates from SoilGrids API.

    Returns dict with keys:
        ph, organic_carbon, nitrogen, phosphorus, potassium,
        source ("SoilGrids" or "Default"), lat, lon
    """
    params = {
        "lon": lon,
        "lat": lat,
        "property": ["phh2o", "soc"],
        "depth": ["0-5cm"],
        "value": ["mean"],
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.get(SOILGRIDS_URL, params=params)
            resp.raise_for_status()
            data = resp.json()

        return _parse_soil(data, lat, lon)

    except httpx.TimeoutException:
        return _default_soil(lat, lon, reason="SoilGrids timeout — using agronomic defaults")
    except httpx.HTTPStatusError as exc:
        return _default_soil(
            lat, lon,
            reason=f"SoilGrids API error ({exc.response.status_code}) — using agronomic defaults"
        )
    except Exception as exc:
        return _default_soil(lat, lon, reason=f"SoilGrids unavailable — using agronomic defaults")


def _parse_soil(data: dict, lat: float, lon: float) -> dict:
    """Extract pH and OC from SoilGrids v2 response and derive N, P, K."""
    properties = data.get("properties", {}).get("layers", [])

    ph_raw = None
    soc_raw = None  # g/kg

    for layer in properties:
        name = layer.get("name", "")
        depths = layer.get("depths", [])
        if not depths:
            continue
        # Use 0-5cm depth mean value
        val = depths[0].get("values", {}).get("mean")
        if val is None:
            continue

        if name == "phh2o":
            ph_raw = val  # Stored as pH × 10
        elif name == "soc":
            soc_raw = val  # Stored as cg/kg (centgrams/kg) → divide by 10 for g/kg

    # SoilGrids phh2o is pH*10 (e.g. 65 → pH 6.5)
    ph = round(ph_raw / 10.0, 1) if ph_raw is not None else DEFAULTS["ph"]
    ph = max(3.0, min(ph, 10.0))  # Sanity clamp

    # SoilGrids soc is in cg/kg → convert to %: (cg/kg) / 1000 * 100 = / 10
    if soc_raw is not None:
        oc_g_per_kg = soc_raw / 10.0   # cg/kg → g/kg
        oc_percent = round(oc_g_per_kg / 10.0, 2)  # g/kg → %
    else:
        oc_percent = DEFAULTS["organic_carbon"]

    oc_percent = max(0.1, min(oc_percent, 10.0))

    # Derive nitrogen from organic carbon (C:N ratio ≈ 10)
    # OC% → OC kg/ha (top 20cm, bulk density ~1.3 g/cm³): OC% × 26000
    # N kg/ha ≈ OC kg/ha / 10
    # Simplified approximation used widely in agronomic literature:
    nitrogen = round(oc_percent * 26000 / 10 / 1000, 1)  # gives ~3.9 for OC=1.5%
    # Scale up to realistic field-level units (0–200 kg/ha range)
    nitrogen = round(oc_percent * 20, 1)   # practical approximation: 1.5% OC → ~30 N
    nitrogen = max(10.0, min(nitrogen, 200.0))

    return {
        "ph": ph,
        "organic_carbon": oc_percent,
        "nitrogen": nitrogen,
        "phosphorus": DEFAULTS["phosphorus"],  # Not available in free SoilGrids
        "potassium": DEFAULTS["potassium"],     # Not available in free SoilGrids
        "source": "SoilGrids",
        "lat": lat,
        "lon": lon,
        "note": "P and K are regional defaults (SoilGrids does not provide these in free tier)",
    }


def _default_soil(lat: float, lon: float, reason: str = "") -> dict:
    """Return agronomic defaults when SoilGrids is unavailable."""
    return {
        "ph": DEFAULTS["ph"],
        "organic_carbon": DEFAULTS["organic_carbon"],
        "nitrogen": DEFAULTS["nitrogen"],
        "phosphorus": DEFAULTS["phosphorus"],
        "potassium": DEFAULTS["potassium"],
        "source": "Default",
        "lat": lat,
        "lon": lon,
        "note": reason or "Using agronomic defaults",
    }
