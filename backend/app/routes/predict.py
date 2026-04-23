from pydantic import BaseModel, Field

from fastapi import APIRouter

from ..ml.symptom_predictor import predict

router = APIRouter(tags=["symptom-prediction"])


class PredictBody(BaseModel):
    symptoms: list[str] = Field(min_length=1, max_length=40)


@router.post("/predict")
def predict_symptoms(body: PredictBody):
    p = predict(body.symptoms)
    return {
        "disease": p.disease,
        "risk": p.risk,
        "confidence": p.confidence,
        "disclaimer": "This is not a medical diagnosis. Consult a doctor.",
    }
