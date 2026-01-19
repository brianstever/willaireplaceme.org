import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import React from "react";
import { afterEach, vi } from "vitest";

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver for chart components
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock Recharts ResponsiveContainer for deterministic sizes in tests
vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");

  interface ResponsiveContainerProps {
    width?: number | string;
    height?: number | string;
    children?: React.ReactNode | ((size: { width: number; height: number }) => React.ReactNode);
  }

  function ResponsiveContainer({
    width = 800,
    height = 400,
    children,
  }: ResponsiveContainerProps) {
    const resolvedWidth = typeof width === "number" ? width : 800;
    const resolvedHeight = typeof height === "number" ? height : 400;
    const content =
      typeof children === "function"
        ? children({ width: resolvedWidth, height: resolvedHeight })
        : children;

    return React.createElement("div", { style: { width: resolvedWidth, height: resolvedHeight } }, content);
  }

  return {
    ...actual,
    ResponsiveContainer,
  };
});
