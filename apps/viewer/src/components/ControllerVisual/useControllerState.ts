'use client';

import { useState, useMemo, useCallback } from 'react';
import type { BindingIndex, ResolvedBinding, ShiftLayer, ActivatorType, GameplayMode } from '@/lib/types/binding';
import { CONTEXT_GROUP_SETS, ALWAYS_ACTION_MAPS } from '@/lib/constants/scContextGroups';

export interface ControllerState {
  activeLayerId: number;
  activeLayer: ShiftLayer;
  selectedButton: string | null;
  hoveredButton: string | null;
  modeFilter: GameplayMode | 'All';
}

export interface ControllerActions {
  setActiveLayer: (layerId: number) => void;
  toggleLayer: (layerId: number) => void;
  selectButton: (button: string | null) => void;
  hoverButton: (button: string | null) => void;
  setModeFilter: (mode: GameplayMode | 'All') => void;
  getBindingsForButton: (button: string) => Map<ActivatorType, ResolvedBinding> | null;
  getPrimaryAction: (button: string) => string | null;
  getLayerForTriggerButton: (button: string) => ShiftLayer | undefined;
}

export function useControllerState(bindingIndex: BindingIndex): [ControllerState, ControllerActions] {
  const [activeLayerId, setActiveLayerId] = useState(0);
  const [selectedButton, setSelectedButton] = useState<string | null>(null);
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);
  const [modeFilter, setModeFilter] = useState<GameplayMode | 'All'>('Flight');

  const activeLayer = useMemo(
    () => bindingIndex.layers.find(l => l.id === activeLayerId) ?? bindingIndex.layers[0],
    [bindingIndex, activeLayerId]
  );

  // Map trigger buttons to their layers for quick lookup
  const triggerButtonToLayer = useMemo(() => {
    const map = new Map<string, ShiftLayer>();
    for (const layer of bindingIndex.layers) {
      if (layer.triggerButton) {
        map.set(layer.triggerButton, layer);
      }
    }
    return map;
  }, [bindingIndex]);

  const toggleLayer = useCallback((layerId: number) => {
    setActiveLayerId(prev => prev === layerId ? 0 : layerId);
  }, []);

  const getBindingsForButton = useCallback((button: string): Map<ActivatorType, ResolvedBinding> | null => {
    const layerMap = bindingIndex.byButtonLayerActivator.get(button);
    if (!layerMap) return null;
    const activatorMap = layerMap.get(activeLayerId);
    return activatorMap ?? null;
  }, [bindingIndex, activeLayerId]);

  const getPrimaryAction = useCallback((button: string): string | null => {
    const activatorMap = getBindingsForButton(button);
    if (!activatorMap) return null;

    // Prefer single press, then check others
    const binding = activatorMap.get('single')
      ?? activatorMap.get('start')
      ?? activatorMap.get('long')
      ?? activatorMap.get('double')
      ?? activatorMap.get('release');

    if (!binding || binding.actions.length === 0) return null;

    // If mode filter is active, find a matching action (mode-specific or "always")
    if (modeFilter !== 'All') {
      const groupMaps = CONTEXT_GROUP_SETS[modeFilter];
      if (groupMaps) {
        const modeAction = binding.actions.find(a => groupMaps.has(a.actionMap) || ALWAYS_ACTION_MAPS.has(a.actionMap));
        if (modeAction) return modeAction.displayName;
      } else {
        const modeAction = binding.actions.find(a => a.gameplayMode === modeFilter || ALWAYS_ACTION_MAPS.has(a.actionMap));
        if (modeAction) return modeAction.displayName;
      }
    }

    return binding.actions[0].displayName;
  }, [getBindingsForButton, modeFilter]);

  const getLayerForTriggerButton = useCallback((button: string): ShiftLayer | undefined => {
    return triggerButtonToLayer.get(button);
  }, [triggerButtonToLayer]);

  const state: ControllerState = {
    activeLayerId,
    activeLayer,
    selectedButton,
    hoveredButton,
    modeFilter,
  };

  const actions: ControllerActions = {
    setActiveLayer: setActiveLayerId,
    toggleLayer,
    selectButton: setSelectedButton,
    hoverButton: setHoveredButton,
    setModeFilter,
    getBindingsForButton,
    getPrimaryAction,
    getLayerForTriggerButton,
  };

  return [state, actions];
}
