'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Volume2, VolumeX } from 'lucide-react'
import { motion } from 'framer-motion'

import InputBar from '../../../components/InputBar'
import MessageBubble from '../../../components/MessageBubble'
import { Button } from '../../../components/ui/Button'
import LoadingDots from '../../../components/LoadingDots'
import { fetchSessionHistory, sendChatMessage } from '../../../services/chatService'
import CitationList from './CitationList'
import ChatHistorySidebar from './ChatHistorySidebar'
import SymptomAnalysisPanel from './SymptomAnalysisPanel'
import type { ChatMessage, Conversation } from '../types/chat'

const TTS_STORAGE_KEY = 'chat-tts-enabled'

function readTtsPreference(): boolean {
  if (typeof window === 'undefined') return true
  return localStorage.getItem(TTS_STORAGE_KEY) !== '0'
}

function speakAssistantReply(text: string) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const plain = text.replace(/\s+/g, ' ').trim().slice(0, 8000)
  if (!plain) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(plain)
  u.lang = 'en-US'
  window.speechSynthesis.speak(u)
}

function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel()
  }
}

const initialMessage: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Welcome to the enterprise AI healthcare assistant. Share your symptoms for general guidance, triage insight, and source citations.',
  timestamp: new Date(),
}

export default function ChatWorkspace() {
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage])
  const [isLoading, setIsLoading] = useState(false)
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isHydrated, setIsHydrated] = useState(false)
  const [ttsEnabled, setTtsEnabled] = useState(true)
  
useEffect(() => {
  try {
    const stored = localStorage.getItem("conversations")
    if (stored) {
      const parsed = JSON.parse(stored)
      setConversations(parsed)

      if (parsed.length > 0) {
        setActiveConversationId(parsed[0].id)
      }
    }
  } catch {
    localStorage.removeItem("conversations")
  } finally {
    setIsHydrated(true) 
  }
  }, [])

  useEffect(() => {
  if (!isHydrated) return 

  localStorage.setItem("conversations", JSON.stringify(conversations))
  }, [conversations, isHydrated])

  useEffect(() => {
    setTtsEnabled(readTtsPreference())
  }, [])

  const toggleTts = useCallback(() => {
    const next = !ttsEnabled
    setTtsEnabled(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem(TTS_STORAGE_KEY, next ? '1' : '0')
    }
    if (!next) stopSpeaking()
  }, [ttsEnabled])

  const historyItems = conversations.map(c => ({
  id: c.id,
  label: c.title
  }))

  const latestAssistant = [...messages].reverse().find((m) => m.role === 'assistant')

  const onSend = async (content: string) => {
    stopSpeaking()
    const userMessage: ChatMessage = {
      id: String(Date.now()),
      role: 'user',
      content,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setIsLoading(true)

    try {
const response = await sendChatMessage({
  message: content,
  conversation_id: activeConversationId || undefined,
})
      const assistantMessage: ChatMessage = {
        id: String(Date.now() + 1),
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
        symptom_analysis: response.symptom_analysis,
        sources: response.sources || [],
        citations: response.citations || [],
        recommended_specialist: response.recommended_specialist,
      }

      if (!activeConversationId) {
        setActiveConversationId(response.conversation_id)

        setConversations(prev => {
          const exists = prev.some(c => c.id === response.conversation_id)
          if (exists) return prev

          const newConversation = {
            id: response.conversation_id,
            title: content.slice(0, 40)
          }

          return [newConversation, ...prev]
        })
      }

      setMessages((prev) => [...prev, assistantMessage])
      if (ttsEnabled) {
        speakAssistantReply(assistantMessage.content)
      }

    } catch (_error) {
      setMessages((prev) => [
        ...prev,
        {
          id: String(Date.now() + 2),
          role: 'assistant',
          content: 'Unable to process your request right now. Please try again shortly.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const onNewChat = () => {
    stopSpeaking()
    setMessages([{ ...initialMessage, id: `welcome-${Date.now()}`, timestamp: new Date() }])
    setActiveConversationId(null)
  }

  useEffect(() => {
  if (!activeConversationId) return

  handleSelectConversation(activeConversationId)
  }, [activeConversationId])

  const handleSelectConversation = async (id: string) => {
     setActiveConversationId(id)
    try {
      setIsLoading(true)
      const data = await fetchSessionHistory(id)

      const loadedMessages: ChatMessage[] = data.messages.map((m: any) => ({
        id: m.id || `${m.role}-${m.created_at}-${Math.random()}`,        role: m.role,
        content: m.content,
        timestamp: new Date(m.created_at),       
        symptom_analysis: m.symptom_analysis,
        sources: m.sources || [],
        citations: m.citations || [],
        recommended_specialist: m.recommended_specialist,
      }))

      setMessages(loadedMessages)
    } catch (error) {
      console.error("Failed to load conversation", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-0 flex-1 overflow-hidden md:min-h-[calc(100vh-4rem)]">
      <ChatHistorySidebar
        items={historyItems}
        activeId={activeConversationId}
        onSelect={handleSelectConversation}
        onNewChat={onNewChat}
      />

      <main className="relative flex min-w-0 flex-1 flex-col">
        <header className="glass border-b border-border/50 px-4 py-4 md:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Chat assistant</h1>
              <p className="text-sm text-muted">Voice, text, citations, and triage-style signals.</p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="shrink-0 gap-2"
              onClick={toggleTts}
              aria-pressed={ttsEnabled}
            >
              {ttsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              {ttsEnabled ? 'Voice on' : 'Voice off'}
            </Button>
          </div>
        </header>

        <div className="border-b border-amber-500/35 bg-amber-500/10 px-4 py-2 text-sm text-amber-100 md:px-8">
          <p className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            This assistant provides educational information only and is not a substitute for professional medical advice.
          </p>
        </div>

        <div className="grid flex-1 gap-4 overflow-hidden px-2 py-3 md:grid-cols-[minmax(0,1fr),300px] md:px-6">
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            className="glass overflow-y-auto rounded-2xl border border-border/50 bg-surface/25 pb-24"
          >
            {messages.map((message) => (
                  <div key={message.id}>
                  <MessageBubble message={message} isLatestAssistant={message.id === latestAssistant?.id} />
                {message.role === 'assistant' && <CitationList citations={message.citations} />}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 px-6 py-4 text-sm text-muted">
                <p>Generating response</p>
                <LoadingDots />
              </div>
            )}
          </motion.section>

          <section className="hidden md:block">
            <SymptomAnalysisPanel
              analysis={latestAssistant?.symptom_analysis}
              specialist={latestAssistant?.recommended_specialist}
            />
          </section>
        </div>

        <InputBar onSend={onSend} disabled={isLoading} />
      </main>
    </div>
  )
}
