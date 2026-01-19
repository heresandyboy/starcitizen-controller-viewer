import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { VoiceSearch, isSpeechRecognitionSupported } from '@/components/VoiceSearch'

// Store reference to the instance created by the component
let mockRecognitionInstance: MockSpeechRecognition | null = null

class MockSpeechRecognition {
  continuous = false
  interimResults = false
  lang = ''
  maxAlternatives = 1

  onstart: (() => void) | null = null
  onend: (() => void) | null = null
  onresult: ((event: unknown) => void) | null = null
  onerror: ((event: unknown) => void) | null = null

  constructor() {
    mockRecognitionInstance = this
  }

  start = vi.fn(() => {
    setTimeout(() => {
      if (this.onstart) this.onstart()
    }, 0)
  })

  stop = vi.fn(() => {
    setTimeout(() => {
      if (this.onend) this.onend()
    }, 0)
  })

  abort = vi.fn()

  // Helper to simulate a result
  simulateResult(transcript: string, isFinal: boolean) {
    if (this.onresult) {
      this.onresult({
        results: {
          length: 1,
          0: {
            0: { transcript },
            isFinal,
            length: 1,
          },
          [Symbol.iterator]: function* () {
            yield this[0]
          }
        },
      })
    }
  }

  // Helper to simulate an error
  simulateError(error: string) {
    if (this.onerror) {
      this.onerror({ error })
    }
    if (this.onend) {
      this.onend()
    }
  }

  // Helper to simulate end
  simulateEnd() {
    if (this.onend) {
      this.onend()
    }
  }
}

function setupSpeechRecognitionMock(supported: boolean) {
  const windowAny = window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }

  if (supported) {
    windowAny.SpeechRecognition = MockSpeechRecognition
  } else {
    delete windowAny.SpeechRecognition
    delete windowAny.webkitSpeechRecognition
  }
}

describe('VoiceSearch', () => {
  const mockOnResult = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockRecognitionInstance = null
    setupSpeechRecognitionMock(true)
  })

  afterEach(() => {
    setupSpeechRecognitionMock(false)
  })

  describe('isSpeechRecognitionSupported', () => {
    it('returns true when SpeechRecognition is available', () => {
      setupSpeechRecognitionMock(true)
      expect(isSpeechRecognitionSupported()).toBe(true)
    })

    it('returns false when SpeechRecognition is not available', () => {
      setupSpeechRecognitionMock(false)
      expect(isSpeechRecognitionSupported()).toBe(false)
    })
  })

  describe('rendering', () => {
    it('renders microphone button when speech recognition is supported', async () => {
      render(<VoiceSearch onResult={mockOnResult} />)

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })
    })

    it('shows unsupported message when speech recognition is not available', async () => {
      setupSpeechRecognitionMock(false)

      render(<VoiceSearch onResult={mockOnResult} />)

      await waitFor(() => {
        expect(screen.getByText('Voice search not supported')).toBeInTheDocument()
      })
    })

    it('applies custom className', async () => {
      const { container } = render(
        <VoiceSearch onResult={mockOnResult} className="custom-class" />
      )

      await waitFor(() => {
        const wrapper = container.firstChild as HTMLElement
        expect(wrapper.className).toContain('custom-class')
      })
    })

    it('has correct aria-label when not listening', async () => {
      render(<VoiceSearch onResult={mockOnResult} />)

      await waitFor(() => {
        expect(screen.getByLabelText('Start voice search')).toBeInTheDocument()
      })
    })
  })

  describe('listening state', () => {
    it('starts listening when button is clicked', async () => {
      render(<VoiceSearch onResult={mockOnResult} />)

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })

      const button = screen.getByRole('button')

      await act(async () => {
        fireEvent.click(button)
      })

      await waitFor(() => {
        expect(mockRecognitionInstance?.start).toHaveBeenCalled()
      })
    })

    it('updates aria-label when listening', async () => {
      render(<VoiceSearch onResult={mockOnResult} />)

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })

      const button = screen.getByRole('button')

      await act(async () => {
        fireEvent.click(button)
        // Wait for the setTimeout in start() to fire
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      await waitFor(() => {
        expect(screen.getByLabelText('Stop listening')).toBeInTheDocument()
      })
    })

    it('stops listening when button is clicked again', async () => {
      render(<VoiceSearch onResult={mockOnResult} />)

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })

      const button = screen.getByRole('button')

      // Start listening
      await act(async () => {
        fireEvent.click(button)
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      await waitFor(() => {
        expect(screen.getByLabelText('Stop listening')).toBeInTheDocument()
      })

      // Stop listening
      await act(async () => {
        fireEvent.click(button)
      })

      await waitFor(() => {
        expect(mockRecognitionInstance?.stop).toHaveBeenCalled()
      })
    })

    it('shows placeholder when listening and no transcript', async () => {
      render(<VoiceSearch onResult={mockOnResult} placeholder="Listening..." />)

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })

      const button = screen.getByRole('button')

      await act(async () => {
        fireEvent.click(button)
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      await waitFor(() => {
        expect(screen.getByText('Listening...')).toBeInTheDocument()
      })
    })
  })

  describe('speech recognition results', () => {
    it('displays interim transcript while listening', async () => {
      render(<VoiceSearch onResult={mockOnResult} />)

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })

      const button = screen.getByRole('button')

      await act(async () => {
        fireEvent.click(button)
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      await waitFor(() => {
        expect(mockRecognitionInstance).not.toBeNull()
      })

      await act(async () => {
        mockRecognitionInstance?.simulateResult('hello wor', false)
      })

      await waitFor(() => {
        expect(screen.getByText('hello wor')).toBeInTheDocument()
      })
    })

    it('calls onResult with final transcript', async () => {
      render(<VoiceSearch onResult={mockOnResult} />)

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })

      const button = screen.getByRole('button')

      await act(async () => {
        fireEvent.click(button)
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      await waitFor(() => {
        expect(mockRecognitionInstance).not.toBeNull()
      })

      await act(async () => {
        mockRecognitionInstance?.simulateResult('hello world', true)
      })

      await waitFor(() => {
        expect(mockOnResult).toHaveBeenCalledWith('hello world')
      })
    })

    it('does not call onResult for interim results', async () => {
      render(<VoiceSearch onResult={mockOnResult} />)

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })

      const button = screen.getByRole('button')

      await act(async () => {
        fireEvent.click(button)
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      await waitFor(() => {
        expect(mockRecognitionInstance).not.toBeNull()
      })

      await act(async () => {
        mockRecognitionInstance?.simulateResult('hello', false)
      })

      expect(mockOnResult).not.toHaveBeenCalled()
    })
  })

  describe('error handling', () => {
    it('shows error message for not-allowed error', async () => {
      render(<VoiceSearch onResult={mockOnResult} />)

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })

      const button = screen.getByRole('button')

      await act(async () => {
        fireEvent.click(button)
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      await waitFor(() => {
        expect(mockRecognitionInstance).not.toBeNull()
      })

      await act(async () => {
        mockRecognitionInstance?.simulateError('not-allowed')
      })

      await waitFor(() => {
        expect(screen.getByText('Microphone access denied')).toBeInTheDocument()
      })
    })

    it('shows error message for no-speech error', async () => {
      render(<VoiceSearch onResult={mockOnResult} />)

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })

      const button = screen.getByRole('button')

      await act(async () => {
        fireEvent.click(button)
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      await waitFor(() => {
        expect(mockRecognitionInstance).not.toBeNull()
      })

      await act(async () => {
        mockRecognitionInstance?.simulateError('no-speech')
      })

      await waitFor(() => {
        expect(screen.getByText('No speech detected')).toBeInTheDocument()
      })
    })

    it('shows error message for network error', async () => {
      render(<VoiceSearch onResult={mockOnResult} />)

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })

      const button = screen.getByRole('button')

      await act(async () => {
        fireEvent.click(button)
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      await waitFor(() => {
        expect(mockRecognitionInstance).not.toBeNull()
      })

      await act(async () => {
        mockRecognitionInstance?.simulateError('network')
      })

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument()
      })
    })

    it('does not show error for aborted', async () => {
      render(<VoiceSearch onResult={mockOnResult} />)

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })

      const button = screen.getByRole('button')

      await act(async () => {
        fireEvent.click(button)
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      await waitFor(() => {
        expect(mockRecognitionInstance).not.toBeNull()
      })

      await act(async () => {
        mockRecognitionInstance?.simulateError('aborted')
      })

      // Should not show error message for aborted
      expect(screen.queryByText('Microphone access denied')).not.toBeInTheDocument()
      expect(screen.queryByText('No speech detected')).not.toBeInTheDocument()
      expect(screen.queryByText('Network error')).not.toBeInTheDocument()
    })

    it('shows generic error message for unknown errors', async () => {
      render(<VoiceSearch onResult={mockOnResult} />)

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })

      const button = screen.getByRole('button')

      await act(async () => {
        fireEvent.click(button)
        await new Promise(resolve => setTimeout(resolve, 10))
      })

      await waitFor(() => {
        expect(mockRecognitionInstance).not.toBeNull()
      })

      await act(async () => {
        mockRecognitionInstance?.simulateError('unknown-error')
      })

      await waitFor(() => {
        expect(screen.getByText('Error: unknown-error')).toBeInTheDocument()
      })
    })
  })

  describe('disabled state', () => {
    it('does not start listening when disabled', async () => {
      render(<VoiceSearch onResult={mockOnResult} disabled />)

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()

      fireEvent.click(button)

      // Recognition should not be started (button is disabled so click handler won't run)
      // Give it a moment to ensure nothing happens
      await new Promise(resolve => setTimeout(resolve, 10))
      expect(mockRecognitionInstance?.start).not.toHaveBeenCalled()
    })

    it('applies disabled styling', async () => {
      render(<VoiceSearch onResult={mockOnResult} disabled />)

      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument()
      })

      const button = screen.getByRole('button')
      expect(button.className).toContain('cursor-not-allowed')
    })
  })

  describe('cleanup', () => {
    it('aborts recognition on unmount', async () => {
      const { unmount } = render(<VoiceSearch onResult={mockOnResult} />)

      // Wait for component to mount and create recognition instance
      await waitFor(() => {
        expect(mockRecognitionInstance).not.toBeNull()
      })

      const instance = mockRecognitionInstance

      unmount()

      // Should have called abort during cleanup
      expect(instance?.abort).toHaveBeenCalled()
    })
  })
})
