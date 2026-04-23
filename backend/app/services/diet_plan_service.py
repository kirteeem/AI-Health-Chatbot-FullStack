from __future__ import annotations

from dataclasses import dataclass


@dataclass
class PlanResult:
    bmi: float
    calories: int
    diet: list[str]
    workout: list[str]


def _bmi(weight_kg: float, height_cm: float) -> float:
    h = height_cm / 100.0
    return round(weight_kg / (h * h), 1)


def _bmr_mifflin(weight_kg: float, height_cm: float, age: int) -> float:
    # sex-neutral average (kcal/day)
    return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5


def build_plan(age: int, weight_kg: float, height_cm: int | float, goal: str) -> PlanResult:
    bmi = _bmi(weight_kg, float(height_cm))
    bmr = _bmr_mifflin(weight_kg, float(height_cm), age)
    tdee = int(round(bmr * 1.375))

    g = goal.strip().lower()
    if "loss" in g or "lose" in g:
        target = max(1200, tdee - 450)
        diet = [
            "Breakfast: Greek yogurt, berries, chia",
            "Lunch: Grilled chicken salad, olive oil vinaigrette",
            "Dinner: Baked fish, steamed vegetables, quinoa",
        ]
        workout = ["Brisk walking 35 min", "Circuit bodyweight 20 min", "Core plank series"]
    elif "muscle" in g or "gain" in g:
        target = tdee + 300
        diet = [
            "Breakfast: Oats, eggs, banana, milk",
            "Lunch: Rice bowl, lean beef/tofu, greens",
            "Dinner: Salmon or lentils, sweet potato, broccoli",
        ]
        workout = ["Pushups + rows supersets", "Squats + lunges", "Farmer carries", "Protein-focused hydration"]
    else:
        target = tdee
        diet = [
            "Breakfast: Whole-grain toast, avocado, egg",
            "Lunch: Mixed grain bowl with beans and vegetables",
            "Dinner: Turkey or chickpea stew, side salad",
        ]
        workout = ["Yoga flow 25 min", "Light jogging 20 min", "Mobility drills"]

    # Compact list for API contract compatibility
    compact = [
        diet[0].split(":")[-1].strip(),
        diet[1].split(":")[-1].strip(),
        diet[2].split(":")[-1].strip(),
    ]
    wo_short = [w.split(",")[0].strip() for w in workout[:4]]

    return PlanResult(bmi=bmi, calories=int(target), diet=compact, workout=wo_short)
