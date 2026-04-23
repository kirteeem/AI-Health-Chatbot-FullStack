'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Apple, Dumbbell } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Input } from '../../../components/ui/Input'
import { useToast } from '../../../components/ui/Toast'
import type { PlanResponse } from '../../../services/planApi'
import { createPlan } from '../../../services/planApi'

const GOALS = [
  { value: 'Weight Loss', api: 'weight loss' },
  { value: 'Muscle Gain', api: 'muscle gain' },
  { value: 'Maintain', api: 'maintain weight' },
]

export default function PlannerPage() {
  const { toast } = useToast()
  const [age, setAge] = useState('30')
  const [weight, setWeight] = useState('70')
  const [height, setHeight] = useState('175')
  const [goal, setGoal] = useState(GOALS[0].api)
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState<PlanResponse | null>(null)

  const onSubmit = async () => {
    const a = parseInt(age, 10)
    const w = parseFloat(weight)
    const h = parseFloat(height)
    if (Number.isNaN(a) || Number.isNaN(w) || Number.isNaN(h)) {
      toast({ type: 'error', title: 'Invalid input', description: 'Enter valid age, weight, and height.' })
      return
    }
    setLoading(true)
    setPlan(null)
    try {
      const p = await createPlan({ age: a, weight: w, height: h, goal })
      setPlan(p)
    } catch (e) {
      toast({
        type: 'error',
        title: 'Could not build plan',
        description: e instanceof Error ? e.message : 'Try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Diet & workout planner</h1>
        <p className="text-sm text-muted">BMI, estimated calories, and sample meals and training blocks.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[0.9fr,1.1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Your inputs</CardTitle>
            <CardDescription>Height in cm, weight in kg.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Age" type="number" min={14} max={90} value={age} onChange={(e) => setAge(e.target.value)} />
              <Input label="Weight (kg)" type="number" min={30} step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
              <Input label="Height (cm)" type="number" min={120} max={230} step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-fg">Goal</p>
              <div className="flex flex-wrap gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGoal(g.api)}
                    className={[
                      'rounded-2xl border px-3 py-2 text-sm font-medium transition',
                      goal === g.api
                        ? 'border-accent/60 bg-accent/15 text-fg'
                        : 'border-border/60 bg-surface/35 text-muted hover:text-fg',
                    ].join(' ')}
                  >
                    {g.value}
                  </button>
                ))}
              </div>
            </div>
            <Button isLoading={loading} onClick={onSubmit}>
              Generate plan
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {!plan && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted">Run the planner to see BMI, calories, diet, and workouts.</CardContent>
            </Card>
          )}
          {plan && (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">BMI</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-semibold tabular-nums">{plan.bmi}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Target calories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-semibold tabular-nums">{plan.calories}</p>
                    <p className="mt-1 text-xs text-muted">kcal / day (estimate)</p>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-surface/55">
                    <Apple className="h-5 w-5 text-accent" />
                  </div>
                  <CardTitle>Diet ideas</CardTitle>
                  <CardDescription>Breakfast / lunch / dinner style suggestions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="list-inside list-disc space-y-2 text-sm text-muted">
                    {plan.diet.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-surface/55">
                    <Dumbbell className="h-5 w-5 text-accent" />
                  </div>
                  <CardTitle>Workout ideas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-inside list-disc space-y-2 text-sm text-muted">
                    {plan.workout.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              {plan.disclaimer && <p className="text-xs text-muted">{plan.disclaimer}</p>}
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
