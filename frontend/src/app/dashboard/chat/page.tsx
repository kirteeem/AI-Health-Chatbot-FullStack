'use client'

import ChatWorkspace from '../../../features/chat/components/ChatWorkspace'

export default function DashboardChatPage() {
  return (
    <div className="flex h-[calc(100dvh-3.5rem)] min-h-0 flex-col md:h-[calc(100dvh-4rem)]">
      <ChatWorkspace />
    </div>
  )
}
