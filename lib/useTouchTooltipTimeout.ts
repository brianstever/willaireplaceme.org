"use client";

import { useRef, useCallback, useEffect } from "react";

interface UseTouchTooltipTimeoutOptions {
  timeoutMs?: number;
}

/**
 * Hook to auto-dismiss chart tooltips after inactivity on touch devices.
 * Returns props to spread onto the chart container div.
 */
export function useTouchTooltipTimeout({ timeoutMs = 10000 }: UseTouchTooltipTimeoutOptions = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearTooltip = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    // Dispatch a synthetic mouse leave event to clear the tooltip
    const event = new MouseEvent("mouseleave", {
      bubbles: true,
      cancelable: true,
      view: window,
    });
    container.dispatchEvent(event);
  }, []);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(clearTooltip, timeoutMs);
  }, [clearTooltip, timeoutMs]);

  const handleTouchStart = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  const handleTouchMove = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    ref: containerRef,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
  };
}
