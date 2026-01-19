'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Fuse, { type IFuseOptions } from 'fuse.js';
import type { UnifiedMapping } from '@/lib/types/unified';

interface SearchBarProps {
  mappings: UnifiedMapping[];
  onSearchResults: (results: UnifiedMapping[]) => void;
  placeholder?: string;
}

const fuseOptions = {
  keys: [
    { name: 'gameActionReadable', weight: 0.4 },
    { name: 'gameAction', weight: 0.3 },
    { name: 'controllerButton', weight: 0.15 },
    { name: 'description', weight: 0.1 },
    { name: 'keyboardKeys', weight: 0.05 },
  ],
  threshold: 0.4,
  ignoreLocation: true,
  includeScore: true,
} satisfies IFuseOptions<UnifiedMapping>;

export function SearchBar({ mappings, onSearchResults, placeholder = 'Search mappings...' }: SearchBarProps) {
  const [query, setQuery] = useState('');

  const fuse = useMemo(() => new Fuse(mappings, fuseOptions), [mappings]);

  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);

    if (!searchQuery.trim()) {
      onSearchResults(mappings);
      return;
    }

    const results = fuse.search(searchQuery);
    onSearchResults(results.map(r => r.item));
  }, [fuse, mappings, onSearchResults]);

  // Reset search when mappings change
  useEffect(() => {
    if (!query.trim()) {
      onSearchResults(mappings);
    }
  }, [mappings, onSearchResults, query]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearchResults(mappings);
  }, [mappings, onSearchResults]);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg
          className="h-5 w-5 text-zinc-400 dark:text-zinc-500"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder={placeholder}
        className="
          block w-full pl-10 pr-10 py-2.5
          rounded-lg border border-zinc-300 dark:border-zinc-700
          bg-white dark:bg-zinc-900
          text-zinc-900 dark:text-zinc-100
          placeholder:text-zinc-400 dark:placeholder:text-zinc-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-colors
        "
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
        >
          <svg
            className="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
