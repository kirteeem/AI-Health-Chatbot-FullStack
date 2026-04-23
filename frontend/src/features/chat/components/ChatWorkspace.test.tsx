import { render, screen } from '@testing-library/react'
import { ToastProvider } from '../../../components/ui/Toast'
import ChatWorkspace from './ChatWorkspace'

describe('ChatWorkspace', () => {
  it('renders chat assistant title', () => {
    render(
      <ToastProvider>
        <ChatWorkspace />
      </ToastProvider>,
    )
    expect(screen.getByText('Chat assistant')).toBeInTheDocument()
  })
})
