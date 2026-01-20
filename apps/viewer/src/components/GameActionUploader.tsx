'use client';

import { useCallback, useState } from 'react';
import type { GameActionState, GameplayMode } from '@/lib/types/unified';
import { parseXmlToGameActions, parseRewasdJson, addRewasdTriggersToActions } from '@/lib/parsers';

interface GameActionUploaderProps {
  onStateLoaded: (state: GameActionState) => void;
}

interface FileState {
  xml?: File;
  rewasd?: File;
}

export function GameActionUploader({ onStateLoaded }: GameActionUploaderProps) {
  const [files, setFiles] = useState<FileState>({});
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const handleFiles = useCallback(async (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const updatedFiles = { ...files };

    for (const file of fileArray) {
      if (file.name.endsWith('.xml')) {
        updatedFiles.xml = file;
      } else if (file.name.endsWith('.rewasd')) {
        updatedFiles.rewasd = file;
      }
    }

    setFiles(updatedFiles);
    setError(undefined);

    // Auto-parse when XML is present
    if (updatedFiles.xml) {
      await parseFiles(updatedFiles);
    }
  }, [files]);

  const parseFiles = async (filesToParse: FileState) => {
    if (!filesToParse.xml) return;

    setIsLoading(true);
    setError(undefined);

    try {
      // Parse SC XML (required)
      const xmlText = await filesToParse.xml.text();
      const xmlResult = parseXmlToGameActions(xmlText);

      if (xmlResult.errors.length > 0) {
        console.warn('XML parsing warnings:', xmlResult.errors);
      }

      let actions = xmlResult.actions;

      // Parse reWASD and integrate if provided (optional)
      if (filesToParse.rewasd) {
        const rewasdText = await filesToParse.rewasd.text();
        const rewasdResult = parseRewasdJson(rewasdText);

        if (rewasdResult.errors.length > 0) {
          console.warn('reWASD parsing warnings:', rewasdResult.errors);
        }

        // Add reWASD triggers as optional overlay
        actions = addRewasdTriggersToActions(actions, rewasdResult);
      }

      // Extract available categories
      const categorySet = new Set<GameplayMode>();
      for (const action of actions) {
        categorySet.add(action.category);
      }
      const availableCategories = Array.from(categorySet).sort();

      onStateLoaded({
        loaded: true,
        xmlFileName: filesToParse.xml.name,
        rewasdFileName: filesToParse.rewasd?.name,
        actions,
        availableCategories,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse config files');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
          }
        `}
      >
        <input
          type="file"
          accept=".xml,.rewasd"
          multiple
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="space-y-4">
          <div className="text-4xl">📁</div>
          <div>
            <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              Drop your Star Citizen XML
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              or click to browse
            </p>
          </div>
          <div className="text-xs text-zinc-400 dark:text-zinc-500">
            Required: .xml &bull; Optional: .rewasd (for controller overlay)
          </div>
        </div>
      </div>

      {/* File status */}
      <div className="mt-4 space-y-2">
        <FileStatus
          label="Star Citizen XML"
          file={files.xml}
          required
        />
        <FileStatus
          label="reWASD Config"
          file={files.rewasd}
          optional
        />
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="mt-4 text-center text-zinc-500 dark:text-zinc-400">
          Parsing configs...
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Manual parse button if XML present but not auto-parsed */}
      {files.xml && !isLoading && (
        <button
          onClick={() => parseFiles(files)}
          className="mt-4 w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
        >
          {files.rewasd ? 'Parse with reWASD Overlay' : 'Parse SC Bindings'}
        </button>
      )}
    </div>
  );
}

interface FileStatusProps {
  label: string;
  file?: File;
  required?: boolean;
  optional?: boolean;
}

function FileStatus({ label, file, required, optional }: FileStatusProps) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-zinc-600 dark:text-zinc-400">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
        {optional && <span className="text-zinc-400 ml-1">(optional)</span>}
      </span>
      {file ? (
        <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
          <span>✓</span>
          <span className="truncate max-w-[200px]">{file.name}</span>
        </span>
      ) : (
        <span className="text-zinc-400 dark:text-zinc-500">Not loaded</span>
      )}
    </div>
  );
}
