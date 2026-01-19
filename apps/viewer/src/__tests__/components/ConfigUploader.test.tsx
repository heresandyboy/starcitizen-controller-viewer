import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ConfigUploader } from '@/components/ConfigUploader'
import type { UnifiedMapping } from '@/lib/types/unified'

// Mock the parsers module
vi.mock('@/lib/parsers', () => ({
  parseAndResolve: vi.fn(),
  getAvailableModes: vi.fn(() => ['flight', 'on-foot']),
  getAvailableModifiers: vi.fn(() => ['A', 'B']),
}))

import { parseAndResolve, getAvailableModes, getAvailableModifiers } from '@/lib/parsers'

const mockParseAndResolve = vi.mocked(parseAndResolve)
const mockGetAvailableModes = vi.mocked(getAvailableModes)
const mockGetAvailableModifiers = vi.mocked(getAvailableModifiers)

function createMockFile(name: string, content: string = 'mock content'): File {
  const file = new File([content], name, { type: 'text/plain' })
  // Mock the text() method since JSDOM doesn't fully support File API
  Object.defineProperty(file, 'text', {
    value: () => Promise.resolve(content),
    writable: true,
  })
  return file
}

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
    source: 'rewasd+xml',
    ...overrides,
  }
}

describe('ConfigUploader', () => {
  const mockOnConfigLoaded = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockParseAndResolve.mockReturnValue({
      mappings: [createMockMapping()],
      errors: [],
    })
  })

  describe('rendering', () => {
    it('renders drop zone with instructions', () => {
      render(<ConfigUploader onConfigLoaded={mockOnConfigLoaded} />)

      expect(screen.getByText('Drop config files here')).toBeInTheDocument()
      expect(screen.getByText('or click to browse')).toBeInTheDocument()
      expect(screen.getByText('Accepts .rewasd and .xml files')).toBeInTheDocument()
    })

    it('renders file status indicators', () => {
      render(<ConfigUploader onConfigLoaded={mockOnConfigLoaded} />)

      expect(screen.getByText('reWASD Config')).toBeInTheDocument()
      expect(screen.getByText('Star Citizen XML')).toBeInTheDocument()
      expect(screen.getAllByText('Not loaded')).toHaveLength(2)
    })

    it('shows required indicator for both files', () => {
      render(<ConfigUploader onConfigLoaded={mockOnConfigLoaded} />)

      // Both files should have required indicator (red asterisk)
      const asterisks = screen.getAllByText('*')
      expect(asterisks).toHaveLength(2)
    })

    it('renders hidden file input', () => {
      const { container } = render(<ConfigUploader onConfigLoaded={mockOnConfigLoaded} />)

      const input = container.querySelector('input[type="file"]')
      expect(input).toBeInTheDocument()
      expect(input).toHaveAttribute('accept', '.rewasd,.xml')
      expect(input).toHaveAttribute('multiple')
    })
  })

  describe('file selection via input', () => {
    it('accepts rewasd file', async () => {
      render(<ConfigUploader onConfigLoaded={mockOnConfigLoaded} />)

      const input = document.querySelector('input[type="file"]')!

      const rewasdFile = createMockFile('controller.rewasd')
      fireEvent.change(input, { target: { files: [rewasdFile] } })

      await waitFor(() => {
        expect(screen.getByText('controller.rewasd')).toBeInTheDocument()
      })
    })

    it('accepts xml file', async () => {
      render(<ConfigUploader onConfigLoaded={mockOnConfigLoaded} />)

      const input = document.querySelector('input[type="file"]')!

      const xmlFile = createMockFile('layout.xml')
      fireEvent.change(input, { target: { files: [xmlFile] } })

      await waitFor(() => {
        expect(screen.getByText('layout.xml')).toBeInTheDocument()
      })
    })

    it('auto-parses when both files are selected', async () => {
      render(<ConfigUploader onConfigLoaded={mockOnConfigLoaded} />)

      const input = document.querySelector('input[type="file"]')!

      const rewasdFile = createMockFile('controller.rewasd')
      const xmlFile = createMockFile('layout.xml')

      fireEvent.change(input, { target: { files: [rewasdFile, xmlFile] } })

      await waitFor(() => {
        expect(mockParseAndResolve).toHaveBeenCalled()
      })
    })

    it('calls onConfigLoaded with parsed config', async () => {
      const mockMappings = [createMockMapping()]
      mockParseAndResolve.mockReturnValue({
        mappings: mockMappings,
        errors: [],
      })
      mockGetAvailableModes.mockReturnValue(['flight', 'on-foot'])
      mockGetAvailableModifiers.mockReturnValue(['A', 'B'])

      render(<ConfigUploader onConfigLoaded={mockOnConfigLoaded} />)

      const input = document.querySelector('input[type="file"]')!

      const rewasdFile = createMockFile('controller.rewasd')
      const xmlFile = createMockFile('layout.xml')

      fireEvent.change(input, { target: { files: [rewasdFile, xmlFile] } })

      await waitFor(() => {
        expect(mockOnConfigLoaded).toHaveBeenCalledWith({
          loaded: true,
          rewasdFileName: 'controller.rewasd',
          xmlFileName: 'layout.xml',
          mappings: mockMappings,
          availableModes: ['flight', 'on-foot'],
          availableModifiers: ['A', 'B'],
        })
      })
    })
  })

  describe('drag and drop', () => {
    it('shows drag highlight on dragOver', () => {
      const { container } = render(<ConfigUploader onConfigLoaded={mockOnConfigLoaded} />)

      const dropZone = container.querySelector('.border-dashed')!

      fireEvent.dragOver(dropZone, { preventDefault: () => {} })

      expect(dropZone.className).toContain('border-blue-500')
    })

    it('removes drag highlight on dragLeave', () => {
      const { container } = render(<ConfigUploader onConfigLoaded={mockOnConfigLoaded} />)

      const dropZone = container.querySelector('.border-dashed')!

      fireEvent.dragOver(dropZone, { preventDefault: () => {} })
      fireEvent.dragLeave(dropZone, { preventDefault: () => {} })

      expect(dropZone.className).not.toContain('border-blue-500')
    })

    it('handles file drop', async () => {
      const { container } = render(<ConfigUploader onConfigLoaded={mockOnConfigLoaded} />)

      const dropZone = container.querySelector('.border-dashed')!

      const rewasdFile = createMockFile('controller.rewasd')
      const xmlFile = createMockFile('layout.xml')

      const dataTransfer = {
        files: [rewasdFile, xmlFile],
      }

      fireEvent.drop(dropZone, {
        preventDefault: () => {},
        dataTransfer,
      })

      await waitFor(() => {
        expect(screen.getByText('controller.rewasd')).toBeInTheDocument()
        expect(screen.getByText('layout.xml')).toBeInTheDocument()
      })
    })
  })

  describe('loading state', () => {
    it('shows loading message while parsing', async () => {
      let resolvePromise: (value: string) => void
      const textPromise = new Promise<string>(resolve => {
        resolvePromise = resolve
      })

      const rewasdFile = createMockFile('controller.rewasd')
      const xmlFile = createMockFile('layout.xml')

      // Mock the text() method to delay
      vi.spyOn(rewasdFile, 'text').mockReturnValue(textPromise)
      vi.spyOn(xmlFile, 'text').mockResolvedValue('<xml/>')

      render(<ConfigUploader onConfigLoaded={mockOnConfigLoaded} />)

      const input = document.querySelector('input[type="file"]')!

      fireEvent.change(input, { target: { files: [rewasdFile, xmlFile] } })

      await waitFor(() => {
        expect(screen.getByText('Parsing configs...')).toBeInTheDocument()
      })

      // Resolve the promise to allow parsing to complete
      resolvePromise!('{}')

      await waitFor(() => {
        expect(screen.queryByText('Parsing configs...')).not.toBeInTheDocument()
      })
    })
  })

  describe('error handling', () => {
    it('displays parser errors', async () => {
      mockParseAndResolve.mockReturnValue({
        mappings: [],
        errors: ['Failed to parse rewasd file'],
      })

      render(<ConfigUploader onConfigLoaded={mockOnConfigLoaded} />)

      const input = document.querySelector('input[type="file"]')!

      const rewasdFile = createMockFile('controller.rewasd')
      const xmlFile = createMockFile('layout.xml')

      fireEvent.change(input, { target: { files: [rewasdFile, xmlFile] } })

      await waitFor(() => {
        expect(screen.getByText('Failed to parse rewasd file')).toBeInTheDocument()
      })
    })

    it('displays exception messages', async () => {
      mockParseAndResolve.mockImplementation(() => {
        throw new Error('Invalid file format')
      })

      render(<ConfigUploader onConfigLoaded={mockOnConfigLoaded} />)

      const input = document.querySelector('input[type="file"]')!

      const rewasdFile = createMockFile('controller.rewasd')
      const xmlFile = createMockFile('layout.xml')

      fireEvent.change(input, { target: { files: [rewasdFile, xmlFile] } })

      await waitFor(() => {
        expect(screen.getByText('Invalid file format')).toBeInTheDocument()
      })
    })

    it('displays generic error for non-Error exceptions', async () => {
      mockParseAndResolve.mockImplementation(() => {
        throw 'Unknown error'
      })

      render(<ConfigUploader onConfigLoaded={mockOnConfigLoaded} />)

      const input = document.querySelector('input[type="file"]')!

      const rewasdFile = createMockFile('controller.rewasd')
      const xmlFile = createMockFile('layout.xml')

      fireEvent.change(input, { target: { files: [rewasdFile, xmlFile] } })

      await waitFor(() => {
        expect(screen.getByText('Failed to parse config files')).toBeInTheDocument()
      })
    })

    it('clears error when new files are selected', async () => {
      mockParseAndResolve.mockReturnValueOnce({
        mappings: [],
        errors: ['First error'],
      }).mockReturnValue({
        mappings: [createMockMapping()],
        errors: [],
      })

      render(<ConfigUploader onConfigLoaded={mockOnConfigLoaded} />)

      const input = document.querySelector('input[type="file"]')!

      // First upload with error
      const rewasdFile1 = createMockFile('controller.rewasd')
      const xmlFile1 = createMockFile('layout.xml')
      fireEvent.change(input, { target: { files: [rewasdFile1, xmlFile1] } })

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument()
      })

      // Second upload without error
      const rewasdFile2 = createMockFile('controller2.rewasd')
      const xmlFile2 = createMockFile('layout2.xml')
      fireEvent.change(input, { target: { files: [rewasdFile2, xmlFile2] } })

      await waitFor(() => {
        expect(screen.queryByText('First error')).not.toBeInTheDocument()
      })
    })

    it('still calls onConfigLoaded even with non-fatal errors', async () => {
      const mockMappings = [createMockMapping()]
      mockParseAndResolve.mockReturnValue({
        mappings: mockMappings,
        errors: ['Warning: some bindings could not be resolved'],
      })

      render(<ConfigUploader onConfigLoaded={mockOnConfigLoaded} />)

      const input = document.querySelector('input[type="file"]')!

      const rewasdFile = createMockFile('controller.rewasd')
      const xmlFile = createMockFile('layout.xml')

      fireEvent.change(input, { target: { files: [rewasdFile, xmlFile] } })

      await waitFor(() => {
        // Error should be shown
        expect(screen.getByText('Warning: some bindings could not be resolved')).toBeInTheDocument()
        // But onConfigLoaded should still be called
        expect(mockOnConfigLoaded).toHaveBeenCalled()
      })
    })
  })

  describe('manual parse button', () => {
    it('shows parse button when both files are selected', async () => {
      render(<ConfigUploader onConfigLoaded={mockOnConfigLoaded} />)

      const input = document.querySelector('input[type="file"]')!

      const rewasdFile = createMockFile('controller.rewasd')
      const xmlFile = createMockFile('layout.xml')

      fireEvent.change(input, { target: { files: [rewasdFile, xmlFile] } })

      await waitFor(() => {
        expect(screen.getByText('Parse Configs')).toBeInTheDocument()
      })
    })

    it('does not show parse button when only one file is selected', async () => {
      render(<ConfigUploader onConfigLoaded={mockOnConfigLoaded} />)

      const input = document.querySelector('input[type="file"]')!

      const rewasdFile = createMockFile('controller.rewasd')
      fireEvent.change(input, { target: { files: [rewasdFile] } })

      await waitFor(() => {
        expect(screen.getByText('controller.rewasd')).toBeInTheDocument()
      })

      expect(screen.queryByText('Parse Configs')).not.toBeInTheDocument()
    })

    it('triggers parse when parse button is clicked', async () => {
      render(<ConfigUploader onConfigLoaded={mockOnConfigLoaded} />)

      const input = document.querySelector('input[type="file"]')!

      const rewasdFile = createMockFile('controller.rewasd')
      const xmlFile = createMockFile('layout.xml')

      fireEvent.change(input, { target: { files: [rewasdFile, xmlFile] } })

      await waitFor(() => {
        expect(screen.getByText('Parse Configs')).toBeInTheDocument()
      })

      // Clear the mock calls from auto-parse
      mockParseAndResolve.mockClear()
      mockOnConfigLoaded.mockClear()

      fireEvent.click(screen.getByText('Parse Configs'))

      await waitFor(() => {
        expect(mockParseAndResolve).toHaveBeenCalled()
        expect(mockOnConfigLoaded).toHaveBeenCalled()
      })
    })
  })

  describe('file status display', () => {
    it('shows checkmark for loaded file', async () => {
      render(<ConfigUploader onConfigLoaded={mockOnConfigLoaded} />)

      const input = document.querySelector('input[type="file"]')!

      const rewasdFile = createMockFile('controller.rewasd')
      fireEvent.change(input, { target: { files: [rewasdFile] } })

      await waitFor(() => {
        expect(screen.getByText('✓')).toBeInTheDocument()
      })
    })

    it('truncates long file names', async () => {
      render(<ConfigUploader onConfigLoaded={mockOnConfigLoaded} />)

      const input = document.querySelector('input[type="file"]')!

      const rewasdFile = createMockFile('this-is-a-very-long-file-name-that-should-be-truncated.rewasd')
      fireEvent.change(input, { target: { files: [rewasdFile] } })

      await waitFor(() => {
        const fileNameElement = screen.getByText(/this-is-a-very-long/)
        expect(fileNameElement.className).toContain('truncate')
        expect(fileNameElement.className).toContain('max-w-[200px]')
      })
    })
  })
})
