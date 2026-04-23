export type PredictResponse = {
  disease: string
  risk: string
  confidence: string
  disclaimer?: string
}

export async function predictSymptoms(symptoms: string[]): Promise<PredictResponse> {
  const res = await fetch('/api/predict', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symptoms }),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(t || `Prediction failed (${res.status})`)
  }
  return res.json() as Promise<PredictResponse>
}
