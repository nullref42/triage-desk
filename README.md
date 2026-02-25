# 🪑 Triage Desk

AI-powered GitHub issue triage dashboard for [MUI X](https://github.com/mui/mui-x).

**Live:** [nullref42.github.io/triage-desk](https://nullref42.github.io/triage-desk/)

## What it does

Triage Desk monitors open issues labeled `status: waiting for maintainer` on `mui/mui-x`, analyzes them using AI, and presents maintainers with a dashboard to review and act on triaged issues — all from a single view.

### Features

- **Master Detail DataGrid** — expand any row to see the full triage inline
- **AI Triage Analysis** — classification, priority, completeness checklist, suggested action
- **Deep Investigation** — AI analyzes the MUI X codebase to find root causes and suggest fixes
- **Markdown Comment Editor** — pre-filled with a suggested response, editable before posting
- **One-Click Actions** — Post Comment, Apply Labels, Post & Label
- **Archive/Unarchive** — move resolved issues out of the active queue
- **Issue Body Rendering** — rendered markdown of the original issue, without leaving the dashboard
- **Activity Log** — tracks every action you take
- **Scan History** — view past scan runs and AI investigations with next-run timers

## Architecture

### System Overview

```
┌──────────────┐     ┌───────────────────────┐     ┌──────────────┐
│  GitHub API   │────▶│  Cloudflare Worker     │────▶│  D1 Database │
│  (source)     │     │  (API + storage)       │     │  (SQLite)    │
└──────────────┘     └───────────┬────────────┘     └──────────────┘
       ▲                         │
       │                  ┌──────▼───────┐
┌──────┴───────┐          │  GitHub Pages │
│   Muawin AI   │          │  (React SPA)  │
│  (OpenClaw)   │          └──────┬───────┘
│  scan + inv   │                 │
│  cron jobs    │          ┌──────▼───────┐
└──────────────┘          │  Maintainer   │
                          │  (browser)    │
                          └──────────────┘
```

The system has three main components:

1. **Cloudflare Worker** (`worker/`) — REST API backed by D1 (SQLite). Stores issues, triage analysis, activity logs, and scan history.
2. **React SPA** (`src/`) — Dashboard hosted on GitHub Pages. Reads data from the Worker API. GitHub actions (comments, labels) use the maintainer's own PAT client-side.
3. **Muawin (OpenClaw) Cron Jobs** — Two scheduled AI agents that populate the database:
   - **Scan** (every hour at `:00`) — fetches all open `status: waiting for maintainer` issues from GitHub, runs AI triage analysis, POSTs results to the Worker API
   - **Investigation** (every 2 hours at `:10`) — picks issues marked `needs-investigation`, analyzes the MUI X codebase, POSTs findings

### Data Flow

```
Scan Cron (hourly)
  → GitHub API: fetch open issues
  → AI: analyze each issue (type, priority, completeness, suggested action)
  → POST /api/scan/results → Worker upserts into D1

Investigation Cron (every 2h)
  → GET /api/issues?status=needs-investigation
  → AI: clone/read MUI X repo, analyze root cause
  → POST /api/scan/results → Worker stores investigation data

Frontend
  → GET /api/issues → renders in DataGrid
  → User actions → PATCH /api/issues/:number/status (archive, etc.)
  → User actions → GitHub API via Octokit (comments, labels) using user's PAT
```

### Database Schema (D1)

| Table | Purpose |
|-------|---------|
| `issues` | Core issue data: number, title, url, author, labels, body, status |
| `triage_analysis` | AI triage results: type, component, priority, completeness, summary, classification, checklist, suggested labels/action/comment, investigation |
| `activity_log` | User actions: id, timestamp, issue_number, issue_title, actor, action, details |
| `scan_runs` | Scan execution history: id, started_at, finished_at, issues_found/new/updated, status, summary |

### Auth Model

- **Frontend → Worker API**: Currently open (no auth required). Cloudflare Access integration planned.
- **Scan agent → Worker API**: Service token auth (`CF-Access-Client-Id` / `CF-Access-Client-Secret` headers) for the `POST /api/scan/results` endpoint.
- **Frontend → GitHub API**: Maintainer's PAT stored in browser `localStorage`, never sent to any server. All GitHub actions (comments, labels) appear as the maintainer.

### Frontend Architecture

- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **UI**: MUI v6 (Material UI) + MUI X DataGrid Pro (master-detail, pagination, sorting)
- **Routing**: React Router v6
- **Markdown**: react-markdown + remark-gfm
- **GitHub**: Octokit (client-side only)
- **State**: React hooks (useState/useEffect), no global store

Key pages:
- `IssuesQueue` — main triage view with expandable detail panels, active/archived tabs
- `ScanHistory` — scan run history + investigation details with expandable rows
- `ActivityLog` — chronological log of user actions
- `Settings` — GitHub PAT configuration

## Development

### Prerequisites

- Node.js 18+
- npm
- Wrangler CLI (`npm i -g wrangler`) for Worker development

### Frontend

```bash
npm install
npm run dev     # Start dev server at localhost:5173
npm run build   # Build for production
npx vitest run  # Run tests
```

Create `.env.local`:
```
VITE_API_URL=https://triage-desk-api.triage-desk.workers.dev
```

### Worker (Backend)

```bash
cd worker
npm install
wrangler dev    # Local development with D1
wrangler deploy # Deploy to Cloudflare
```

The Worker uses Hono as the web framework. Routes are in `worker/src/routes/`.

### Deployment

1. **Worker**: `cd worker && wrangler deploy`
2. **Frontend**: `npm run build && npx gh-pages -d dist`
3. Or just push to `main` — GitHub Pages deploys from the `gh-pages` branch

## Security

- **PATs stay local** — stored in your browser's `localStorage`, never sent to any server
- **Actions are yours** — comments and labels are posted using your own token, appearing as you
- **Service tokens** — scan agent authenticates with Cloudflare service tokens

## License

MIT
