import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MappingBrowser } from '@/components/MappingBrowser'
import type { UnifiedMapping, ConfigState, GameplayMode } from '@/lib/types/unified'

// Mock Fuse.js for search (same as SearchBar tests)
vi.mock('fuse.js', () => {
  return {
    default: class MockFuse {
      private items: UnifiedMapping[]

      constructor(items: UnifiedMapping[]) {
        this.items = items
      }

      search(query: string) {
        const lowerQuery = query.toLowerCase()
        return this.items
          .filter(item =>
            item.gameActionReadable.toLowerCase().includes(lowerQuery) ||
            item.gameAction.toLowerCase().includes(lowerQuery) ||
            item.controllerButton.toLowerCase().includes(lowerQuery)
          )
          .map((item, index) => ({ item, score: index * 0.1, refIndex: index }))
      }
    }
  }
})

function createMockMapping(overrides: Partial<UnifiedMapping> = {}): UnifiedMapping {
  return {
    id: 'test-id-' + Math.random().toString(36).slice(2),
    controllerButton: 'A',
    activationType: 'press',
    activationMode: 'default',
    gameAction: 'v_toggle_landing_gear',
    gameActionReadable: 'Toggle Landing Gear',
    gameplayMode: 'flight',
    actionMap: 'spaceship_general',
    source: 'xml-gamepad',
    ...overrides,
  }
}

function createMockConfig(overrides: Partial<ConfigState> = {}): ConfigState {
  return {
    loaded: true,
    rewasdFileName: 'controller.rewasd',
    xmlFileName: 'layout.xml',
    mappings: [
      createMockMapping({
        controllerButton: 'A',
        gameAction: 'v_toggle_landing_gear',
        gameActionReadable: 'Toggle Landing Gear',
        gameplayMode: 'flight',
      }),
      createMockMapping({
        controllerButton: 'B',
        gameAction: 'v_boost',
        gameActionReadable: 'Afterburner',
        gameplayMode: 'flight',
      }),
      createMockMapping({
        controllerButton: 'X',
        gameAction: 'v_toggle_quantum_mode',
        gameActionReadable: 'Toggle Quantum Mode',
        gameplayMode: 'flight',
        modifier: 'LB',
      }),
      createMockMapping({
        controllerButton: 'A',
        gameAction: 'player_sprint',
        gameActionReadable: 'Sprint',
        gameplayMode: 'on-foot',
      }),
      createMockMapping({
        controllerButton: 'B',
        gameAction: 'player_crouch',
        gameActionReadable: 'Crouch',
        gameplayMode: 'on-foot',
        modifier: 'RB',
      }),
    ],
    availableModes: ['flight', 'on-foot'] as GameplayMode[],
    availableModifiers: ['LB', 'RB'],
    ...overrides,
  }
}

describe('MappingBrowser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('header info', () => {
    it('displays reWASD file name', () => {
      const config = createMockConfig({ rewasdFileName: 'my-controller.rewasd' })

      render(<MappingBrowser config={config} />)

      expect(screen.getByText(/reWASD: my-controller\.rewasd/)).toBeInTheDocument()
    })

    it('displays XML file name', () => {
      const config = createMockConfig({ xmlFileName: 'my-layout.xml' })

      render(<MappingBrowser config={config} />)

      expect(screen.getByText(/XML: my-layout\.xml/)).toBeInTheDocument()
    })

    it('displays total mappings count', () => {
      const config = createMockConfig()

      render(<MappingBrowser config={config} />)

      expect(screen.getByText('5 mappings')).toBeInTheDocument()
    })
  })

  describe('search', () => {
    it('renders search bar', () => {
      const config = createMockConfig()

      render(<MappingBrowser config={config} />)

      expect(screen.getByPlaceholderText('Search by action, button, or description...')).toBeInTheDocument()
    })

    it('filters mappings when searching', async () => {
      const user = userEvent.setup()
      const config = createMockConfig()

      render(<MappingBrowser config={config} />)

      const searchInput = screen.getByPlaceholderText('Search by action, button, or description...')
      await user.type(searchInput, 'landing')

      await waitFor(() => {
        expect(screen.getByText(/Showing 1 of 5 mappings/)).toBeInTheDocument()
      })
    })

    it('shows empty state when search has no results', async () => {
      const user = userEvent.setup()
      const config = createMockConfig()

      render(<MappingBrowser config={config} />)

      const searchInput = screen.getByPlaceholderText('Search by action, button, or description...')
      await user.type(searchInput, 'nonexistent')

      await waitFor(() => {
        expect(screen.getByText('No mappings found')).toBeInTheDocument()
        expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument()
      })
    })
  })

  describe('view mode', () => {
    it('defaults to by-mode view', () => {
      const config = createMockConfig()

      render(<MappingBrowser config={config} />)

      // By Mode button should be active
      const byModeButton = screen.getByRole('button', { name: 'By Mode' })
      expect(byModeButton.className).toContain('bg-blue-600')
    })

    it('shows grouped sections in by-mode view', () => {
      const config = createMockConfig()

      render(<MappingBrowser config={config} />)

      // Should show flight and on-foot section headers (h2 elements)
      expect(screen.getByRole('heading', { name: /flight/ })).toBeInTheDocument()
      expect(screen.getByRole('heading', { name: /on-foot/ })).toBeInTheDocument()
    })

    it('switches to all view when clicked', async () => {
      const user = userEvent.setup()
      const config = createMockConfig()

      render(<MappingBrowser config={config} />)

      await user.click(screen.getByRole('button', { name: 'All' }))

      // All button should be active
      const allButton = screen.getByRole('button', { name: 'All' })
      expect(allButton.className).toContain('bg-blue-600')

      // Group headers should not appear in 'all' view
      // (flight and on-foot would be rendered as h2 in other modes)
    })

    it('switches to by-modifier view when clicked', async () => {
      const user = userEvent.setup()
      const config = createMockConfig()

      render(<MappingBrowser config={config} />)

      await user.click(screen.getByRole('button', { name: 'By Modifier' }))

      // By Modifier button should be active
      const byModifierButton = screen.getByRole('button', { name: 'By Modifier' })
      expect(byModifierButton.className).toContain('bg-blue-600')

      // Should show modifier-based groupings (as h2 headings)
      expect(screen.getByRole('heading', { name: /No Modifier/ })).toBeInTheDocument()
    })
  })

  describe('mode filter', () => {
    it('shows all modes option', () => {
      const config = createMockConfig()

      render(<MappingBrowser config={config} />)

      // Mode select is the first combobox (Mode dropdown comes before Modifier)
      const selects = screen.getAllByRole('combobox')
      const modeSelect = selects[0]
      expect(modeSelect).toHaveValue('All')
    })

    it('lists available modes in dropdown', () => {
      const config = createMockConfig()

      render(<MappingBrowser config={config} />)

      expect(screen.getByRole('option', { name: 'All Modes' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'flight' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'on-foot' })).toBeInTheDocument()
    })

    it('filters by selected mode', async () => {
      const user = userEvent.setup()
      const config = createMockConfig()

      render(<MappingBrowser config={config} />)

      const modeSelect = screen.getByDisplayValue('All Modes')
      await user.selectOptions(modeSelect, 'flight')

      await waitFor(() => {
        // 3 flight mappings
        expect(screen.getByText(/Showing 3 of 5 mappings/)).toBeInTheDocument()
      })
    })
  })

  describe('modifier filter', () => {
    it('shows all modifiers option', () => {
      const config = createMockConfig()

      render(<MappingBrowser config={config} />)

      // Find modifier dropdown by its sibling label
      const modifierLabel = screen.getByText('Modifier:')
      const modifierSelect = modifierLabel.parentElement?.querySelector('select')
      expect(modifierSelect).toHaveValue('All')
    })

    it('lists available modifiers in dropdown', () => {
      const config = createMockConfig()

      render(<MappingBrowser config={config} />)

      // Modifier dropdown has "All" option (Mode dropdown has "All Modes" which is different)
      expect(screen.getByRole('option', { name: 'All' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'No Modifier' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'LB' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'RB' })).toBeInTheDocument()
    })

    it('filters by No Modifier', async () => {
      const user = userEvent.setup()
      const config = createMockConfig()

      render(<MappingBrowser config={config} />)

      // Get modifier select (second select)
      const selects = screen.getAllByRole('combobox')
      const modifierSelect = selects[1]

      await user.selectOptions(modifierSelect, 'None')

      await waitFor(() => {
        // 3 mappings without modifier
        expect(screen.getByText(/Showing 3 of 5 mappings/)).toBeInTheDocument()
      })
    })

    it('filters by specific modifier', async () => {
      const user = userEvent.setup()
      const config = createMockConfig()

      render(<MappingBrowser config={config} />)

      const selects = screen.getAllByRole('combobox')
      const modifierSelect = selects[1]

      await user.selectOptions(modifierSelect, 'LB')

      await waitFor(() => {
        // 1 mapping with LB modifier
        expect(screen.getByText(/Showing 1 of 5 mappings/)).toBeInTheDocument()
      })
    })
  })

  describe('compact view toggle', () => {
    it('renders compact view checkbox', () => {
      const config = createMockConfig()

      render(<MappingBrowser config={config} />)

      expect(screen.getByRole('checkbox')).toBeInTheDocument()
      expect(screen.getByText('Compact')).toBeInTheDocument()
    })

    it('defaults to non-compact view', () => {
      const config = createMockConfig()

      render(<MappingBrowser config={config} />)

      const checkbox = screen.getByRole('checkbox')
      expect(checkbox).not.toBeChecked()
    })

    it('toggles compact view when checkbox clicked', async () => {
      const user = userEvent.setup()
      const config = createMockConfig()

      render(<MappingBrowser config={config} />)

      const checkbox = screen.getByRole('checkbox')
      await user.click(checkbox)

      expect(checkbox).toBeChecked()
    })
  })

  describe('results count', () => {
    it('shows correct filtered count', () => {
      const config = createMockConfig()

      render(<MappingBrowser config={config} />)

      expect(screen.getByText('Showing 5 of 5 mappings')).toBeInTheDocument()
    })

    it('updates when filters change', async () => {
      const user = userEvent.setup()
      const config = createMockConfig()

      render(<MappingBrowser config={config} />)

      // Filter to on-foot mode
      const modeSelect = screen.getByDisplayValue('All Modes')
      await user.selectOptions(modeSelect, 'on-foot')

      await waitFor(() => {
        expect(screen.getByText(/Showing 2 of 5 mappings/)).toBeInTheDocument()
      })
    })
  })

  describe('mappings display', () => {
    it('renders MappingCard for each mapping', () => {
      const config = createMockConfig()

      render(<MappingBrowser config={config} />)

      // Each mapping's action should be rendered (may appear multiple times due to tooltips, etc.)
      expect(screen.getAllByText('Toggle Landing Gear').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Afterburner').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Toggle Quantum Mode').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Sprint').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Crouch').length).toBeGreaterThan(0)
    })

    it('shows group headers with counts in by-mode view', () => {
      const config = createMockConfig()

      render(<MappingBrowser config={config} />)

      // flight group should have count (using heading role to avoid matching dropdown option)
      const flightHeader = screen.getByRole('heading', { name: /flight/ })
      expect(flightHeader.textContent).toContain('(3)')

      // on-foot group should have count
      const onFootHeader = screen.getByRole('heading', { name: /on-foot/ })
      expect(onFootHeader.textContent).toContain('(2)')
    })
  })

  describe('empty state', () => {
    it('shows empty state when no mappings', () => {
      const config = createMockConfig({
        mappings: [],
      })

      render(<MappingBrowser config={config} />)

      expect(screen.getByText('No mappings found')).toBeInTheDocument()
    })

    it('shows empty state when filters exclude all', async () => {
      const user = userEvent.setup()
      const config = createMockConfig({
        mappings: [
          createMockMapping({ gameplayMode: 'flight' }),
        ],
        availableModes: ['flight', 'on-foot'] as GameplayMode[],
      })

      render(<MappingBrowser config={config} />)

      // Filter to on-foot mode (no mappings)
      const modeSelect = screen.getByDisplayValue('All Modes')
      await user.selectOptions(modeSelect, 'on-foot')

      await waitFor(() => {
        expect(screen.getByText('No mappings found')).toBeInTheDocument()
      })
    })
  })

  describe('combined filters', () => {
    it('applies mode and modifier filters together', async () => {
      const user = userEvent.setup()
      const config = createMockConfig()

      render(<MappingBrowser config={config} />)

      // Filter to flight mode
      const modeSelect = screen.getByDisplayValue('All Modes')
      await user.selectOptions(modeSelect, 'flight')

      // Filter to LB modifier
      const selects = screen.getAllByRole('combobox')
      const modifierSelect = selects[1]
      await user.selectOptions(modifierSelect, 'LB')

      await waitFor(() => {
        // Only Toggle Quantum Mode (flight + LB) should match
        expect(screen.getByText(/Showing 1 of 5 mappings/)).toBeInTheDocument()
      })
    })

    it('applies search with mode filter', async () => {
      const user = userEvent.setup()
      const config = createMockConfig()

      render(<MappingBrowser config={config} />)

      // Search for "A" button
      const searchInput = screen.getByPlaceholderText('Search by action, button, or description...')
      await user.type(searchInput, 'landing')

      // Filter to flight mode
      const modeSelect = screen.getByDisplayValue('All Modes')
      await user.selectOptions(modeSelect, 'flight')

      await waitFor(() => {
        // Only Toggle Landing Gear should match
        expect(screen.getByText(/Showing 1 of 5 mappings/)).toBeInTheDocument()
      })
    })
  })
})
