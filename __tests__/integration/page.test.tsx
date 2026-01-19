import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock data
const mockJobData = [
  { date: "2024-01", sector: "total", value: 8500 },
  { date: "2024-02", sector: "total", value: 8300 },
  { date: "2024-03", sector: "total", value: 8100 },
  { date: "2024-01", sector: "healthcare", value: 1500 },
  { date: "2024-02", sector: "healthcare", value: 1550 },
  { date: "2024-03", sector: "healthcare", value: 1600 },
];

const mockLatestData = [
  { date: "2024-03", sector: "total", value: 8100 },
  { date: "2024-03", sector: "healthcare", value: 1600 },
];

const mockPeakData = { date: "2022-03", value: 12000 };

const mockMetadata = { key: "lastUpdated", value: "2024-03-15T10:00:00Z" };

const mockAnalysis = {
  peak: { value: 12000, date: "2022-03" },
  latest: { value: 8100, date: "2024-03" },
  prePandemic: { value: 7000, date: "2019-12" },
  changeFromPeak: -32.5,
  changeFromPrePandemic: 15.7,
  sectorChanges: [],
  steepestDecline: {
    sector: "information",
    peakValue: 500,
    peakDate: "2022-01",
    latestValue: 300,
    latestDate: "2024-03",
    changePercent: -40,
  },
  mostResilient: {
    sector: "healthcare",
    peakValue: 1600,
    peakDate: "2024-03",
    latestValue: 1600,
    latestDate: "2024-03",
    changePercent: 0,
  },
};

const mockUnemploymentRate = {
  current: 4.1,
  date: "2024-03",
  yearAgoValue: 3.5,
  changeFromYearAgo: 0.6,
  sparkline: [
    { date: "2023-04", value: 3.5 },
    { date: "2023-05", value: 3.6 },
    { date: "2023-06", value: 3.7 },
    { date: "2024-01", value: 3.9 },
    { date: "2024-02", value: 4.0 },
    { date: "2024-03", value: 4.1 },
  ],
  history: [
    { date: "2023-01", value: 3.4 },
    { date: "2023-02", value: 3.5 },
    { date: "2023-03", value: 3.5 },
    { date: "2024-01", value: 3.9 },
    { date: "2024-02", value: 4.0 },
    { date: "2024-03", value: 4.1 },
  ],
  peak: { value: 14.7, date: "2020-04" },
  lowest: { value: 3.4, date: "2023-01" },
};

// Track mock state
let isLoading = false;

// Mock the entire convex/react module
const mockUseQuery = vi.fn();

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
}));

// Import after mocking
import Home from "@/app/page";

describe("Home Page Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isLoading = false;
    
    // Track call count to return correct data in order
    let callIndex = 0;
    const returnValues = [
      mockJobData,           // 0: getJobOpenings
      mockLatestData,        // 1: getLatestBySector
      mockPeakData,          // 2: getPeakValue
      mockMetadata,          // 3: getMetadata
      mockAnalysis,          // 4: getDataAnalysis
      mockUnemploymentRate,  // 5: getUnemploymentRate
    ];
    
    mockUseQuery.mockImplementation(() => {
      if (isLoading) return undefined;
      
      // Cycle through return values
      const value = returnValues[callIndex % returnValues.length];
      callIndex++;
      return value;
    });
  });

  it("renders loading skeleton when data is not available", () => {
    mockUseQuery.mockReset();
    mockUseQuery.mockReturnValue(undefined);

    render(<Home />);

    // Should show skeleton components
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("renders view toggle tabs", () => {
    render(<Home />);

    expect(screen.getByRole("tab", { name: /job openings/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /unemployment/i })).toBeInTheDocument();
  });

  it("switches between job openings and unemployment views", async () => {
    const user = userEvent.setup();

    render(<Home />);

    // Initially on job openings view
    const jobTab = screen.getByRole("tab", { name: /job openings/i });
    expect(jobTab).toHaveAttribute("aria-selected", "true");

    // Click unemployment tab
    const unemploymentTab = screen.getByRole("tab", { name: /unemployment/i });
    await user.click(unemploymentTab);

    expect(unemploymentTab).toHaveAttribute("aria-selected", "true");
    expect(jobTab).toHaveAttribute("aria-selected", "false");
  });

  it("renders sector filter in job openings view", () => {
    render(<Home />);

    // Should show sector filter buttons
    expect(screen.getByRole("button", { name: /total nonfarm/i })).toBeInTheDocument();
  });

  it("hides sector filter in unemployment view", async () => {
    const user = userEvent.setup();

    render(<Home />);

    // Switch to unemployment view
    await user.click(screen.getByRole("tab", { name: /unemployment/i }));

    // Sector filter should not be visible
    expect(screen.queryByRole("button", { name: /total nonfarm/i })).not.toBeInTheDocument();
  });

  it("displays rotating insights container", () => {
    render(<Home />);

    // Should show an insight container
    const insightContainer = screen.getByRole("status");
    expect(insightContainer).toBeInTheDocument();
  });

  it("renders header with title", () => {
    render(<Home />);

    expect(screen.getByText(/Job Openings & Labor Turnover Survey/i)).toBeInTheDocument();
    expect(screen.getByText(/BLS DATA/)).toBeInTheDocument();
  });

  it("renders footer with links", () => {
    render(<Home />);

    // There are multiple about links (mobile and desktop), just check at least one exists
    const aboutLinks = screen.getAllByRole("link", { name: /about/i });
    expect(aboutLinks.length).toBeGreaterThan(0);
  });

  it("shows last updated date when available", () => {
    render(<Home />);

    // The date should be formatted and displayed
    expect(screen.getByText(/MAR 15, 2024/i)).toBeInTheDocument();
  });

  it("shows unemployment rate", () => {
    render(<Home />);

    // Should show unemployment rate
    expect(screen.getByText("4.1%")).toBeInTheDocument();
  });

  it("renders sparkline for unemployment", () => {
    render(<Home />);

    // Should have sparkline SVG
    const sparkline = screen.getByRole("img", { name: /unemployment rate trend/i });
    expect(sparkline).toBeInTheDocument();
    expect(sparkline.tagName.toLowerCase()).toBe("svg");
  });

  it("shows unemployment year-over-year change", () => {
    render(<Home />);

    // Should show YoY change
    expect(screen.getByText(/\+0\.6/)).toBeInTheDocument();
  });

  it("total sector is selected by default", () => {
    render(<Home />);

    const totalButton = screen.getByRole("button", { name: /total nonfarm/i });
    expect(totalButton).toHaveAttribute("aria-pressed", "true");
  });

  it("healthcare sector is not selected by default", () => {
    render(<Home />);

    const healthcareButton = screen.getByRole("button", { name: /healthcare/i });
    expect(healthcareButton).toHaveAttribute("aria-pressed", "false");
  });
});
