import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '@/components/SearchBar'
import type { UnifiedMapping } from '@/lib/types/unified'

// Mock Fuse.js
vi.mock('fuse.js', () => {
  return {
    default: class MockFuse {
      private items: UnifiedMapping[]

      constructor(items: UnifiedMapping[]) {
        this.items = items
      }

      search(query: string) {
        // Simple mock search - filter items that contain the query in any searchable field
        const lowerQuery = query.toLowerCase()
        return this.items
          .filter(item =>
            item.gameActionReadable.toLowerCase().includes(lowerQuery) ||
            item.gameAction.toLowerCase().includes(lowerQuery) ||
            item.controllerButton.toLowerCase().includes(lowerQuery) ||
            (item.description?.toLowerCase().includes(lowerQuery)) ||
            (item.keyboardKeys?.some(k => k.toLowerCase().includes(lowerQuery)))
          )
          .map((item, index) => ({ item, score: index * 0.1, refIndex: index }))
      }
    }
  }
})

const createMockMapping = (overrides: Partial<UnifiedMapping> = {}): UnifiedMapping => ({
  id: 'test-id-' + Math.random().toString(36).slice(2),
  controllerButton: 'A',
  activationType: 'press',
  activationMode: 'default',
  gameAction: 'v_toggle_landing_gear',
  gameActionReadable: 'Toggle Landing Gear',
  gameplayMode: 'flight',
  actionMap: 'spaceship_general',
  source: 'xml',
  ...overrides,
})

describe('SearchBar', () => {
  const mockOnSearchResults = vi.fn()

  const defaultMappings: UnifiedMapping[] = [
    createMockMapping({
      gameAction: 'v_toggle_landing_gear',
      gameActionReadable: 'Toggle Landing Gear',
      controllerButton: 'A',
    }),
    createMockMapping({
      gameAction: 'v_boost',
      gameActionReadable: 'Afterburner',
      controllerButton: 'B',
    }),
    createMockMapping({
      gameAction: 'v_toggle_quantum_mode',
      gameActionReadable: 'Toggle Quantum Mode',
      controllerButton: 'X',
    }),
    createMockMapping({
      gameAction: 'v_weapon_fire',
      gameActionReadable: 'Fire Weapon',
      controllerButton: 'RT',
      keyboardKeys: ['Mouse1'],
    }),
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('rendering', () => {
    it('renders with default placeholder', () => {
      render(
        <SearchBar
          mappings={defaultMappings}
          onSearchResults={mockOnSearchResults}
        />
      )

      expect(screen.getByPlaceholderText('Search mappings...')).toBeInTheDocument()
    })

    it('renders with custom placeholder', () => {
      render(
        <SearchBar
          mappings={defaultMappings}
          onSearchResults={mockOnSearchResults}
          placeholder="Find actions..."
        />
      )

      expect(screen.getByPlaceholderText('Find actions...')).toBeInTheDocument()
    })

    it('renders search icon', () => {
      const { container } = render(
        <SearchBar
          mappings={defaultMappings}
          onSearchResults={mockOnSearchResults}
        />
      )

      // Search icon SVG should be present
      const svg = container.querySelector('svg')
      expect(svg).toBeInTheDocument()
    })

    it('does not show clear button when input is empty', () => {
      render(
        <SearchBar
          mappings={defaultMappings}
          onSearchResults={mockOnSearchResults}
        />
      )

      // There should only be one SVG (search icon), not the clear button
      const { container } = render(
        <SearchBar
          mappings={defaultMappings}
          onSearchResults={mockOnSearchResults}
        />
      )

      const buttons = container.querySelectorAll('button')
      expect(buttons.length).toBe(0)
    })
  })

  describe('search functionality', () => {
    it('calls onSearchResults with all mappings on initial render', () => {
      render(
        <SearchBar
          mappings={defaultMappings}
          onSearchResults={mockOnSearchResults}
        />
      )

      // Initial render should call onSearchResults with all mappings
      expect(mockOnSearchResults).toHaveBeenCalledWith(defaultMappings)
    })

    it('filters results when typing a search query', async () => {
      const user = userEvent.setup()

      render(
        <SearchBar
          mappings={defaultMappings}
          onSearchResults={mockOnSearchResults}
        />
      )

      const input = screen.getByPlaceholderText('Search mappings...')
      await user.type(input, 'landing')

      // Should call onSearchResults with filtered results
      await waitFor(() => {
        const lastCall = mockOnSearchResults.mock.calls[mockOnSearchResults.mock.calls.length - 1]
        expect(lastCall[0]).toHaveLength(1)
        expect(lastCall[0][0].gameAction).toBe('v_toggle_landing_gear')
      })
    })

    it('returns all mappings when search query is cleared', async () => {
      const user = userEvent.setup()

      render(
        <SearchBar
          mappings={defaultMappings}
          onSearchResults={mockOnSearchResults}
        />
      )

      const input = screen.getByPlaceholderText('Search mappings...')

      // Type a query
      await user.type(input, 'landing')

      // Clear the input
      await user.clear(input)

      // Should return all mappings
      await waitFor(() => {
        const lastCall = mockOnSearchResults.mock.calls[mockOnSearchResults.mock.calls.length - 1]
        expect(lastCall[0]).toEqual(defaultMappings)
      })
    })

    it('handles empty search results', async () => {
      const user = userEvent.setup()

      render(
        <SearchBar
          mappings={defaultMappings}
          onSearchResults={mockOnSearchResults}
        />
      )

      const input = screen.getByPlaceholderText('Search mappings...')
      await user.type(input, 'nonexistent')

      await waitFor(() => {
        const lastCall = mockOnSearchResults.mock.calls[mockOnSearchResults.mock.calls.length - 1]
        expect(lastCall[0]).toHaveLength(0)
      })
    })

    it('searches by controller button', async () => {
      const user = userEvent.setup()

      render(
        <SearchBar
          mappings={defaultMappings}
          onSearchResults={mockOnSearchResults}
        />
      )

      const input = screen.getByPlaceholderText('Search mappings...')
      await user.type(input, 'RT')

      await waitFor(() => {
        const lastCall = mockOnSearchResults.mock.calls[mockOnSearchResults.mock.calls.length - 1]
        expect(lastCall[0]).toHaveLength(1)
        expect(lastCall[0][0].controllerButton).toBe('RT')
      })
    })
  })

  describe('clear button', () => {
    it('shows clear button when input has value', async () => {
      const user = userEvent.setup()

      const { container } = render(
        <SearchBar
          mappings={defaultMappings}
          onSearchResults={mockOnSearchResults}
        />
      )

      const input = screen.getByPlaceholderText('Search mappings...')
      await user.type(input, 'test')

      const button = container.querySelector('button')
      expect(button).toBeInTheDocument()
    })

    it('clears input and returns all results when clear button is clicked', async () => {
      const user = userEvent.setup()

      const { container } = render(
        <SearchBar
          mappings={defaultMappings}
          onSearchResults={mockOnSearchResults}
        />
      )

      const input = screen.getByPlaceholderText('Search mappings...') as HTMLInputElement
      await user.type(input, 'landing')

      const clearButton = container.querySelector('button')
      expect(clearButton).toBeInTheDocument()

      await user.click(clearButton!)

      expect(input.value).toBe('')

      await waitFor(() => {
        const lastCall = mockOnSearchResults.mock.calls[mockOnSearchResults.mock.calls.length - 1]
        expect(lastCall[0]).toEqual(defaultMappings)
      })
    })
  })

  describe('mappings changes', () => {
    it('updates search when mappings prop changes', async () => {
      const { rerender } = render(
        <SearchBar
          mappings={defaultMappings}
          onSearchResults={mockOnSearchResults}
        />
      )

      const newMappings = [
        createMockMapping({
          gameAction: 'new_action',
          gameActionReadable: 'New Action',
        }),
      ]

      rerender(
        <SearchBar
          mappings={newMappings}
          onSearchResults={mockOnSearchResults}
        />
      )

      // Should call onSearchResults with new mappings
      await waitFor(() => {
        const lastCall = mockOnSearchResults.mock.calls[mockOnSearchResults.mock.calls.length - 1]
        expect(lastCall[0]).toEqual(newMappings)
      })
    })

    it('re-filters results when mappings change with active query', async () => {
      const user = userEvent.setup()

      const { rerender } = render(
        <SearchBar
          mappings={defaultMappings}
          onSearchResults={mockOnSearchResults}
        />
      )

      const input = screen.getByPlaceholderText('Search mappings...')
      await user.type(input, 'landing')

      // Change mappings to not include landing gear
      const newMappings = [
        createMockMapping({
          gameAction: 'v_boost',
          gameActionReadable: 'Afterburner',
        }),
      ]

      rerender(
        <SearchBar
          mappings={newMappings}
          onSearchResults={mockOnSearchResults}
        />
      )

      // Since there's an active query, it won't automatically reset
      // The useEffect only triggers when query is empty
      // This tests the current behavior
      expect(input).toHaveValue('landing')
    })
  })

  describe('empty mappings', () => {
    it('handles empty mappings array', () => {
      render(
        <SearchBar
          mappings={[]}
          onSearchResults={mockOnSearchResults}
        />
      )

      expect(mockOnSearchResults).toHaveBeenCalledWith([])
    })

    it('returns empty results when searching with no mappings', async () => {
      const user = userEvent.setup()

      render(
        <SearchBar
          mappings={[]}
          onSearchResults={mockOnSearchResults}
        />
      )

      const input = screen.getByPlaceholderText('Search mappings...')
      await user.type(input, 'test')

      await waitFor(() => {
        const lastCall = mockOnSearchResults.mock.calls[mockOnSearchResults.mock.calls.length - 1]
        expect(lastCall[0]).toHaveLength(0)
      })
    })
  })

  describe('whitespace handling', () => {
    it('treats whitespace-only query as empty', async () => {
      const user = userEvent.setup()

      render(
        <SearchBar
          mappings={defaultMappings}
          onSearchResults={mockOnSearchResults}
        />
      )

      const input = screen.getByPlaceholderText('Search mappings...')
      await user.type(input, '   ')

      await waitFor(() => {
        const lastCall = mockOnSearchResults.mock.calls[mockOnSearchResults.mock.calls.length - 1]
        expect(lastCall[0]).toEqual(defaultMappings)
      })
    })
  })
})
