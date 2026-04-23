import Link from 'next/link'
import { ArrowRight, Bot, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/Card'

const features = [
  {
    icon: <Bot className="h-5 w-5 text-accent" />,
    title: 'RAG-powered answers',
    desc: 'Grounded responses with citations from your healthcare knowledge base.',
  },
  {
    icon: <Stethoscope className="h-5 w-5 text-accent" />,
    title: 'Symptom triage signals',
    desc: 'Risk-level cues and specialist recommendations to guide next steps.',
  },
  {
    icon: <ShieldCheck className="h-5 w-5 text-accent" />,
    title: 'Safety-first UX',
    desc: 'Clear medical disclaimers, input validation, and guardrails by design.',
  },
]

const steps = [
  { title: 'Describe symptoms', desc: 'Type your symptoms or health question in natural language.' },
  { title: 'Get guided response', desc: 'Receive an answer with helpful context and triage cues.' },
  { title: 'Review citations', desc: 'Check sources and excerpts used to generate the response.' },
]

export default function LandingPage() {
  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="container-pro py-14 md:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-surface/30 px-3 py-1 text-xs font-semibold text-muted">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                Modern AI healthcare assistant
              </p>
              <h1 className="mt-5 text-4xl font-semibold tracking-tight md:text-5xl">
                Clinical-style guidance with a{' '}
                <span className="text-accent">professional</span> chat experience.
              </h1>
              <p className="mt-4 text-base leading-7 text-muted">
                A clean, responsive SaaS UI for symptom discussions, triage signals, and source citations—built for
                speed and clarity.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link href="/dashboard/chat" className="w-full sm:w-auto">
                  <Button className="w-full">
                    Open Chat <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/features" className="w-full sm:w-auto">
                  <Button variant="secondary" className="w-full">
                    Learn More
                  </Button>
                </Link>
              </div>

              <p className="mt-4 text-xs text-muted">
                Educational use only. Not medical advice.
              </p>
            </div>

            <div className="relative">
              <div className="glass rounded-2xl p-5 shadow-soft">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Chat preview</p>
                  <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                    Live UI
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  <div className="rounded-2xl bg-surface/45 p-4">
                    <p className="text-sm text-muted">User</p>
                    <p className="mt-1 text-sm">I have a headache and mild fever.</p>
                  </div>
                  <div className="rounded-2xl border border-border/50 bg-surface/25 p-4">
                    <p className="text-sm text-muted">Assistant</p>
                    <p className="mt-1 text-sm">
                      Here are possible causes and red flags. If symptoms worsen or you have breathing difficulty,
                      seek care urgently.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">
                        low risk
                      </span>
                      <span className="rounded-full bg-sky-500/15 px-2.5 py-1 text-xs font-semibold text-sky-200">
                        citations
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[28px] bg-gradient-to-tr from-accent/15 via-sky-500/10 to-fuchsia-500/10 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="container-pro py-12 md:py-16">
        <h2 className="text-2xl font-semibold tracking-tight">Features</h2>
        <p className="mt-2 text-sm text-muted">A modern dashboard-style UI that stays out of the way.</p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {features.map((f) => (
            <Card key={f.title} className="transition hover:-translate-y-0.5 hover:shadow-soft">
              <CardHeader>
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-surface/55">
                  {f.icon}
                </div>
                <CardTitle>{f.title}</CardTitle>
                <CardDescription>{f.desc}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          ))}
        </div>
      </section>

      <section className="container-pro py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
            <p className="mt-2 text-sm text-muted">Simple steps that feel fast on both mobile and desktop.</p>
            <div className="mt-6 space-y-3">
              {steps.map((s, idx) => (
                <div key={s.title} className="glass rounded-2xl p-4 transition hover:bg-surface/55">
                  <p className="text-xs font-semibold text-muted">Step {idx + 1}</p>
                  <p className="mt-1 text-base font-semibold">{s.title}</p>
                  <p className="mt-1 text-sm text-muted">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="glass rounded-2xl p-6 shadow-soft">
            <h3 className="text-lg font-semibold">Benefits</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted">
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
                Consistent dark theme with glass surfaces, rounded corners, and soft shadows.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
                Responsive layouts and spacing tuned for readability.
              </li>
              <li className="flex gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-accent" />
                Reusable UI components (buttons, inputs, cards, toasts, loaders).
              </li>
            </ul>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button className="w-full">Create account</Button>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full">View dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/40">
        <div className="container-pro py-10">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold">AI Healthcare</p>
              <p className="mt-1 text-xs text-muted">Educational assistant UI. Not medical advice.</p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-muted">
              <Link className="rounded-xl px-3 py-2 transition hover:bg-surface/40 hover:text-fg" href="/features">
                Features
              </Link>
              <Link className="rounded-xl px-3 py-2 transition hover:bg-surface/40 hover:text-fg" href="/admin">
                Admin
              </Link>
              <Link className="rounded-xl px-3 py-2 transition hover:bg-surface/40 hover:text-fg" href="/dashboard/chat">
                Chat
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

