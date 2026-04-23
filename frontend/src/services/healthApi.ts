import { apiFetch } from './apiClient'

export type HealthProfile = {
  age: number | null
  height_cm: number | null
  weight_kg: number | null
  bmi: number | null
}

export type HealthDaily = {
  date: string
  water_ml: number
  sleep_hours: number
  calories: number
}

export type HealthWeeklyRow = {
  date: string
  water_ml: number
  sleep_hours: number
  calories: number
}

export type HealthDashboardPayload = {
  profile: HealthProfile
  today: HealthDaily | null
  weekly: HealthWeeklyRow[]
  health_score: number
}

export async function getHealthDashboard(): Promise<HealthDashboardPayload> {
  const res = await apiFetch('/api/health')
  if (!res.ok) {
    const t = await res.text()
    throw new Error(t || `Failed to load health (${res.status})`)
  }
  return res.json() as Promise<HealthDashboardPayload>
}

export async function saveHealthDashboard(body: {
  profile?: { age?: number; height_cm?: number; weight_kg?: number }
  daily?: { water_ml?: number; sleep_hours?: number; calories?: number }
}): Promise<HealthDashboardPayload> {
  const res = await apiFetch('/api/health', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(t || `Failed to save (${res.status})`)
  }
  return res.json() as Promise<HealthDashboardPayload>
}
