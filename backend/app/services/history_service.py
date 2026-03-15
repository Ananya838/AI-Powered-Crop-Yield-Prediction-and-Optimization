from sqlalchemy import desc, func
from sqlalchemy.orm import Session

from app.db.models import PredictionRecord
from app.models.schemas import DashboardResponse, PredictionDashboardStats, PredictionHistoryItem


def save_prediction_record(db: Session, request, response) -> PredictionRecord:
    record = PredictionRecord(
        crop_type=request.crop_type.lower(),
        season=request.season,
        area_hectares=request.area_hectares,
        nitrogen=request.soil.nitrogen,
        phosphorus=request.soil.phosphorus,
        potassium=request.soil.potassium,
        ph=request.soil.ph,
        organic_carbon=request.soil.organic_carbon,
        temperature=request.weather.temperature,
        rainfall=request.weather.rainfall,
        humidity=request.weather.humidity,
        sunshine_hours=request.weather.sunshine_hours,
        predicted_yield_kg_per_ha=response.predicted_yield_kg_per_ha,
        total_predicted_yield_kg=response.total_predicted_yield_kg,
        confidence_score=response.confidence_score,
        yield_category=response.yield_category,
        model_used=response.model_used,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def get_dashboard_data(db: Session, limit: int = 10) -> DashboardResponse:
    recent_records = (
        db.query(PredictionRecord)
        .order_by(desc(PredictionRecord.created_at))
        .limit(limit)
        .all()
    )

    total_predictions = db.query(func.count(PredictionRecord.id)).scalar() or 0
    avg_yield = db.query(func.avg(PredictionRecord.predicted_yield_kg_per_ha)).scalar() or 0.0
    total_area = db.query(func.sum(PredictionRecord.area_hectares)).scalar() or 0.0
    avg_confidence = db.query(func.avg(PredictionRecord.confidence_score)).scalar() or 0.0

    crop_rows = (
        db.query(
            PredictionRecord.crop_type,
            func.avg(PredictionRecord.predicted_yield_kg_per_ha).label("avg_yield"),
        )
        .group_by(PredictionRecord.crop_type)
        .order_by(desc("avg_yield"))
        .limit(8)
        .all()
    )

    soil_avgs = db.query(
        func.avg(PredictionRecord.nitrogen),
        func.avg(PredictionRecord.phosphorus),
        func.avg(PredictionRecord.potassium),
        func.avg(PredictionRecord.organic_carbon),
        func.avg(PredictionRecord.ph),
    ).one()

    history = [
        PredictionHistoryItem(
            id=record.id,
            date=record.created_at.isoformat(),
            crop=record.crop_type,
            season=record.season,
            yield_kg_per_ha=round(record.predicted_yield_kg_per_ha, 2),
            area_hectares=round(record.area_hectares, 2),
            total_yield_kg=round(record.total_predicted_yield_kg, 2),
            confidence_score=round(record.confidence_score, 4),
            model_used=record.model_used,
        )
        for record in recent_records
    ]

    crop_yields = [
        {"crop": row.crop_type.capitalize(), "yield": round(row.avg_yield, 2)}
        for row in crop_rows
    ]

    soil_profile = [
        {"subject": "Nitrogen", "value": round(soil_avgs[0] or 0, 2), "fullMark": 200},
        {"subject": "Phosphorus", "value": round(soil_avgs[1] or 0, 2), "fullMark": 150},
        {"subject": "Potassium", "value": round(soil_avgs[2] or 0, 2), "fullMark": 200},
        {"subject": "Org Carbon", "value": round((soil_avgs[3] or 0) * 10, 2), "fullMark": 100},
        {"subject": "pH Score", "value": round(max(0, min(100, (soil_avgs[4] or 0) / 14 * 100)), 2), "fullMark": 100},
    ]

    return DashboardResponse(
        stats=PredictionDashboardStats(
            total_predictions=total_predictions,
            average_yield_kg_per_ha=round(avg_yield, 2),
            total_area_hectares=round(total_area, 2),
            average_confidence_score=round(avg_confidence, 4),
        ),
        crop_yields=crop_yields,
        soil_profile=soil_profile,
        recent_predictions=history,
    )
