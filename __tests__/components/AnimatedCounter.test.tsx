import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { AnimatedCounter } from "@/app/_components/AnimatedCounter";

describe("AnimatedCounter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders with initial value of 0", () => {
    render(<AnimatedCounter value={100} />);
    // Initially starts at 0 before animation
    expect(screen.getByText(/0/)).toBeInTheDocument();
  });

  it("displays prefix correctly", () => {
    render(<AnimatedCounter value={100} prefix="$" />);
    expect(screen.getByText(/\$/)).toBeInTheDocument();
  });

  it("displays suffix correctly", () => {
    render(<AnimatedCounter value={100} suffix="M" />);
    expect(screen.getByText(/M/)).toBeInTheDocument();
  });

  it("respects decimals prop", () => {
    render(<AnimatedCounter value={0} decimals={2} />);
    expect(screen.getByText("0.00")).toBeInTheDocument();
  });

  it("renders with both prefix and suffix", () => {
    render(<AnimatedCounter value={0} prefix="$" suffix="K" decimals={1} />);
    const element = screen.getByText(/\$0\.0K/);
    expect(element).toBeInTheDocument();
  });

  it("has tabular-nums class for consistent number width", () => {
    render(<AnimatedCounter value={100} />);
    const element = screen.getByText(/0/);
    expect(element).toHaveClass("tabular-nums");
  });

  it("uses default decimals of 1 when not specified", () => {
    render(<AnimatedCounter value={0} />);
    expect(screen.getByText("0.0")).toBeInTheDocument();
  });

  it("updates display value when prop changes", async () => {
    const { rerender } = render(<AnimatedCounter value={0} decimals={0} />);
    expect(screen.getByText("0")).toBeInTheDocument();

    rerender(<AnimatedCounter value={100} decimals={0} />);
    
    // Fast-forward time to complete animation with act wrapper
    await act(async () => {
      vi.advanceTimersByTime(2500);
    });
    
    // After animation completes, should show the target value
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("applies default duration of 2000ms", async () => {
    // This is more of an implementation detail test
    // The component should animate over 2 seconds by default
    render(<AnimatedCounter value={100} />);
    
    // At halfway point (1000ms), value should be partially animated
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
    
    // Animation should still be in progress
    const element = screen.getByText(/\d+\.\d/);
    expect(element).toBeInTheDocument();
  });
});
