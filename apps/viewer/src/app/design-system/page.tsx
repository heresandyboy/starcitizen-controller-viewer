'use client';

import Link from 'next/link';

/* ------------------------------------------------------------------ */
/*  Color Swatch Data                                                  */
/* ------------------------------------------------------------------ */

const backgroundColors = [
  { name: 'background', class: 'bg-background', hex: '#0F0F23' },
  { name: 'surface', class: 'bg-surface', hex: '#1A1A36' },
  { name: 'surface-elevated', class: 'bg-surface-elevated', hex: '#232346' },
  { name: 'surface-hover', class: 'bg-surface-hover', hex: '#2A2A52' },
  { name: 'surface-dim', class: 'bg-surface-dim', hex: '#161633' },
];

const accentColors = [
  { name: 'primary', class: 'bg-primary', hex: '#7C3AED' },
  { name: 'primary-hover', class: 'bg-primary-hover', hex: '#6D28D9' },
  { name: 'primary-light', class: 'bg-primary-light', hex: '#A78BFA' },
  { name: 'primary-subtle', class: 'bg-primary-subtle', hex: 'rgba(124,58,237,0.12)' },
  { name: 'cta', class: 'bg-cta', hex: '#F43F5E' },
  { name: 'cta-hover', class: 'bg-cta-hover', hex: '#E11D48' },
];

const textColors = [
  { name: 'text', class: 'text-text', hex: '#E2E8F0' },
  { name: 'text-secondary', class: 'text-text-secondary', hex: '#94A3B8' },
  { name: 'text-muted', class: 'text-text-muted', hex: '#64748B' },
  { name: 'text-dim', class: 'text-text-dim', hex: '#475569' },
];

const inputBadgeColors = [
  { name: 'kbd', class: 'bg-kbd', subtle: 'bg-kbd-subtle', hex: '#3B82F6', label: 'Keyboard' },
  { name: 'mouse', class: 'bg-mouse', subtle: 'bg-mouse-subtle', hex: '#8B5CF6', label: 'Mouse' },
  { name: 'gamepad', class: 'bg-gamepad', subtle: 'bg-gamepad-subtle', hex: '#10B981', label: 'Gamepad' },
  { name: 'joystick', class: 'bg-joystick', subtle: 'bg-joystick-subtle', hex: '#F59E0B', label: 'Joystick' },
  { name: 'rewasd', class: 'bg-rewasd', subtle: 'bg-rewasd-subtle', hex: '#F97316', label: 'reWASD' },
];

const semanticColors = [
  { name: 'success', class: 'bg-success', subtle: 'bg-success-subtle', hex: '#10B981' },
  { name: 'warning', class: 'bg-warning', subtle: 'bg-warning-subtle', hex: '#F59E0B' },
  { name: 'error', class: 'bg-error', subtle: 'bg-error-subtle', hex: '#EF4444' },
  { name: 'info', class: 'bg-info', subtle: 'bg-info-subtle', hex: '#3B82F6' },
];

const borderColors = [
  { name: 'border', class: 'border-border', hex: '#2A2A52' },
  { name: 'border-subtle', class: 'border-border-subtle', hex: '#1E1E3F' },
  { name: 'border-accent', class: 'border-border-accent', hex: 'rgba(124,58,237,0.3)' },
];

/* ------------------------------------------------------------------ */
/*  Section Heading                                                    */
/* ------------------------------------------------------------------ */

function SectionHeading({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <h2
      id={id}
      className="font-display text-2xl font-semibold text-primary-light mb-6 mt-16 first:mt-0 scroll-mt-8"
    >
      {children}
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display text-lg font-medium text-text mb-4 mt-8">
      {children}
    </h3>
  );
}

/* ------------------------------------------------------------------ */
/*  Page Component                                                     */
/* ------------------------------------------------------------------ */

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background text-text">
      {/* Top bar */}
      <header className="border-b border-border bg-surface sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-display text-text tracking-tight">
              Design System
            </h1>
            <p className="text-sm text-text-secondary mt-1 font-body">
              Star Citizen Controller Viewer
            </p>
          </div>
          <Link
            href="/"
            className="text-sm px-4 py-2 rounded-md border border-border text-text-secondary hover:text-text hover:bg-surface-hover hover:border-border-accent transition-colors focus-ring font-body"
          >
            Back to App
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-6 py-10 space-y-4">

        {/* ============================================================ */}
        {/*  1. COLOR PALETTE                                            */}
        {/* ============================================================ */}
        <SectionHeading id="colors">Color Palette</SectionHeading>

        {/* Backgrounds */}
        <SubHeading>Background Hierarchy</SubHeading>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {backgroundColors.map((c) => (
            <div key={c.name} className="flex flex-col gap-2">
              <div
                className={`${c.class} h-20 rounded-lg border border-border shadow-sm`}
              />
              <div className="space-y-0.5">
                <p className="text-sm font-display text-text">{c.name}</p>
                <p className="text-xs text-text-muted font-mono">{c.class}</p>
                <p className="text-xs text-text-dim font-mono">{c.hex}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Accents */}
        <SubHeading>Accent Colors</SubHeading>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {accentColors.map((c) => (
            <div key={c.name} className="flex flex-col gap-2">
              <div
                className={`${c.class} h-20 rounded-lg border border-border shadow-sm`}
              />
              <div className="space-y-0.5">
                <p className="text-sm font-display text-text">{c.name}</p>
                <p className="text-xs text-text-muted font-mono">{c.class}</p>
                <p className="text-xs text-text-dim font-mono">{c.hex}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Text colors */}
        <SubHeading>Text Colors</SubHeading>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {textColors.map((c) => (
            <div
              key={c.name}
              className="bg-surface rounded-lg border border-border p-4 shadow-sm"
            >
              <p className={`${c.class} text-lg font-display font-semibold mb-2`}>
                Aa Bb Cc
              </p>
              <p className="text-sm font-display text-text">{c.name}</p>
              <p className="text-xs text-text-muted font-mono">{c.class}</p>
              <p className="text-xs text-text-dim font-mono">{c.hex}</p>
            </div>
          ))}
        </div>

        {/* Input badge colors */}
        <SubHeading>Input Type Badge Colors</SubHeading>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {inputBadgeColors.map((c) => (
            <div key={c.name} className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <div className={`${c.class} h-14 rounded-lg shadow-sm`} />
                <div className={`${c.subtle} h-14 rounded-lg border border-border`} />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-display text-text">{c.label}</p>
                <p className="text-xs text-text-muted font-mono">{c.class}</p>
                <p className="text-xs text-text-muted font-mono">{c.subtle}</p>
                <p className="text-xs text-text-dim font-mono">{c.hex}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Semantic status */}
        <SubHeading>Semantic Status Colors</SubHeading>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {semanticColors.map((c) => (
            <div key={c.name} className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <div className={`${c.class} h-14 rounded-lg shadow-sm`} />
                <div className={`${c.subtle} h-14 rounded-lg border border-border`} />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-display text-text capitalize">{c.name}</p>
                <p className="text-xs text-text-muted font-mono">{c.class}</p>
                <p className="text-xs text-text-muted font-mono">{c.subtle}</p>
                <p className="text-xs text-text-dim font-mono">{c.hex}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Borders */}
        <SubHeading>Border Colors</SubHeading>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {borderColors.map((c) => (
            <div
              key={c.name}
              className={`${c.class} border-2 bg-surface rounded-lg p-5 flex flex-col gap-1`}
            >
              <p className="text-sm font-display text-text">{c.name}</p>
              <p className="text-xs text-text-muted font-mono">{c.class}</p>
              <p className="text-xs text-text-dim font-mono">{c.hex}</p>
            </div>
          ))}
        </div>

        {/* ============================================================ */}
        {/*  2. TYPOGRAPHY                                               */}
        {/* ============================================================ */}
        <SectionHeading id="typography">Typography</SectionHeading>

        {/* Font families */}
        <SubHeading>Font Families</SubHeading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface rounded-lg border border-border p-6 shadow-sm">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-3 font-body">
              Display / Mono
            </p>
            <p className="font-display text-2xl text-text mb-1">Fira Code</p>
            <p className="font-display text-lg text-text-secondary">
              ABCDEFGHIJKLM
            </p>
            <p className="font-display text-lg text-text-secondary">
              nopqrstuvwxyz
            </p>
            <p className="font-display text-lg text-text-secondary">0123456789</p>
            <p className="text-xs text-text-dim font-mono mt-3">font-display / font-mono</p>
          </div>
          <div className="bg-surface rounded-lg border border-border p-6 shadow-sm md:col-span-2">
            <p className="text-xs text-text-muted uppercase tracking-wider mb-3 font-body">
              Body
            </p>
            <p className="font-body text-2xl text-text mb-1">Fira Sans</p>
            <p className="font-body text-lg text-text-secondary">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
            </p>
            <p className="font-body text-lg text-text-secondary">
              abcdefghijklmnopqrstuvwxyz
            </p>
            <p className="font-body text-lg text-text-secondary">0123456789</p>
            <p className="text-xs text-text-dim font-mono mt-3">font-body</p>
          </div>
        </div>

        {/* Type scale */}
        <SubHeading>Type Scale</SubHeading>
        <div className="bg-surface rounded-lg border border-border p-6 shadow-sm space-y-4">
          {[
            { label: 'text-4xl', cls: 'text-4xl' },
            { label: 'text-3xl', cls: 'text-3xl' },
            { label: 'text-2xl', cls: 'text-2xl' },
            { label: 'text-xl', cls: 'text-xl' },
            { label: 'text-lg', cls: 'text-lg' },
            { label: 'text-base', cls: 'text-base' },
            { label: 'text-sm', cls: 'text-sm' },
            { label: 'text-xs', cls: 'text-xs' },
          ].map((t) => (
            <div key={t.label} className="flex items-baseline gap-4">
              <span className="text-xs text-text-dim font-mono w-20 shrink-0 text-right">
                {t.label}
              </span>
              <span className={`${t.cls} font-body text-text`}>
                The quick brown fox jumps over the lazy dog
              </span>
            </div>
          ))}
        </div>

        {/* Font weights */}
        <SubHeading>Font Weights</SubHeading>
        <div className="bg-surface rounded-lg border border-border p-6 shadow-sm space-y-3">
          {[
            { label: 'Light (300)', cls: 'font-light' },
            { label: 'Normal (400)', cls: 'font-normal' },
            { label: 'Medium (500)', cls: 'font-medium' },
            { label: 'Semibold (600)', cls: 'font-semibold' },
            { label: 'Bold (700)', cls: 'font-bold' },
          ].map((w) => (
            <div key={w.label} className="flex items-baseline gap-4">
              <span className="text-xs text-text-dim font-mono w-32 shrink-0 text-right">
                {w.label}
              </span>
              <span className={`${w.cls} font-body text-xl text-text`}>
                Star Citizen Controller Viewer
              </span>
            </div>
          ))}
        </div>

        {/* ============================================================ */}
        {/*  3. BUTTONS                                                  */}
        {/* ============================================================ */}
        <SectionHeading id="buttons">Buttons</SectionHeading>

        {/* Button variants */}
        <SubHeading>Variants</SubHeading>
        <div className="bg-surface rounded-lg border border-border p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            {/* Primary */}
            <button className="bg-primary hover:bg-primary-hover text-primary-fg font-body font-medium rounded-md px-5 py-2.5 transition-colors shadow-sm focus-ring">
              Primary
            </button>
            {/* Secondary */}
            <button className="bg-surface-elevated hover:bg-surface-hover text-text border border-border hover:border-border-accent font-body font-medium rounded-md px-5 py-2.5 transition-colors shadow-sm focus-ring">
              Secondary
            </button>
            {/* Ghost */}
            <button className="bg-transparent hover:bg-surface-elevated text-text-secondary hover:text-text font-body font-medium rounded-md px-5 py-2.5 transition-colors focus-ring">
              Ghost
            </button>
            {/* CTA */}
            <button className="bg-cta hover:bg-cta-hover text-cta-fg font-body font-medium rounded-md px-5 py-2.5 transition-colors shadow-glow-cta focus-ring">
              Call to Action
            </button>
            {/* Destructive */}
            <button className="bg-error hover:bg-cta-hover text-text font-body font-medium rounded-md px-5 py-2.5 transition-colors shadow-sm focus-ring">
              Destructive
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-border-subtle">
            <div className="flex flex-wrap gap-2">
              <code className="text-xs font-mono text-text-muted bg-surface-dim px-2 py-1 rounded-sm">Primary: bg-primary hover:bg-primary-hover</code>
              <code className="text-xs font-mono text-text-muted bg-surface-dim px-2 py-1 rounded-sm">Secondary: bg-surface-elevated + border</code>
              <code className="text-xs font-mono text-text-muted bg-surface-dim px-2 py-1 rounded-sm">CTA: bg-cta shadow-glow-cta</code>
            </div>
          </div>
        </div>

        {/* Button sizes */}
        <SubHeading>Sizes</SubHeading>
        <div className="bg-surface rounded-lg border border-border p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-4">
            {/* Small */}
            <button className="bg-primary hover:bg-primary-hover text-primary-fg font-body font-medium rounded-md px-3 py-1.5 text-sm transition-colors shadow-sm focus-ring">
              Small
            </button>
            {/* Default */}
            <button className="bg-primary hover:bg-primary-hover text-primary-fg font-body font-medium rounded-md px-5 py-2.5 text-base transition-colors shadow-sm focus-ring">
              Default
            </button>
            {/* Large */}
            <button className="bg-primary hover:bg-primary-hover text-primary-fg font-body font-medium rounded-lg px-7 py-3.5 text-lg transition-colors shadow-md focus-ring">
              Large
            </button>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            {/* Small secondary */}
            <button className="bg-surface-elevated hover:bg-surface-hover text-text border border-border hover:border-border-accent font-body font-medium rounded-md px-3 py-1.5 text-sm transition-colors shadow-sm focus-ring">
              Small
            </button>
            {/* Default secondary */}
            <button className="bg-surface-elevated hover:bg-surface-hover text-text border border-border hover:border-border-accent font-body font-medium rounded-md px-5 py-2.5 text-base transition-colors shadow-sm focus-ring">
              Default
            </button>
            {/* Large secondary */}
            <button className="bg-surface-elevated hover:bg-surface-hover text-text border border-border hover:border-border-accent font-body font-medium rounded-lg px-7 py-3.5 text-lg transition-colors shadow-md focus-ring">
              Large
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-border-subtle">
            <div className="flex flex-wrap gap-2">
              <code className="text-xs font-mono text-text-muted bg-surface-dim px-2 py-1 rounded-sm">Small: px-3 py-1.5 text-sm</code>
              <code className="text-xs font-mono text-text-muted bg-surface-dim px-2 py-1 rounded-sm">Default: px-5 py-2.5 text-base</code>
              <code className="text-xs font-mono text-text-muted bg-surface-dim px-2 py-1 rounded-sm">Large: px-7 py-3.5 text-lg</code>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/*  4. BADGES / PILLS                                           */}
        {/* ============================================================ */}
        <SectionHeading id="badges">Badges &amp; Pills</SectionHeading>

        {/* Input type badges */}
        <SubHeading>Input Type Badges</SubHeading>
        <div className="bg-surface rounded-lg border border-border p-8 shadow-sm">
          <div className="flex flex-wrap gap-3 mb-6">
            {inputBadgeColors.map((b) => (
              <span
                key={b.name}
                className={`${b.class} text-text font-display text-xs font-medium px-3 py-1 rounded-full shadow-sm`}
              >
                {b.label}
              </span>
            ))}
          </div>
          <p className="text-xs text-text-muted font-body mb-3">Subtle variants (for inline use)</p>
          <div className="flex flex-wrap gap-3">
            {inputBadgeColors.map((b) => (
              <span
                key={`${b.name}-subtle`}
                className={`${b.subtle} text-${b.name} font-display text-xs font-medium px-3 py-1 rounded-full border border-border`}
              >
                {b.label}
              </span>
            ))}
          </div>
        </div>

        {/* Status badges */}
        <SubHeading>Status Badges</SubHeading>
        <div className="bg-surface rounded-lg border border-border p-8 shadow-sm">
          <div className="flex flex-wrap gap-3 mb-6">
            {semanticColors.map((s) => (
              <span
                key={s.name}
                className={`${s.class} text-text font-display text-xs font-medium px-3 py-1 rounded-full shadow-sm`}
              >
                {s.name}
              </span>
            ))}
          </div>
          <p className="text-xs text-text-muted font-body mb-3">Subtle variants</p>
          <div className="flex flex-wrap gap-3">
            {semanticColors.map((s) => (
              <span
                key={`${s.name}-subtle`}
                className={`${s.subtle} text-${s.name} font-display text-xs font-medium px-3 py-1 rounded-full border border-border`}
              >
                {s.name}
              </span>
            ))}
          </div>
        </div>

        {/* Generic accent badges */}
        <SubHeading>Accent Badges</SubHeading>
        <div className="bg-surface rounded-lg border border-border p-8 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <span className="bg-primary text-primary-fg font-display text-xs font-medium px-3 py-1 rounded-full shadow-sm">
              Primary
            </span>
            <span className="bg-primary-subtle text-primary-light font-display text-xs font-medium px-3 py-1 rounded-full border border-border-accent">
              Primary Subtle
            </span>
            <span className="bg-cta text-cta-fg font-display text-xs font-medium px-3 py-1 rounded-full shadow-sm">
              CTA
            </span>
            <span className="bg-surface-elevated text-text-secondary font-display text-xs font-medium px-3 py-1 rounded-full border border-border">
              Neutral
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/*  5. CARDS                                                    */}
        {/* ============================================================ */}
        <SectionHeading id="cards">Cards</SectionHeading>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Surface card */}
          <div className="bg-surface rounded-lg border border-border p-6 shadow-sm">
            <p className="font-display text-sm text-primary-light mb-2">Surface Card</p>
            <p className="text-sm text-text-secondary font-body">
              The default card style. Uses <code className="font-mono text-text-muted">bg-surface</code> background with a standard border and subtle shadow.
            </p>
            <div className="mt-4 pt-3 border-t border-border-subtle">
              <code className="text-xs font-mono text-text-dim">
                bg-surface border-border rounded-lg shadow-sm
              </code>
            </div>
          </div>

          {/* Elevated card */}
          <div className="bg-surface-elevated rounded-lg border border-border p-6 shadow-md">
            <p className="font-display text-sm text-primary-light mb-2">Elevated Card</p>
            <p className="text-sm text-text-secondary font-body">
              Raised card for emphasis. Uses <code className="font-mono text-text-muted">bg-surface-elevated</code> with a medium shadow.
            </p>
            <div className="mt-4 pt-3 border-t border-border-subtle">
              <code className="text-xs font-mono text-text-dim">
                bg-surface-elevated border-border rounded-lg shadow-md
              </code>
            </div>
          </div>

          {/* Glow card */}
          <div className="bg-surface rounded-lg border border-border-accent p-6 shadow-glow-md">
            <p className="font-display text-sm text-primary-light mb-2">Glow Card</p>
            <p className="text-sm text-text-secondary font-body">
              Card with purple glow effect for highlighting important content. Uses accent border and glow shadow.
            </p>
            <div className="mt-4 pt-3 border-t border-border-subtle">
              <code className="text-xs font-mono text-text-dim">
                border-border-accent shadow-glow-md
              </code>
            </div>
          </div>

          {/* Accent border card */}
          <div className="bg-surface rounded-lg border-l-4 border-l-primary border border-border p-6 shadow-sm">
            <p className="font-display text-sm text-primary-light mb-2">Accent Border Card</p>
            <p className="text-sm text-text-secondary font-body">
              Card with a left accent border to draw attention. Useful for callouts, tips, or important notices.
            </p>
            <div className="mt-4 pt-3 border-t border-border-subtle">
              <code className="text-xs font-mono text-text-dim">
                border-l-4 border-l-primary
              </code>
            </div>
          </div>

          {/* CTA glow card */}
          <div className="bg-surface rounded-lg border border-cta/30 p-6 shadow-glow-cta">
            <p className="font-display text-sm text-cta mb-2">CTA Glow Card</p>
            <p className="text-sm text-text-secondary font-body">
              Red glow card for call-to-action emphasis. Draws the eye to important actions.
            </p>
            <div className="mt-4 pt-3 border-t border-border-subtle">
              <code className="text-xs font-mono text-text-dim">
                border-cta/30 shadow-glow-cta
              </code>
            </div>
          </div>

          {/* Interactive card */}
          <button className="bg-surface rounded-lg border border-border p-6 shadow-sm hover:bg-surface-elevated hover:border-border-accent hover:shadow-glow-sm transition-all text-left focus-ring">
            <p className="font-display text-sm text-primary-light mb-2">Interactive Card</p>
            <p className="text-sm text-text-secondary font-body">
              A clickable card with hover effects. Elevates on hover and gains a glow. Try hovering and focusing.
            </p>
            <div className="mt-4 pt-3 border-t border-border-subtle">
              <code className="text-xs font-mono text-text-dim">
                hover:bg-surface-elevated hover:shadow-glow-sm
              </code>
            </div>
          </button>
        </div>

        {/* ============================================================ */}
        {/*  6. FORM ELEMENTS                                            */}
        {/* ============================================================ */}
        <SectionHeading id="forms">Form Elements</SectionHeading>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Text input */}
          <div className="space-y-2">
            <label className="text-sm font-body text-text-secondary block">
              Text Input
            </label>
            <input
              type="text"
              placeholder="Enter binding name..."
              className="w-full bg-surface-dim border border-border rounded-md px-4 py-2.5 text-sm font-body text-text placeholder:text-text-dim hover:border-border-accent transition-colors focus-ring"
            />
            <p className="text-xs font-mono text-text-dim">
              bg-surface-dim border-border rounded-md
            </p>
          </div>

          {/* Search input */}
          <div className="space-y-2">
            <label className="text-sm font-body text-text-secondary block">
              Search Input
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                placeholder="Search actions..."
                className="w-full bg-surface-dim border border-border rounded-md pl-10 pr-4 py-2.5 text-sm font-body text-text placeholder:text-text-dim hover:border-border-accent transition-colors focus-ring"
              />
            </div>
            <p className="text-xs font-mono text-text-dim">
              With search icon prefix
            </p>
          </div>

          {/* Select dropdown */}
          <div className="space-y-2">
            <label className="text-sm font-body text-text-secondary block">
              Select Dropdown
            </label>
            <div className="relative">
              <select
                className="w-full bg-surface-dim border border-border rounded-md px-4 py-2.5 text-sm font-body text-text appearance-none hover:border-border-accent transition-colors focus-ring"
                defaultValue="all"
              >
                <option value="all">All Input Types</option>
                <option value="keyboard">Keyboard</option>
                <option value="mouse">Mouse</option>
                <option value="gamepad">Gamepad</option>
                <option value="joystick">Joystick</option>
              </select>
              <svg
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim pointer-events-none"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <p className="text-xs font-mono text-text-dim">
              appearance-none with custom chevron
            </p>
          </div>

          {/* Disabled input */}
          <div className="space-y-2">
            <label className="text-sm font-body text-text-dim block">
              Disabled Input
            </label>
            <input
              type="text"
              placeholder="Not available"
              disabled
              className="w-full bg-surface-dim border border-border-subtle rounded-md px-4 py-2.5 text-sm font-body text-text-dim cursor-not-allowed opacity-60"
            />
            <p className="text-xs font-mono text-text-dim">
              opacity-60 cursor-not-allowed
            </p>
          </div>
        </div>

        {/* Toggle / checkbox-like */}
        <SubHeading>Toggle Switches</SubHeading>
        <div className="bg-surface rounded-lg border border-border p-8 shadow-sm">
          <div className="space-y-4">
            {/* Active toggle */}
            <div className="flex items-center gap-3">
              <button className="w-11 h-6 bg-primary rounded-full relative transition-colors focus-ring">
                <span className="absolute right-0.5 top-0.5 w-5 h-5 bg-text rounded-full shadow-sm transition-transform" />
              </button>
              <span className="text-sm font-body text-text">Show keybinding details</span>
            </div>
            {/* Inactive toggle */}
            <div className="flex items-center gap-3">
              <button className="w-11 h-6 bg-surface-hover rounded-full relative transition-colors focus-ring">
                <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-text-muted rounded-full shadow-sm transition-transform" />
              </button>
              <span className="text-sm font-body text-text-secondary">Show empty bindings</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border-subtle">
            <code className="text-xs font-mono text-text-dim">
              Active: bg-primary | Inactive: bg-surface-hover
            </code>
          </div>
        </div>

        {/* ============================================================ */}
        {/*  7. SHADOWS                                                  */}
        {/* ============================================================ */}
        <SectionHeading id="shadows">Shadows</SectionHeading>

        <SubHeading>Standard Shadows</SubHeading>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'shadow-sm', cls: 'shadow-sm' },
            { name: 'shadow-md', cls: 'shadow-md' },
            { name: 'shadow-lg', cls: 'shadow-lg' },
            { name: 'shadow-xl', cls: 'shadow-xl' },
          ].map((s) => (
            <div
              key={s.name}
              className={`bg-surface-elevated rounded-lg border border-border p-6 ${s.cls} flex flex-col items-center justify-center gap-2 min-h-28`}
            >
              <p className="text-sm font-display text-text">{s.name}</p>
              <p className="text-xs font-mono text-text-dim">{s.cls}</p>
            </div>
          ))}
        </div>

        <SubHeading>Glow Shadows</SubHeading>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'glow-sm', cls: 'shadow-glow-sm' },
            { name: 'glow-md', cls: 'shadow-glow-md' },
            { name: 'glow-lg', cls: 'shadow-glow-lg' },
            { name: 'glow-cta', cls: 'shadow-glow-cta' },
          ].map((s) => (
            <div
              key={s.name}
              className={`bg-surface-elevated rounded-lg border ${s.name === 'glow-cta' ? 'border-cta/30' : 'border-border-accent'} p-6 ${s.cls} flex flex-col items-center justify-center gap-2 min-h-28`}
            >
              <p className="text-sm font-display text-text">{s.name}</p>
              <p className="text-xs font-mono text-text-dim">{s.cls}</p>
            </div>
          ))}
        </div>

        {/* ============================================================ */}
        {/*  8. BORDER RADIUS                                            */}
        {/* ============================================================ */}
        <SectionHeading id="radius">Border Radius</SectionHeading>

        <div className="bg-surface rounded-lg border border-border p-8 shadow-sm">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-6">
            {[
              { name: 'xs', cls: 'rounded-xs', value: '0.125rem' },
              { name: 'sm', cls: 'rounded-sm', value: '0.25rem' },
              { name: 'md', cls: 'rounded-md', value: '0.5rem' },
              { name: 'lg', cls: 'rounded-lg', value: '0.75rem' },
              { name: 'xl', cls: 'rounded-xl', value: '1rem' },
              { name: '2xl', cls: 'rounded-2xl', value: '1.5rem' },
              { name: 'full', cls: 'rounded-full', value: '9999px' },
            ].map((r) => (
              <div key={r.name} className="flex flex-col items-center gap-3">
                <div
                  className={`w-16 h-16 bg-primary ${r.cls} shadow-sm`}
                />
                <div className="text-center space-y-0.5">
                  <p className="text-sm font-display text-text">{r.cls}</p>
                  <p className="text-xs font-mono text-text-dim">{r.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/*  FOOTER / TOKEN REFERENCE                                    */}
        {/* ============================================================ */}
        <div className="mt-20 mb-8 border-t border-border pt-8">
          <div className="bg-surface-dim rounded-lg border border-border-subtle p-6">
            <p className="font-display text-sm text-primary-light mb-2">Token Reference</p>
            <p className="text-sm text-text-secondary font-body mb-4">
              All design tokens are defined in <code className="font-mono text-text-muted">globals.css</code> via
              Tailwind v4 <code className="font-mono text-text-muted">@theme inline</code> blocks.
              They generate standard utility classes automatically.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono text-text-dim">
              <div>
                <p className="text-text-muted mb-1">Backgrounds</p>
                <p>bg-background</p>
                <p>bg-surface</p>
                <p>bg-surface-elevated</p>
                <p>bg-surface-hover</p>
                <p>bg-surface-dim</p>
              </div>
              <div>
                <p className="text-text-muted mb-1">Accents</p>
                <p>bg-primary</p>
                <p>bg-primary-hover</p>
                <p>bg-primary-light</p>
                <p>bg-primary-subtle</p>
                <p>bg-cta / bg-cta-hover</p>
              </div>
              <div>
                <p className="text-text-muted mb-1">Text</p>
                <p>text-text</p>
                <p>text-text-secondary</p>
                <p>text-text-muted</p>
                <p>text-text-dim</p>
              </div>
              <div>
                <p className="text-text-muted mb-1">Typography</p>
                <p>font-display</p>
                <p>font-body</p>
                <p>font-mono</p>
              </div>
            </div>
          </div>
          <p className="text-center text-text-dim text-xs font-body mt-6">
            Star Citizen Controller Viewer Design System
          </p>
        </div>
      </main>
    </div>
  );
}
