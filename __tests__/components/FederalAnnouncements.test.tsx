import { expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FederalAnnouncementsPanel } from "@/app/_components/FederalAnnouncements";
import { DashboardChartPanel } from "@/app/_components/DashboardChartPanel";
import type { FederalData } from "@/lib/federal";

const data: FederalData = {
  status: {
    state: "incomplete",
    attemptedAt: "2026-09-22T08:00:00Z",
    retrieved: 500,
    available: 600,
  },
  snapshot: {
    date: "2026-09-21",
    collectedAt: "2026-09-21T08:00:00Z",
    windowStart: "2026-09-07",
    windowEnd: "2026-09-21",
    methodVersion: 2,
    available: 20,
    groups: [
      {
        code: "all",
        label: "All federal announcements",
        total: 20,
        matches: 2,
        announcementIds: [],
        keywords: [],
        examples: [],
      },
    ],
  },
};
it("labels retained results and supports keyboard expansion", async () => {
  const user = userEvent.setup();
  render(<FederalAnnouncementsPanel data={data} />);
  expect(screen.getByRole("status")).toHaveTextContent(
    "latest collection did not complete",
  );
  expect(screen.getByText("10.0%")).toBeVisible();
  const button = screen.getByRole("button", { name: /AI mentions/i });
  button.focus();
  await user.keyboard("{Enter}");
  expect(button).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByText("10.0%")).not.toBeVisible();
});
it("does not invent a percentage before a complete collection", () => {
  render(
    <FederalAnnouncementsPanel
      data={{ snapshot: null, status: data.status }}
    />,
  );
  expect(screen.getByText(/not available yet/)).toBeVisible();
  expect(screen.queryByText(/10.0%/)).toBeNull();
});
it("renders unavailable rather than loading for a resolved empty selection", () => {
  render(
    <DashboardChartPanel
      viewMode="unemployment"
      jobData={[]}
      selectedSectors={["total"]}
      unemploymentRate={null}
      unemploymentByIndustry={[]}
      selectedUnemploymentSectors={["unemployment_manufacturing"]}
      participationRate={null}
      selectedRange="3Y"
      onRangeChange={() => {}}
    />,
  );
  expect(screen.getByRole("status")).toHaveTextContent("No data is available");
  expect(screen.queryByText(/Loading/)).toBeNull();
});
