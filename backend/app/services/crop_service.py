from app.models.schemas import CropInfo

CROP_DATABASE: dict[str, CropInfo] = {
    "rice": CropInfo(
        name="Rice", season="Kharif",
        ideal_temperature_min=20, ideal_temperature_max=35,
        ideal_rainfall_min=1000, ideal_rainfall_max=2000,
        ideal_ph_min=5.5, ideal_ph_max=7.0,
        average_yield_kg_per_ha=4200,
        description="Staple crop requiring high water. Suitable for tropical and subtropical regions.",
    ),
    "wheat": CropInfo(
        name="Wheat", season="Rabi",
        ideal_temperature_min=10, ideal_temperature_max=25,
        ideal_rainfall_min=400, ideal_rainfall_max=1200,
        ideal_ph_min=6.0, ideal_ph_max=7.5,
        average_yield_kg_per_ha=3500,
        description="Cool-season grain crop. One of the world's most important food crops.",
    ),
    "maize": CropInfo(
        name="Maize", season="Kharif",
        ideal_temperature_min=18, ideal_temperature_max=35,
        ideal_rainfall_min=500, ideal_rainfall_max=1500,
        ideal_ph_min=5.5, ideal_ph_max=7.5,
        average_yield_kg_per_ha=4800,
        description="Versatile crop used for food, feed, and industrial purposes.",
    ),
    "chickpea": CropInfo(
        name="Chickpea", season="Rabi",
        ideal_temperature_min=15, ideal_temperature_max=30,
        ideal_rainfall_min=300, ideal_rainfall_max=800,
        ideal_ph_min=6.0, ideal_ph_max=8.0,
        average_yield_kg_per_ha=1500,
        description="Drought-tolerant legume rich in protein. Fixes nitrogen in soil.",
    ),
    "cotton": CropInfo(
        name="Cotton", season="Kharif",
        ideal_temperature_min=24, ideal_temperature_max=37,
        ideal_rainfall_min=600, ideal_rainfall_max=1200,
        ideal_ph_min=6.0, ideal_ph_max=7.5,
        average_yield_kg_per_ha=1800,
        description="Cash crop used for fiber. Requires warm temperatures and ample sunlight.",
    ),
    "mungbean": CropInfo(
        name="Mung Bean", season="Kharif",
        ideal_temperature_min=18, ideal_temperature_max=30,
        ideal_rainfall_min=600, ideal_rainfall_max=1100,
        ideal_ph_min=5.5, ideal_ph_max=7.0,
        average_yield_kg_per_ha=1100,
        description="Short-duration legume. Improves soil fertility through nitrogen fixation.",
    ),
    "banana": CropInfo(
        name="Banana", season="Zaid",
        ideal_temperature_min=20, ideal_temperature_max=35,
        ideal_rainfall_min=1200, ideal_rainfall_max=2500,
        ideal_ph_min=5.5, ideal_ph_max=7.0,
        average_yield_kg_per_ha=20000,
        description="Tropical fruit crop with high water requirement. Year-round fruiting.",
    ),
    "coffee": CropInfo(
        name="Coffee", season="Kharif",
        ideal_temperature_min=15, ideal_temperature_max=28,
        ideal_rainfall_min=1200, ideal_rainfall_max=2500,
        ideal_ph_min=6.0, ideal_ph_max=6.5,
        average_yield_kg_per_ha=900,
        description="Perennial cash crop grown in tropical highlands. Needs shade and moisture.",
    ),
}


def get_all_crops() -> list[CropInfo]:
    return list(CROP_DATABASE.values())


def get_crop_by_name(name: str) -> CropInfo | None:
    return CROP_DATABASE.get(name.lower())


def get_crop_names() -> list[str]:
    return list(CROP_DATABASE.keys())
