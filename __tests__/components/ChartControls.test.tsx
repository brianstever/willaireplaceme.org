import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChartControls } from "@/components/ChartControls";

describe("ChartControls", () => {
  const defaultProps = {
    selectedRange: "3Y",
    onRangeChange: vi.fn(),
    showTrendline: true,
    onTrendlineChange: vi.fn(),
    trendInfo: null,
    dateRangeDisplay: "Jan 2023 — Jan 2026",
  };

  it("renders all time range buttons", () => {
    render(<ChartControls {...defaultProps} />);

    expect(screen.getByRole("button", { name: "1Y" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "3Y" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "5Y" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "10Y" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "ALL" })).toBeInTheDocument();
  });

  it("highlights the selected time range", () => {
    render(<ChartControls {...defaultProps} selectedRange="5Y" />);

    const selectedButton = screen.getByRole("button", { name: "5Y" });
    expect(selectedButton).toHaveClass("bg-background");
    expect(selectedButton).toHaveClass("font-medium");
  });

  it("calls onRangeChange when a time range button is clicked", async () => {
    const onRangeChange = vi.fn();
    const user = userEvent.setup();

    render(<ChartControls {...defaultProps} onRangeChange={onRangeChange} />);

    await user.click(screen.getByRole("button", { name: "10Y" }));

    expect(onRangeChange).toHaveBeenCalledTimes(1);
    expect(onRangeChange).toHaveBeenCalledWith("10Y");
  });

  it("renders the trendline toggle button", () => {
    render(<ChartControls {...defaultProps} />);

    const trendButton = screen.getByRole("button", { name: /trendline/i });
    expect(trendButton).toBeInTheDocument();
    expect(trendButton).toHaveAttribute("aria-pressed", "true");
  });

  it("calls onTrendlineChange when trendline button is clicked", async () => {
    const onTrendlineChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ChartControls {...defaultProps} onTrendlineChange={onTrendlineChange} />
    );

    await user.click(screen.getByRole("button", { name: /trendline/i }));

    expect(onTrendlineChange).toHaveBeenCalledTimes(1);
    expect(onTrendlineChange).toHaveBeenCalledWith(false);
  });

  it("shows aria-pressed=false when trendline is hidden", () => {
    render(<ChartControls {...defaultProps} showTrendline={false} />);

    const trendButton = screen.getByRole("button", { name: /trendline/i });
    expect(trendButton).toHaveAttribute("aria-pressed", "false");
  });

  it("displays trend info when provided", () => {
    const trendInfo = {
      direction: "up" as const,
      percentChange: "5.2%",
    };

    render(<ChartControls {...defaultProps} trendInfo={trendInfo} />);

    expect(screen.getByText("5.2%")).toBeInTheDocument();
    expect(screen.getByText("▲")).toBeInTheDocument();
  });

  it("shows green styling for upward trend (job openings)", () => {
    const trendInfo = {
      direction: "up" as const,
      percentChange: "5.2%",
    };

    render(<ChartControls {...defaultProps} trendInfo={trendInfo} />);

    const indicator = screen.getByText("5.2%").closest("div");
    expect(indicator).toHaveClass("text-green-500");
  });

  it("shows red styling for downward trend (job openings)", () => {
    const trendInfo = {
      direction: "down" as const,
      percentChange: "3.1%",
    };

    render(<ChartControls {...defaultProps} trendInfo={trendInfo} />);

    const indicator = screen.getByText("3.1%").closest("div");
    expect(indicator).toHaveClass("text-red-500");
  });

  it("inverts colors when invertTrendColors is true (unemployment)", () => {
    const trendInfo = {
      direction: "up" as const,
      percentChange: "0.5%",
    };

    render(
      <ChartControls
        {...defaultProps}
        trendInfo={trendInfo}
        invertTrendColors
      />
    );

    // For unemployment, up is bad (red)
    const indicator = screen.getByText("0.5%").closest("div");
    expect(indicator).toHaveClass("text-red-500");
  });

  it("shows 'avg' label when trend is aggregate", () => {
    const trendInfo = {
      direction: "down" as const,
      percentChange: "2.5%",
      isAggregate: true,
    };

    render(<ChartControls {...defaultProps} trendInfo={trendInfo} />);

    expect(screen.getByText("avg")).toBeInTheDocument();
  });

  it("displays date range on desktop", () => {
    render(<ChartControls {...defaultProps} />);

    expect(screen.getByText("Jan 2023 — Jan 2026")).toBeInTheDocument();
  });

  it("has proper accessibility label for trend indicator", () => {
    const trendInfo = {
      direction: "up" as const,
      percentChange: "5.2%",
    };

    render(
      <ChartControls
        {...defaultProps}
        trendInfo={trendInfo}
        chartLabel="Job openings"
      />
    );

    const indicator = screen.getByText("5.2%").closest("div");
    expect(indicator).toHaveAttribute(
      "aria-label",
      "Job openings increased by 5.2%"
    );
  });

  it("uses custom trend color for the toggle icon", () => {
    render(<ChartControls {...defaultProps} trendColor="#06b6d4" />);

    const trendButton = screen.getByRole("button", { name: /trendline/i });
    const svg = trendButton.querySelector("svg");
    const line = svg?.querySelector("line");
    
    expect(line).toHaveAttribute("stroke", "#06b6d4");
  });
});
