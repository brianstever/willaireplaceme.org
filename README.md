# Will AI Replace Me?

Track job losses and labor market shifts in the age of AI—while we still have jobs to track. An interactive dashboard visualizing U.S. employment data to help understand how automation and AI are reshaping the workforce.

**Live at [willaireplaceme.org](https://willaireplaceme.org)**

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Convex](https://img.shields.io/badge/Convex-Backend-orange)
[![CI](https://github.com/brianstever/willaireplaceme.org/actions/workflows/ci.yml/badge.svg)](https://github.com/brianstever/willaireplaceme.org/actions/workflows/ci.yml)
![License](https://img.shields.io/badge/License-MIT-green)

## Overview

As AI transforms the labor market (and my career prospects), this dashboard provides real-time tracking of U.S. job openings across multiple sectors, along with national unemployment rate and labor force participation rate data. See which industries are growing, which are shrinking, and how the job landscape is evolving. Data is automatically fetched from the BLS public API and stored using Convex for instant reactive updates.

### Features

- **Real-time Data**: Automatic monthly updates via Convex cron jobs
- **Multi-Sector Analysis**: Compare job openings across manufacturing, healthcare, retail, tech, and more
- **Interactive Charts**: Time range filtering (1Y, 3Y, 5Y, 10Y, ALL) with trendline visualization
- **Three Data Views**: Toggle between job openings, unemployment rate, and labor force participation rate
- **ChatGPT Release Date Marker**: Vertical reference line at November 2022—notably the local maximum before the decline (coincidence?)
- **Auto-Generated Insights**: Dynamic analysis including peak comparisons and sector trends
- **Loading Skeletons**: Professional loading states with animated placeholders
- **Responsive Design**: Modern dark theme optimized for all screen sizes
- **Accessible**: WCAG-compliant with ARIA labels, keyboard navigation, and screen reader support
- **Error Resilient**: Error boundaries prevent crashes and provide graceful fallbacks

## Tech Stack

| Technology | Purpose |
|------------|---------|
| [Next.js 16](https://nextjs.org/) | React framework with App Router |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe development |
| [Convex](https://convex.dev/) | Real-time backend & database |
| [Recharts](https://recharts.org/) | Data visualization |
| [Tailwind CSS 4](https://tailwindcss.com/) | Styling |
| [Vitest](https://vitest.dev/) | Unit & component testing |
| [Testing Library](https://testing-library.com/) | React component testing |
| [Vercel Analytics](https://vercel.com/analytics) | Privacy-friendly analytics |
| [BLS API](https://www.bls.gov/developers/) | Official data source |

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun
- Convex account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/brianstever/willaireplaceme.org.git
   cd willaireplaceme.org
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Convex**
   ```bash
   npx convex dev
   ```
   This will prompt you to log in and create a new project. Follow the instructions to link your Convex backend. Once linked, you can stop this command (Ctrl+C).

4. **Start the development server**
   ```bash
   npm run dev
   ```
   This starts both Next.js and Convex dev servers together.

5. **Seed initial data** (first time only)
   
   Run the data fetch action from the Convex dashboard or via CLI to populate initial BLS data.

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
willaireplaceme.org/
├── app/                    # Next.js App Router pages
│   ├── _components/       # Dashboard-only components
│   ├── page.tsx           # Main dashboard
│   ├── about/             # About page
│   │   ├── _components/   # About-only components
│   │   └── page.tsx       # About page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── __tests__/             # Test files
│   ├── lib/               # Utility function tests
│   ├── components/        # Component tests
│   └── integration/       # Page integration tests
├── components/            # Shared React components
│   ├── ErrorBoundary.tsx  # Generic error boundary
│   ├── SkipLink.tsx       # Accessibility skip navigation
│   └── ConvexClientProvider.tsx  # Convex provider wrapper
├── convex/                # Convex backend
│   ├── schema.ts          # Database schema
│   ├── jobs.ts            # Query functions
│   ├── crons.ts           # Scheduled data fetching
│   ├── blsFetch.ts        # BLS API integration
│   └── ...mutations       # Data mutation functions
├── lib/                   # Shared utilities
│   ├── bls.ts             # BLS series IDs, labels & colors
│   ├── chart-utils.ts     # Chart helper functions
│   └── useChartData.ts    # Custom hooks for chart data
└── public/                # Static assets
```

## Data Sources

All data is sourced from the U.S. Bureau of Labor Statistics:

| Series ID | Description |
|-----------|-------------|
| `JTS000000000000000JOL` | Total Nonfarm Job Openings |
| `JTS300000000000000JOL` | Manufacturing |
| `JTS620000000000000JOL` | Healthcare |
| `JTS440000000000000JOL` | Retail Trade |
| `JTS540000000000000JOL` | Professional & Business Services |
| `JTS510000000000000JOL` | Information |
| `JTS900000000000000JOL` | Government |
| `LNS14000000` | National Unemployment Rate |
| `LNS11300000` | Labor Force Participation Rate |

Data is released monthly by BLS:
- **JOLTS**: First Tuesday of each month (~2 month lag)
- **Employment Situation** (unemployment & participation): First Friday of each month

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js + Convex dev servers together |
| `npm run dev:next` | Start Next.js only |
| `npm run dev:convex` | Start Convex dev server only |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests in watch mode |
| `npm run test:run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage report |
| `npx convex deploy` | Deploy Convex to production |

## Testing

This project uses [Vitest](https://vitest.dev/) with [Testing Library](https://testing-library.com/) for testing.

Note: some environments may print ExperimentalWarning messages from jsdom/parse5 when running tests.
These are dependency-level warnings (not test failures) and will be addressed via dependency upgrades.

### Running Tests

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run

# Run with coverage report
npm run test:coverage
```

### Test Coverage

| Category | Focus | Files |
|----------|-------|-------|
| Utility Functions | Core data utilities | `bls.test.ts`, `chart-utils.test.ts`, `useChartData.test.ts` |
| Components | UI behavior | `AnimatedCounter.test.tsx`, `SectorFilter.test.tsx`, `ChartControls.test.tsx` |
| Integration | Page flows | `page.test.tsx` |

### Writing Tests

Tests follow Testing Library best practices:
- Query by accessible roles and labels
- Test user interactions, not implementation details
- Use `userEvent` for realistic user interactions

## Accessibility

This dashboard follows WCAG 2.1 guidelines:

- **Keyboard Navigation**: Full keyboard support with visible focus indicators
- **Screen Reader Support**: ARIA labels and live regions for dynamic content
- **Skip Navigation**: Skip link to bypass header and jump to main content
- **Semantic HTML**: Proper heading hierarchy and landmark regions
- **Color Contrast**: Meets WCAG AA standards for text contrast
- **Button States**: Proper `aria-pressed` for toggle buttons

## Configuration

### Convex Cron Schedule

The data fetch is scheduled for the 7th of each month at 2:00 PM UTC to ensure both JOLTS and unemployment data are available:

```typescript
// convex/crons.ts
crons.monthly(
  "fetch-bls-data",
  { day: 7, hourUTC: 14, minuteUTC: 0 },
  internal.blsFetch.fetchLatestData
);
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_CONVEX_URL` | Yes | Your Convex deployment URL |

## Architecture Highlights

### Shared Abstractions

The codebase follows DRY principles with shared infrastructure:

- **`useChartData.ts`**: Custom hooks for chart data processing
  - `useSimpleChartData` - Single-value series (unemployment, participation rate)
  - `useMultiSeriesChartData` - Multi-sector series (job openings)
  
- **`ChartControls.tsx`**: Shared time range and trendline controls

- **`ChartTooltip.tsx`**: Configurable tooltip with pre-built variants

### Loading States

Professional skeleton components provide smooth loading experiences:
- `ChartSkeleton` - Animated chart placeholder
- `StatsSkeleton` - Stats section placeholder

## Roadmap

Potential future enhancements under consideration:

- [ ] **Global Data**: International labor market data from OECD, Eurostat, and ILO to enable cross-country comparisons. Challenges include normalizing different data formats, update frequencies, and sector classifications across sources.
- [ ] **Additional AI Milestones**: More reference markers for significant AI releases (GPT-4, Claude, etc.)
- [ ] **Vacancy-to-Unemployment Ratio**: Calculated metric showing labor market tightness
- [ ] **Export Functionality**: Download charts and data as PNG/CSV

Have a feature request? [Open an issue](https://github.com/brianstever/willaireplaceme.org/issues) on GitHub.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This dashboard is provided for educational and informational purposes only—and mild existential dread. Not responsible for any anxiety induced by p(doom) calculations or sudden AGI emergence. While data is sourced directly from the Bureau of Labor Statistics, this is not an official BLS product. Always refer to [official BLS releases](https://www.bls.gov/jlt/) for authoritative data.

## Will This Dashboard Survive AGI?

Probably not. But until superintelligence arrives to optimize away my React components, I'll keep the charts updated.

## Acknowledgments

- [Bureau of Labor Statistics](https://www.bls.gov/) for providing public data APIs
- [Convex](https://convex.dev/) for the real-time backend infrastructure
- [Recharts](https://recharts.org/) for the charting library
- The inevitable march of progress, for giving this project its name