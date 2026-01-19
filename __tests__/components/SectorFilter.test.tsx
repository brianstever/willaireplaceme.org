import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SectorFilter } from "@/components/SectorFilter";

const mockSectors = ["total", "manufacturing", "healthcare", "retail"];

describe("SectorFilter", () => {
  it("renders all sector buttons", () => {
    render(
      <SectorFilter
        sectors={mockSectors}
        selectedSectors={["total"]}
        onToggle={() => {}}
      />
    );

    expect(screen.getByRole("button", { name: /total nonfarm/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /manufacturing/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /healthcare/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retail/i })).toBeInTheDocument();
  });

  it("places 'total' sector first regardless of input order", () => {
    const shuffledSectors = ["healthcare", "total", "retail", "manufacturing"];
    
    render(
      <SectorFilter
        sectors={shuffledSectors}
        selectedSectors={["total"]}
        onToggle={() => {}}
      />
    );

    const buttons = screen.getAllByRole("button");
    expect(buttons[0]).toHaveTextContent(/total nonfarm/i);
  });

  it("shows unemployment_rate when passed (filtering now done by parent)", () => {
    // SectorFilter now shows all sectors passed to it
    // Filtering is done in page.tsx before passing to SectorFilter
    const sectorsWithUnemployment = [...mockSectors, "unemployment_rate"];
    
    render(
      <SectorFilter
        sectors={sectorsWithUnemployment}
        selectedSectors={["total"]}
        onToggle={() => {}}
      />
    );

    // unemployment_rate shows as "ALL INDUSTRIES" when passed
    const allIndustriesButtons = screen.getAllByRole("button", { name: /all industries/i });
    expect(allIndustriesButtons.length).toBeGreaterThan(0);
  });

  it("applies active class to selected sectors", () => {
    render(
      <SectorFilter
        sectors={mockSectors}
        selectedSectors={["total", "healthcare"]}
        onToggle={() => {}}
      />
    );

    const totalButton = screen.getByRole("button", { name: /total nonfarm/i });
    const healthcareButton = screen.getByRole("button", { name: /healthcare/i });
    const retailButton = screen.getByRole("button", { name: /retail/i });

    expect(totalButton).toHaveClass("active");
    expect(healthcareButton).toHaveClass("active");
    expect(retailButton).not.toHaveClass("active");
  });

  it("calls onToggle when sector button is clicked", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();

    render(
      <SectorFilter
        sectors={mockSectors}
        selectedSectors={["total"]}
        onToggle={onToggle}
      />
    );

    await user.click(screen.getByRole("button", { name: /healthcare/i }));

    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith("healthcare");
  });

  it("calls onToggle with correct sector when toggling off", async () => {
    const onToggle = vi.fn();
    const user = userEvent.setup();

    render(
      <SectorFilter
        sectors={mockSectors}
        selectedSectors={["total", "healthcare"]}
        onToggle={onToggle}
      />
    );

    await user.click(screen.getByRole("button", { name: /healthcare/i }));

    expect(onToggle).toHaveBeenCalledWith("healthcare");
  });

  it("shows tooltip description on hover", async () => {
    render(
      <SectorFilter
        sectors={mockSectors}
        selectedSectors={["total"]}
        onToggle={() => {}}
      />
    );

    const healthcareButton = screen.getByRole("button", { name: /healthcare/i });
    
    // Hover over the button
    fireEvent.mouseEnter(healthcareButton);

    // Should show healthcare description in the visible tooltip area
    const tooltipText = screen.getByTestId("tooltip-text");
    expect(tooltipText).toHaveTextContent(/hospitals/i);
    expect(tooltipText).toHaveClass("opacity-100");
  });

  it("hides tooltip description on mouse leave", async () => {
    render(
      <SectorFilter
        sectors={mockSectors}
        selectedSectors={["total"]}
        onToggle={() => {}}
      />
    );

    const healthcareButton = screen.getByRole("button", { name: /healthcare/i });
    
    // Hover over the button first
    fireEvent.mouseEnter(healthcareButton);
    
    // Verify tooltip is visible
    const tooltipText = screen.getByTestId("tooltip-text");
    expect(tooltipText).toHaveClass("opacity-100");
    
    // Now leave
    fireEvent.mouseLeave(healthcareButton);

    // The tooltip text should now have opacity-0 class (hidden)
    expect(tooltipText).toHaveClass("opacity-0");
  });

  it("renders with empty sectors array", () => {
    render(
      <SectorFilter
        sectors={[]}
        selectedSectors={[]}
        onToggle={() => {}}
      />
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("handles sectors not in SECTOR_LABELS gracefully", () => {
    const customSectors = ["total", "custom_sector"];
    
    render(
      <SectorFilter
        sectors={customSectors}
        selectedSectors={["total"]}
        onToggle={() => {}}
      />
    );

    // Should fall back to the sector key itself (includes sr-only description)
    expect(screen.getByRole("button", { name: /custom_sector/i })).toBeInTheDocument();
  });

  it("sorts non-total sectors alphabetically", () => {
    const unsortedSectors = ["retail", "total", "healthcare", "manufacturing"];
    
    render(
      <SectorFilter
        sectors={unsortedSectors}
        selectedSectors={["total"]}
        onToggle={() => {}}
      />
    );

    const buttons = screen.getAllByRole("button");
    // Total should be first, then alphabetically sorted
    expect(buttons[0]).toHaveTextContent(/total nonfarm/i);
    expect(buttons[1]).toHaveTextContent(/healthcare/i);
    expect(buttons[2]).toHaveTextContent(/manufacturing/i);
    expect(buttons[3]).toHaveTextContent(/retail/i);
  });
});
