from pydantic import BaseModel, Field, field_validator

from fastapi import APIRouter, HTTPException

from ..services.diet_plan_service import build_plan

router = APIRouter(tags=["planner"])


class PlanBody(BaseModel):
    age: int = Field(ge=14, le=90)
    weight: float = Field(ge=30, le=250, description="Weight in kg")
    height: float = Field(ge=120, le=230, description="Height in cm")
    goal: str = Field(min_length=3, max_length=40)

    @field_validator("goal")
    @classmethod
    def strip_goal(cls, v: str) -> str:
        return v.strip()


@router.post("/plan")
def create_plan(body: PlanBody):
    try:
        plan = build_plan(body.age, body.weight, body.height, body.goal)
    except (ZeroDivisionError, ValueError):
        raise HTTPException(status_code=400, detail="Invalid height or weight for BMI calculation")
    return {
        "bmi": plan.bmi,
        "calories": plan.calories,
        "diet": plan.diet,
        "workout": plan.workout,
        "disclaimer": "Educational plan only — not personalized medical nutrition advice.",
    }
