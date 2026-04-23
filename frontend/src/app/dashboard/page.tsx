'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, Droplets, Flame, Moon, Scale, User } from 'lucide-react'

import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Loader } from '../../components/ui/Loader'
import { useToast } from '../../components/ui/Toast'
import type { HealthDashboardPayload } from '../../services/healthApi'
import { getHealthDashboard, saveHealthDashboard } from '../../services/healthApi'

function formatDayLabel(iso: string) {
  const d = new Date(iso + 'T12:00:00')
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export default function DashboardPage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<HealthDashboardPayload | null>(null)

  const [age, setAge] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [waterMl, setWaterMl] = useState('')
  const [sleepH, setSleepH] = useState('')
  const [calories, setCalories] = useState('')

  const hydrate = useCallback((p: HealthDashboardPayload) => {
    setData(p)
    const { profile, today } = p
    setAge(profile.age != null ? String(profile.age) : '')
    setHeightCm(profile.height_cm != null ? String(profile.height_cm) : '')
    setWeightKg(profile.weight_kg != null ? String(profile.weight_kg) : '')
    setWaterMl(today?.water_ml != null ? String(today.water_ml) : '')
    setSleepH(today?.sleep_hours != null ? String(today.sleep_hours) : '')
    setCalories(today?.calories != null ? String(today.calories) : '')
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const d = await getHealthDashboard()
        if (!cancelled) hydrate(d)
      } catch (e) {
        if (!cancelled) {
          toast({
            type: 'error',
            title: 'Could not load health data',
            description: e instanceof Error ? e.message : 'Try again.',
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [hydrate, toast])

  const onSaveAll = async () => {
    setSaving(true)
    try {
      const profile: { age?: number; height_cm?: number; weight_kg?: number } = {}
      if (age.trim()) profile.age = parseInt(age, 10)
      if (heightCm.trim()) profile.height_cm = parseFloat(heightCm)
      if (weightKg.trim()) profile.weight_kg = parseFloat(weightKg)

      const daily: { water_ml?: number; sleep_hours?: number; calories?: number } = {}
      if (waterMl.trim()) daily.water_ml = parseInt(waterMl, 10)
      if (sleepH.trim()) daily.sleep_hours = parseFloat(sleepH)
      if (calories.trim()) daily.calories = parseInt(calories, 10)

      const next = await saveHealthDashboard({
        profile: Object.keys(profile).length ? profile : undefined,
        daily: Object.keys(daily).length ? daily : undefined,
      })
      hydrate(next)
      toast({ type: 'success', title: 'Saved', description: 'Your health snapshot is updated.' })
    } catch (e) {
      toast({
        type: 'error',
        title: 'Save failed',
        description: e instanceof Error ? e.message : 'Check your inputs.',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader />
      </div>
    )
  }

  const chartRows =
    data?.weekly.map((r) => ({
      label: formatDayLabel(r.date),
      water: r.water_ml,
      sleep: r.sleep_hours,
      calories: r.calories,
    })) ?? []

  const score = data?.health_score ?? 0
  const bmi = data?.profile?.bmi

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Health dashboard</h1>
        <p className="text-sm text-muted">Profile, daily habits, trends, and your AI health score.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="transition hover:-translate-y-0.5 hover:shadow-soft">
          <CardHeader className="pb-2">
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-surface/55">
              <Activity className="h-5 w-5 text-accent" />
            </div>
            <CardTitle className="text-base">Health score</CardTitle>
            <CardDescription>0–100 composite</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{score}</p>
          </CardContent>
        </Card>
        <Card className="transition hover:-translate-y-0.5 hover:shadow-soft">
          <CardHeader className="pb-2">
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-surface/55">
              <Scale className="h-5 w-5 text-accent" />
            </div>
            <CardTitle className="text-base">BMI</CardTitle>
            <CardDescription>From height & weight</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{bmi != null ? bmi : '—'}</p>
          </CardContent>
        </Card>
        <Card className="transition hover:-translate-y-0.5 hover:shadow-soft">
          <CardHeader className="pb-2">
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-surface/55">
              <Droplets className="h-5 w-5 text-accent" />
            </div>
            <CardTitle className="text-base">Water today</CardTitle>
            <CardDescription>Milliliters</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{data?.today?.water_ml ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="transition hover:-translate-y-0.5 hover:shadow-soft">
          <CardHeader className="pb-2">
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-surface/55">
              <Moon className="h-5 w-5 text-accent" />
            </div>
            <CardTitle className="text-base">Sleep today</CardTitle>
            <CardDescription>Hours</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold tabular-nums">{data?.today?.sleep_hours ?? 0}</p>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr,1.1fr]">
        <Card>
          <CardHeader>
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-surface/55">
              <User className="h-5 w-5 text-accent" />
            </div>
            <CardTitle>Profile & daily inputs</CardTitle>
            <CardDescription>Save updates your snapshot and score.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Age" type="number" min={5} max={120} value={age} onChange={(e) => setAge(e.target.value)} />
              <Input
                label="Height (cm)"
                type="number"
                min={50}
                max={260}
                step="0.1"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
              />
              <Input
                label="Weight (kg)"
                type="number"
                min={20}
                max={400}
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Water (ml)" type="number" min={0} value={waterMl} onChange={(e) => setWaterMl(e.target.value)} />
              <Input label="Sleep (hours)" type="number" min={0} max={24} step="0.25" value={sleepH} onChange={(e) => setSleepH(e.target.value)} />
              <Input label="Calories" type="number" min={0} value={calories} onChange={(e) => setCalories(e.target.value)} />
            </div>
            <Button className="w-full sm:w-auto" isLoading={saving} onClick={onSaveAll}>
              Save changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-surface/55">
              <Flame className="h-5 w-5 text-accent" />
            </div>
            <CardTitle>Weekly trends</CardTitle>
            <CardDescription>Last 7 days — separate scales for clarity.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {chartRows.length > 0 ? (
              <>
                <div>
                  <p className="mb-1 text-xs font-medium text-muted">Water (ml)</p>
                  <div className="h-[100px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartRows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border) / 0.45)" />
                        <XAxis dataKey="label" tick={{ fill: 'rgb(var(--muted))', fontSize: 10 }} />
                        <YAxis tick={{ fill: 'rgb(var(--muted))', fontSize: 10 }} width={32} />
                        <Tooltip
                          contentStyle={{
                            background: 'rgb(var(--surface) / 0.95)',
                            border: '1px solid rgb(var(--border) / 0.6)',
                            borderRadius: 12,
                          }}
                        />
                        <Line type="monotone" dataKey="water" stroke="#38bdf8" strokeWidth={2} dot={false} name="ml" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-muted">Sleep (hours)</p>
                  <div className="h-[100px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartRows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border) / 0.45)" />
                        <XAxis dataKey="label" tick={{ fill: 'rgb(var(--muted))', fontSize: 10 }} />
                        <YAxis tick={{ fill: 'rgb(var(--muted))', fontSize: 10 }} width={32} />
                        <Tooltip
                          contentStyle={{
                            background: 'rgb(var(--surface) / 0.95)',
                            border: '1px solid rgb(var(--border) / 0.6)',
                            borderRadius: 12,
                          }}
                        />
                        <Line type="monotone" dataKey="sleep" stroke="#a78bfa" strokeWidth={2} dot={false} name="h" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div>
                  <p className="mb-1 text-xs font-medium text-muted">Calories</p>
                  <div className="h-[100px] w-full min-w-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartRows} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--border) / 0.45)" />
                        <XAxis dataKey="label" tick={{ fill: 'rgb(var(--muted))', fontSize: 10 }} />
                        <YAxis tick={{ fill: 'rgb(var(--muted))', fontSize: 10 }} width={36} />
                        <Tooltip
                          contentStyle={{
                            background: 'rgb(var(--surface) / 0.95)',
                            border: '1px solid rgb(var(--border) / 0.6)',
                            borderRadius: 12,
                          }}
                        />
                        <Line type="monotone" dataKey="calories" stroke="#f472b6" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted">No trend data yet — log a few days to see charts.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
