import sqlite3
from datetime import date
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from ..core.security import get_current_user_id
from ..db.database import get_db
from ..services.health_platform_service import HealthPlatformService

router = APIRouter(tags=["health-dashboard"])
_svc = HealthPlatformService()


class ProfilePatch(BaseModel):
    age: int | None = Field(default=None, ge=5, le=120)
    height_cm: float | None = Field(default=None, ge=50, le=260)
    weight_kg: float | None = Field(default=None, ge=20, le=400)


class DailyPatch(BaseModel):
    water_ml: int | None = Field(default=None, ge=0, le=20000)
    sleep_hours: float | None = Field(default=None, ge=0, le=24)
    calories: int | None = Field(default=None, ge=0, le=20000)


class HealthPostBody(BaseModel):
    profile: ProfilePatch | None = None
    daily: DailyPatch | None = None


@router.get("/health")
def get_health_dashboard(
    user_id: Annotated[int, Depends(get_current_user_id)],
    conn: Annotated[sqlite3.Connection, Depends(get_db)],
):
    snap = _svc.snapshot(conn, user_id)
    return {
        "profile": snap.profile,
        "today": snap.today,
        "weekly": snap.weekly,
        "health_score": snap.health_score,
    }


@router.post("/health")
def post_health_dashboard(
    body: HealthPostBody,
    user_id: Annotated[int, Depends(get_current_user_id)],
    conn: Annotated[sqlite3.Connection, Depends(get_db)],
):
    if body.profile:
        existing = _svc.get_profile(conn, user_id)
        age = body.profile.age if body.profile.age is not None else existing.get("age")
        h = body.profile.height_cm if body.profile.height_cm is not None else existing.get("height_cm")
        w = body.profile.weight_kg if body.profile.weight_kg is not None else existing.get("weight_kg")
        _svc.upsert_profile(conn, user_id, age, h, w)

    if body.daily:
        day = date.today().isoformat()
        _svc.upsert_daily(
            conn,
            user_id,
            day,
            water_ml=body.daily.water_ml,
            sleep_hours=body.daily.sleep_hours,
            calories=body.daily.calories,
        )

    snap = _svc.snapshot(conn, user_id)
    return {
        "profile": snap.profile,
        "today": snap.today,
        "weekly": snap.weekly,
        "health_score": snap.health_score,
    }
