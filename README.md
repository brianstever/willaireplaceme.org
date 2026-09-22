# Will AI Replace Me?

A dashboard of U.S. job openings, unemployment, labor force participation, and AI keyword mentions in federal job announcements.

[View the dashboard](https://willaireplaceme.org)

The project explores changes in the labor market. It does not attribute those changes to AI or predict whether an individual will lose their job.

## Development

Requires Node.js 24 and npm. The app uses Next.js, React, Convex, Recharts, and TypeScript.

```sh
npm ci
cp .env.example .env.local
npm run dev:convex
```

Convex prompts you to configure a development deployment and writes its URL to `.env.local`. Use a personal development deployment, never the production deployment. Keep that process running and open another terminal:

```sh
npx convex run blsFetch:fetchHistoricalData '{}'
npm run dev:next
```

Open [localhost:3000](http://localhost:3000). The BLS import uses a public API and does not require a key. For subsequent sessions, `npm run dev` starts both processes.

To use a local backend without a Convex account, run `CONVEX_AGENT_MODE=anonymous npm run dev:convex` instead of the first Convex command. This is a Convex CLI option; it creates a local development database and does not connect to production.

### Optional USAJOBS collection

Obtain an API key through [USAJOBS](https://developer.usajobs.gov/guides/authentication). Configure these variables on your **development Convex deployment**, using its dashboard environment settings:

- `USAJOBS_AUTH_KEY`: the API key
- `USAJOBS_USER_AGENT`: the email address registered with the key

These are backend variables, not public Next.js variables. Do not commit credentials. Then run:

```sh
npx convex run usajobsFetch:fetchAiSkillSnapshot '{}'
```

The dashboard remains usable without this optional source. The panel indicates when collection is unconfigured or a complete result is unavailable.

## Checks

```sh
npm run lint
npm run typecheck
npm run test:run
npm run build
```

`npm run check` runs all four. A build needs a syntactically valid `NEXT_PUBLIC_CONVEX_URL`; it does not need database access. CI uses `https://build-only.convex.cloud` so fork pull requests can run without secrets.

Tests use Vitest, Testing Library, and an isolated Convex test backend. They cover response validation, the scheduled ingestion actions, failed refreshes, duplicate announcements, and chart states. `npm run test:coverage` produces a coverage report.

## Data

### BLS

The supported series and their definitions live in [`lib/bls.ts`](lib/bls.ts). Job openings are seasonally adjusted counts in thousands, displayed in millions. National unemployment and participation are seasonally adjusted percentages. Manufacturing unemployment is **not seasonally adjusted** and covers manufacturing wage and salary workers.

| Series                  | Measure                                                  |
| ----------------------- | -------------------------------------------------------- |
| `JTS000000000000000JOL` | Total nonfarm job openings                               |
| `JTS300000000000000JOL` | Manufacturing job openings                               |
| `JTS620000000000000JOL` | Health care and social assistance job openings           |
| `JTS440000000000000JOL` | Retail trade job openings                                |
| `JTS540099000000000JOL` | Professional and business services job openings          |
| `JTS510000000000000JOL` | Information job openings                                 |
| `JTS900000000000000JOL` | Government job openings                                  |
| `LNS14000000`           | Civilian unemployment rate                               |
| `LNS11300000`           | Civilian labor force participation rate                  |
| `LNU04032300`           | Manufacturing unemployment rate, not seasonally adjusted |

The importer checks each requested series. Missing or malformed series retain their last good observations and do not receive a successful-refresh timestamp. Documented unavailable values remain unavailable. Preliminary flags and source footnotes are retained. Historical imports upsert observations rather than clearing the database.

BLS publishes monthly, with release dates and revisions determined by the agency. The dashboard checks history from 2015 onward daily at 06:10 UTC and recent data on the seventh of each month at 14:00 UTC. The header shows the last complete BLS refresh; source details show each selected series' observation period and refresh state. A successful fetch does not mean the reference period is the current month.

The November 2022 marker identifies ChatGPT's launch for historical context. It is not an estimated change point or evidence that AI caused a change in openings. Openings measure unfilled positions, not layoffs or total employment.

Sources: [BLS concepts](https://www.bls.gov/opub/hom/jlt/concepts.htm), [BLS API](https://www.bls.gov/developers/), [release calendar](https://www.bls.gov/schedule/).

### Federal announcements

USAJOBS collection runs daily at 08:00 UTC. The population is **currently open federal announcements posted within the API's 14-day lookback**. Closed announcements are not included, and an announcement can cover several vacancies.

The collector requests an unfiltered baseline, follows pagination, and deduplicates by announcement ID. Occupational series come from each announcement, rather than an inferred mapping to BLS industries. An announcement can belong to multiple occupations, so category counts should not be summed. The overall count uses the unique union.

Collection is limited to 20 pages of 500 results and three minutes. HTTP 429 and server errors receive bounded retries. A collection is incomplete if the available count changes, pagination ends with a count mismatch, or a limit is reached. Failed and incomplete attempts do not replace the last complete snapshot. Percentages are shown only for complete collections and groups with at least 20 announcements.

The metric counts **keyword mentions**, including optional skills and negative statements about requirements. It does not distinguish required from preferred skills or measure adoption, productivity, or displacement. Ambiguous standalone terms such as “rag,” “embedding,” and “transformers” are excluded. Aliases are counted once per announcement. The matcher has not been validated against a representative labeled sample; synthetic regression tests are not evidence of population-level precision or recall. A [small source-excerpt spot check](docs/keyword-review.md) records the initial review and its limitations.

Corrected snapshots use method version 2. Earlier sector-based snapshots are excluded from the new panel and retain their original retention policy. Snapshots are retained for 90 days, with weekly cleanup. Examples are capped to keep daily summaries small.

Sources: [USAJOBS API](https://developer.usajobs.gov/api-reference/get-api-search), [occupational series](https://developer.usajobs.gov/api-reference/get-codelist-occupationalseries).

## Deployment

Frontend and backend deployments are separate. Confirm the target Convex project and Vercel environment before changing either.

1. Deploy the compatible Convex schema and functions to the intended backend.
2. Run the historical BLS import there and confirm supported series coverage and values.
3. Configure USAJOBS on that backend and run a collection. If it cannot complete, leave the panel in its unavailable state.
4. Deploy the frontend with that backend's public URL and verify the three data views, source status, and federal panel.

Observation writes are internal Convex functions. There is no public data-editing API. Keep those restrictions in place during rollback. Never republish the removed public write functions to resolve an unrelated frontend issue.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup and review expectations. Small fixes with a reproducible example are welcome. Changes to data definitions should include an authoritative source and tests for the affected ingestion path.

## Credits

- [@grandSpecial](https://github.com/grandSpecial): original USAJOBS feature and daily BLS backfill
- [@igorzmitrovich](https://x.com/igorzmitrovich): ChatGPT release marker suggestion
- [@DaveShapi](https://x.com/DaveShapi): labor force participation view request
- The Bureau of Labor Statistics and USAJOBS for the source data

MIT licensed. This is an independent project, not an official BLS or USAJOBS product.
