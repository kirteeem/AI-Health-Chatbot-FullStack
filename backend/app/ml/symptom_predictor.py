"""
Lightweight symptom → condition scoring (simulates ensemble behavior without heavy ML deps).
Not a medical device — educational demo only.
"""

from __future__ import annotations

import hashlib
from dataclasses import dataclass


@dataclass
class PredictionResult:
    disease: str
    risk: str
    confidence: str


_RULES: list[tuple[str, set[str], str]] = [
    ("Influenza (Flu-like illness)", {"fever", "chills", "body aches", "fatigue", "headache"}, "high"),
    ("Common cold", {"runny nose", "sore throat", "sneezing", "cough"}, "low"),
    ("Tension headache", {"headache", "neck pain", "stress"}, "medium"),
    ("Gastroenteritis", {"nausea", "vomiting", "diarrhea", "stomach pain"}, "high"),
    ("Seasonal allergies", {"sneezing", "itchy eyes", "runny nose"}, "low"),
    ("Anxiety / stress reaction", {"anxiety", "palpitations", "chest tightness", "stress"}, "medium"),
    ("Migraine", {"headache", "nausea", "sensitivity to light"}, "medium"),
    ("Dehydration", {"dizziness", "fatigue", "dry mouth"}, "medium"),
]


def _normalize(symptoms: list[str]) -> set[str]:
    return {s.strip().lower() for s in symptoms if s and s.strip()}


def predict(symptoms: list[str]) -> PredictionResult:
    norm = _normalize(symptoms)
    if not norm:
        return PredictionResult(
            disease="Insufficient data",
            risk="Low",
            confidence="0%",
        )

    best_name = "Non-specific symptoms"
    best_hits = 0
    best_risk = "low"

    for name, keys, risk in _RULES:
        hits = len(keys & norm)
        if hits > best_hits:
            best_hits = hits
            best_name = name
            best_risk = risk

    if best_hits == 0:
        best_name = "Benign self-limited condition (non-specific)"
        best_risk = "low"

    seed = hashlib.sha256("|".join(sorted(norm)).encode()).hexdigest()
    jitter = int(seed[:2], 16) % 12
    base = 58 + min(30, best_hits * 9) + jitter
    conf = min(96, max(52, base))

    risk_out = best_risk.title()
    if best_hits <= 1 and len(norm) >= 4:
        risk_out = "Medium"

    return PredictionResult(disease=best_name, risk=risk_out, confidence=f"{conf}%")
