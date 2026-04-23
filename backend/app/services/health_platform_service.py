from __future__ import annotations

import sqlite3
from dataclasses import dataclass
from datetime import date, timedelta


def bmi_value(weight_kg: float, height_cm: float) -> float | None:
    if not height_cm or height_cm <= 0 or not weight_kg or weight_kg <= 0:
        return None
    h_m = height_cm / 100.0
    return round(weight_kg / (h_m * h_m), 1)


@dataclass
class HealthSnapshot:
    profile: dict
    today: dict | None
    weekly: list[dict]
    health_score: int


def _score_from_row(profile: dict, row: dict | None) -> float:
    score = 72.0
    w = profile.get("weight_kg")
    h = profile.get("height_cm")
    b = bmi_value(w or 0, h or 0)
    if b is not None:
        if 18.5 <= b <= 24.9:
            score += 8
        elif 25 <= b <= 29.9:
            score += 3
        else:
            score -= 4

    if not row:
        return max(0, min(100, score))

    sleep = float(row.get("sleep_hours") or 0)
    if 7 <= sleep <= 9:
        score += 8
    elif 6 <= sleep < 7 or 9 < sleep <= 10:
        score += 4
    elif sleep > 0:
        score += 1

    water = int(row.get("water_ml") or 0)
    if water >= 2500:
        score += 8
    elif water >= 1800:
        score += 5
    elif water >= 1200:
        score += 2

    cal = int(row.get("calories") or 0)
    if 1400 <= cal <= 2600:
        score += 6
    elif cal > 0:
        score += 2

    return max(0, min(100, score))


class HealthPlatformService:
    def get_profile(self, conn: sqlite3.Connection, user_id: int) -> dict:
        cur = conn.execute(
            "SELECT age, height_cm, weight_kg FROM user_profiles WHERE user_id = ?",
            (user_id,),
        )
        row = cur.fetchone()
        if not row:
            return {"age": None, "height_cm": None, "weight_kg": None, "bmi": None}
        age, height_cm, weight_kg = row["age"], row["height_cm"], row["weight_kg"]
        return {
            "age": age,
            "height_cm": height_cm,
            "weight_kg": weight_kg,
            "bmi": bmi_value(weight_kg or 0, height_cm or 0),
        }

    def upsert_profile(self, conn: sqlite3.Connection, user_id: int, age: int | None, height_cm: float | None, weight_kg: float | None) -> None:
        conn.execute(
            """
            INSERT INTO user_profiles (user_id, age, height_cm, weight_kg, updated_at)
            VALUES (?, ?, ?, ?, datetime('now'))
            ON CONFLICT(user_id) DO UPDATE SET
                age=excluded.age,
                height_cm=excluded.height_cm,
                weight_kg=excluded.weight_kg,
                updated_at=datetime('now')
            """,
            (user_id, age, height_cm, weight_kg),
        )

    def get_daily(self, conn: sqlite3.Connection, user_id: int, day: str) -> dict | None:
        cur = conn.execute(
            "SELECT day, water_ml, sleep_hours, calories FROM health_daily WHERE user_id = ? AND day = ?",
            (user_id, day),
        )
        row = cur.fetchone()
        if not row:
            return None
        return {
            "date": row["day"],
            "water_ml": row["water_ml"],
            "sleep_hours": row["sleep_hours"],
            "calories": row["calories"],
        }

    def upsert_daily(
        self,
        conn: sqlite3.Connection,
        user_id: int,
        day: str,
        water_ml: int | None = None,
        sleep_hours: float | None = None,
        calories: int | None = None,
    ) -> None:
        existing = self.get_daily(conn, user_id, day)
        w = water_ml if water_ml is not None else (existing or {}).get("water_ml", 0)
        s = sleep_hours if sleep_hours is not None else (existing or {}).get("sleep_hours", 0)
        c = calories if calories is not None else (existing or {}).get("calories", 0)
        conn.execute(
            """
            INSERT INTO health_daily (user_id, day, water_ml, sleep_hours, calories)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(user_id, day) DO UPDATE SET
                water_ml=excluded.water_ml,
                sleep_hours=excluded.sleep_hours,
                calories=excluded.calories
            """,
            (user_id, day, int(w or 0), float(s or 0), int(c or 0)),
        )

    def weekly_series(self, conn: sqlite3.Connection, user_id: int) -> list[dict]:
        end = date.today()
        start = end - timedelta(days=6)
        out: list[dict] = []
        cur = conn.execute(
            """
            SELECT day, water_ml, sleep_hours, calories
            FROM health_daily
            WHERE user_id = ? AND day >= ? AND day <= ?
            ORDER BY day ASC
            """,
            (user_id, start.isoformat(), end.isoformat()),
        )
        by_day = {r["day"]: dict(r) for r in cur.fetchall()}
        d = start
        while d <= end:
            key = d.isoformat()
            r = by_day.get(key)
            out.append(
                {
                    "date": key,
                    "water_ml": int(r["water_ml"]) if r else 0,
                    "sleep_hours": float(r["sleep_hours"]) if r else 0.0,
                    "calories": int(r["calories"]) if r else 0,
                }
            )
            d += timedelta(days=1)
        return out

    def snapshot(self, conn: sqlite3.Connection, user_id: int) -> HealthSnapshot:
        profile_row = self.get_profile(conn, user_id)
        today_key = date.today().isoformat()
        today = self.get_daily(conn, user_id, today_key)
        weekly = self.weekly_series(conn, user_id)
        today_for_score = today or {"sleep_hours": 0, "water_ml": 0, "calories": 0}
        score = int(round(_score_from_row(profile_row, today_for_score)))
        return HealthSnapshot(profile=profile_row, today=today, weekly=weekly, health_score=score)
