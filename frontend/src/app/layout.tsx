import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import '../styles/globals.css'
import { ToastProvider } from '../components/ui/Toast'

const spaceGrotesk = Space_Grotesk({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AI Healthcare Assistant',
  description: 'Your AI-powered healthcare companion',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${spaceGrotesk.className} min-h-screen antialiased`}>
        <ToastProvider>
          <main className="min-h-screen">{children}</main>
        </ToastProvider>
      </body>
    </html>
  )
}