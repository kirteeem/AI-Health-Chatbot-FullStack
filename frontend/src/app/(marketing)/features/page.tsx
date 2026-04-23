import { BrainCircuit, FileText, Gauge, Languages, Lock, ShieldCheck } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card'

const items = [
  { icon: <BrainCircuit className="h-5 w-5 text-accent" />, title: 'RAG pipeline', desc: 'Hybrid retrieval + grounded answers with citations.' },
  { icon: <ShieldCheck className="h-5 w-5 text-accent" />, title: 'Triage signals', desc: 'Risk cues and urgency hints to guide next steps.' },
  { icon: <Lock className="h-5 w-5 text-accent" />, title: 'Prompt safety', desc: 'Guardrails to reduce unsafe or irrelevant output.' },
  { icon: <Gauge className="h-5 w-5 text-accent" />, title: 'Fast UX', desc: 'Smooth transitions, responsive layouts, optimized rendering.' },
  { icon: <Languages className="h-5 w-5 text-accent" />, title: 'Multilingual-ready', desc: 'Scaffolding for detection and translation workflows.' },
  { icon: <FileText className="h-5 w-5 text-accent" />, title: 'Evidence excerpts', desc: 'Surface supporting snippets for transparency.' },
]

export default function FeaturesPage() {
  return (
    <div className="container-pro py-12 md:py-16">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Features</h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          A modern, professional UI/UX upgrade inspired by SaaS dashboards—while keeping the existing chat and admin
          flows intact.
        </p>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((x) => (
          <Card key={x.title} className="transition hover:-translate-y-0.5 hover:shadow-soft">
            <CardHeader>
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-surface/55">
                {x.icon}
              </div>
              <CardTitle>{x.title}</CardTitle>
              <CardDescription>{x.desc}</CardDescription>
            </CardHeader>
            <CardContent />
          </Card>
        ))}
      </div>
    </div>
  )
}

