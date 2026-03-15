from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.session import Base


class PredictionRecord(Base):
    __tablename__ = "prediction_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    crop_type: Mapped[str] = mapped_column(String(64), index=True)
    season: Mapped[str] = mapped_column(String(32), index=True)
    area_hectares: Mapped[float] = mapped_column(Float)

    nitrogen: Mapped[float] = mapped_column(Float)
    phosphorus: Mapped[float] = mapped_column(Float)
    potassium: Mapped[float] = mapped_column(Float)
    ph: Mapped[float] = mapped_column(Float)
    organic_carbon: Mapped[float] = mapped_column(Float)

    temperature: Mapped[float] = mapped_column(Float)
    rainfall: Mapped[float] = mapped_column(Float)
    humidity: Mapped[float] = mapped_column(Float)
    sunshine_hours: Mapped[float] = mapped_column(Float)

    predicted_yield_kg_per_ha: Mapped[float] = mapped_column(Float, index=True)
    total_predicted_yield_kg: Mapped[float] = mapped_column(Float)
    confidence_score: Mapped[float] = mapped_column(Float)
    yield_category: Mapped[str] = mapped_column(String(16))
    model_used: Mapped[str] = mapped_column(String(128))

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
