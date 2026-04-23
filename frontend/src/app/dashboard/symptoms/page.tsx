'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, Stethoscope } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Input } from '../../../components/ui/Input'
import { useToast } from '../../../components/ui/Toast'
import type { PredictResponse } from '../../../services/predictApi'
import { predictSymptoms } from '../../../services/predictApi'

const SUGGESTED_SYMPTOMS = [
  'fever',
  'chills',
  'body aches',
  'fatigue',
  'headache',
  'runny nose',
  'sore throat',
  'sneezing',
  'cough',
  'neck pain',
  'stress',
  'nausea',
  'vomiting',
  'diarrhea',
  'stomach pain',
  'itchy eyes',
  'anxiety',
  'palpitations',
  'chest tightness',
  'sensitivity to light',
  'dizziness',
  'dry mouth',
]

export default function SymptomCheckerPage() {
  const { toast } = useToast()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [custom, setCustom] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictResponse | null>(null)

  const toggle = (s: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      return next
    })
  }

  const symptomsPayload = useMemo(() => {
    const parts = Array.from(selected)
    if (custom.trim()) {
      custom
        .split(',')
        .map((x) => x.trim())
        .filter(Boolean)
        .forEach((x) => parts.push(x))
    }
    return parts
  }, [selected, custom])

  const onSubmit = async () => {
    if (symptomsPayload.length === 0) {
      toast({ type: 'info', title: 'Add symptoms', description: 'Select at least one symptom or enter custom text.' })
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const r = await predictSymptoms(symptomsPayload)
      setResult(r)
    } catch (e) {
      toast({
        type: 'error',
        title: 'Prediction failed',
        description: e instanceof Error ? e.message : 'Try again.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Symptom checker</h1>
        <p className="text-sm text-muted">Multi-select common symptoms, add your own, then run risk-style prediction.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <Card>
          <CardHeader>
            <div className="mb-2 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-surface/55">
              <Stethoscope className="h-5 w-5 text-accent" />
            </div>
            <CardTitle>Your symptoms</CardTitle>
            <CardDescription>Tap to toggle. Comma-separate extra symptoms in the field below.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SYMPTOMS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggle(s)}
                  className={[
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition',
                    selected.has(s)
                      ? 'border-accent/60 bg-accent/15 text-fg'
                      : 'border-border/60 bg-surface/35 text-muted hover:border-border hover:text-fg',
                  ].join(' ')}
                >
                  {s}
                </button>
              ))}
            </div>
            <Input
              label="Additional symptoms"
              placeholder="e.g. ear pain, rash"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
            />
            <Button className="w-full sm:w-auto" isLoading={loading} onClick={onSubmit}>
              Analyze
            </Button>
            <div className="flex gap-2 rounded-2xl border border-amber-500/35 bg-amber-500/10 p-3 text-xs text-amber-100">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <p>This is not a medical diagnosis. Consult a doctor for any health concern.</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
            <CardDescription>Educational demo output only.</CardDescription>
          </CardHeader>
          <CardContent>
            {!result && <p className="text-sm text-muted">Submit symptoms to see disease, risk, and confidence.</p>}
            {result && (
              <div className="space-y-4">
                <div className="glass rounded-2xl p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted">Likely pattern</p>
                  <p className="mt-1 text-lg font-semibold">{result.disease}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted">Risk</p>
                      <p className="font-semibold">{result.risk}</p>
                    </div>
                    <div>
                      <p className="text-muted">Confidence</p>
                      <p className="font-semibold">{result.confidence}</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted">{result.disclaimer}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
