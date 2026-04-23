'use client'

import { useEffect, useRef, useState } from 'react'
import { Mic, MicOff, Send } from 'lucide-react'

import { useToast } from './ui/Toast'

interface InputBarProps {
  onSend: (value: string) => void
  disabled?: boolean
}

type RecognitionInstance = {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  onstart: (() => void) | null
  onend: (() => void) | null
  onerror: ((ev: Event) => void) | null
  onresult: ((ev: unknown) => void) | null
}

export default function InputBar({ onSend, disabled = false }: InputBarProps) {
  const { toast } = useToast()
  const [value, setValue] = useState('')
  const [isListening, setIsListening] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<RecognitionInstance | null>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) {
      return
    }
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`
  }, [value])

  useEffect(() => {
    return () => {
      try {
        recognitionRef.current?.stop()
      } catch {
        /* ignore */
      }
      recognitionRef.current = null
    }
  }, [])

  const submit = () => {
    if (!value.trim() || disabled) {
      return
    }
    onSend(value.trim())
    setValue('')
  }

  const handleMic = () => {
    if (disabled) {
      return
    }

    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        /* ignore */
      }
      recognitionRef.current = null
      setIsListening(false)
      return
    }

    const SpeechRecognitionCtor =
      typeof window !== 'undefined' &&
      ((window as unknown as { SpeechRecognition?: new () => RecognitionInstance }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: new () => RecognitionInstance }).webkitSpeechRecognition)

    if (!SpeechRecognitionCtor) {
      toast({
        type: 'info',
        title: 'Voice input unavailable',
        description: 'Speech recognition is not supported in this browser. Try Chrome or Edge.',
      })
      return
    }

    const recognition = new SpeechRecognitionCtor()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognitionRef.current = recognition

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => {
      setIsListening(false)
      recognitionRef.current = null
    }
    recognition.onerror = () => {
      setIsListening(false)
      recognitionRef.current = null
      toast({
        type: 'info',
        title: 'Voice input stopped',
        description: 'Microphone was interrupted or permission was denied.',
      })
    }
    recognition.onresult = (event: unknown) => {
      const ev = event as { results?: Array<Array<{ transcript?: string }>> }
      const transcript = ev?.results?.[0]?.[0]?.transcript ?? ''
      setValue((prev) => `${prev} ${transcript}`.trim())
    }

    try {
      recognition.start()
    } catch {
      toast({ type: 'error', title: 'Could not start microphone', description: 'Try again in a moment.' })
      setIsListening(false)
      recognitionRef.current = null
    }
  }

  return (
    <div className="sticky bottom-0 z-20 border-t border-border/50 bg-bg/75 p-3 backdrop-blur-xl">
      <div className="glass mx-auto flex w-full max-w-4xl items-end gap-2 rounded-2xl p-2 shadow-soft">
        <textarea
          ref={textareaRef}
          value={value}
          disabled={disabled}
          rows={1}
          placeholder="Describe your symptoms or ask a health question..."
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              submit()
            }
          }}
          className="max-h-[180px] min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2 text-sm text-fg outline-none placeholder:text-muted/80 disabled:opacity-50"
        />

        <button
          type="button"
          onClick={handleMic}
          disabled={disabled}
          className={[
            'rounded-xl p-2 text-muted transition hover:bg-surface/60 hover:text-fg',
            isListening ? 'bg-red-500/20 text-red-200' : '',
          ].join(' ')}
          aria-label={isListening ? 'Stop recording' : 'Start voice input'}
        >
          {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </button>

        <button
          type="button"
          onClick={submit}
          disabled={disabled || !value.trim()}
          className="rounded-xl bg-gradient-to-r from-indigo-600 via-brand-500 to-violet-500 p-2 text-white shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      <p className="mx-auto mt-2 w-full max-w-4xl px-2 text-xs text-muted">
        {isListening ? 'Listening… tap the mic again to stop.' : 'Press Enter to send, Shift+Enter for a new line.'}
      </p>
    </div>
  )
}
