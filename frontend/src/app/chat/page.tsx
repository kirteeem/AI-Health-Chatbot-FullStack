import { redirect } from 'next/navigation'

export default function ChatLegacyRedirectPage() {
  redirect('/dashboard/chat')
}
