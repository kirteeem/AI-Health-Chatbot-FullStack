export type PlanResponse = {
  bmi: number
  calories: number
  diet: string[]
  workout: string[]
  disclaimer?: string
}

export async function createPlan(body: {
  age: number
  weight: number
  height: number
  goal: string
}): Promise<PlanResponse> {
  const res = await fetch('/api/plan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(t || `Plan failed (${res.status})`)
  }
  return res.json() as Promise<PlanResponse>
}
