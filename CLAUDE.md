# Claude Code Project Instructions

## Session Start

At the beginning of each session, if the Serena MCP plugin is available:
1. Call `activate_project` with project name "starcitizen-controller-viewer"
2. The project memories contain important context about code style and project structure

## Project Overview

This is a React + TypeScript monorepo for visualizing Star Citizen controller mappings.
See `.serena/memories/project_overview.md` for detailed architecture.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

## Serena Integration

This project uses Serena for semantic code understanding. The `.serena/` directory contains:
- `project.yml` - Serena configuration
- `memories/` - Project knowledge (code_style, project_overview, etc.)
