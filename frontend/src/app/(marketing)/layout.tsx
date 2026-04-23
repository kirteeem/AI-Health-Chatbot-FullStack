import { Navbar } from '../../components/layout/Navbar'
import { PageTransition } from '../../components/layout/PageTransition'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <PageTransition>{children}</PageTransition>
    </div>
  )
}

