'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Input } from '../../../components/ui/Input'
import { Loader } from '../../../components/ui/Loader'
import { useToast } from '../../../components/ui/Toast'
import { getHealthDashboard, saveHealthDashboard } from '../../../services/healthApi'

export default function ProfilePage() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [age, setAge] = useState('')
  const [heightCm, setHeightCm] = useState('')
  const [weightKg, setWeightKg] = useState('')

  const load = useCallback(async () => {
    try {
      const d = await getHealthDashboard()
      const p = d.profile
      setAge(p.age != null ? String(p.age) : '')
      setHeightCm(p.height_cm != null ? String(p.height_cm) : '')
      setWeightKg(p.weight_kg != null ? String(p.weight_kg) : '')
    } catch (e) {
      toast({
        type: 'error',
        title: 'Could not load profile',
        description: e instanceof Error ? e.message : 'Try again.',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    load()
  }, [load])

  const onSave = async () => {
    setSaving(true)
    try {
      await saveHealthDashboard({
        profile: {
          ...(age.trim() ? { age: parseInt(age, 10) } : {}),
          ...(heightCm.trim() ? { height_cm: parseFloat(heightCm) } : {}),
          ...(weightKg.trim() ? { weight_kg: parseFloat(weightKg) } : {}),
        },
      })
      toast({ type: 'success', title: 'Profile saved' })
      await load()
    } catch (e) {
      toast({
        type: 'error',
        title: 'Save failed',
        description: e instanceof Error ? e.message : 'Check inputs.',
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

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-fg">
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>
      <header>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Profile</h1>
        <p className="mt-2 text-sm text-muted">Body metrics used for BMI and your health score.</p>
      </header>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>Body profile</CardTitle>
          <CardDescription>Age, height, and weight sync with the main dashboard.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Age" type="number" min={5} max={120} value={age} onChange={(e) => setAge(e.target.value)} />
          <Input label="Height (cm)" type="number" min={50} max={260} step="0.1" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
          <Input label="Weight (kg)" type="number" min={20} max={400} step="0.1" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
          <Button isLoading={saving} onClick={onSave}>
            Save profile
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
