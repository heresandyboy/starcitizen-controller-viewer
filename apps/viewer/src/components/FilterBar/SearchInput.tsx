'use client';

import React, { useCallback } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (query: string) => void;
}

export const SearchInput = React.memo(function SearchInput({
  value,
  onChange,
}: SearchInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    },
    [onChange],
  );

  const handleClear = useCallback(() => {
    onChange('');
  }, [onChange]);

  return (
    <div className="relative flex items-center">
      {/* Magnifying glass icon */}
      <svg
        className="pointer-events-none absolute left-3 h-4 w-4 text-text-muted"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="8.5" cy="8.5" r="5.5" />
        <path d="M13 13l4 4" />
      </svg>

      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search actions, bindings, maps..."
        className="focus-ring w-full rounded-lg border border-border bg-surface py-2 pl-9 pr-9 font-body text-sm text-text placeholder:text-text-muted"
      />

      {/* Clear button */}
      {value.length > 0 && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 flex h-5 w-5 items-center justify-center rounded-full text-text-muted transition-colors hover:text-text"
          aria-label="Clear search"
        >
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      )}
    </div>
  );
});
