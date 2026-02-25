# 🪑 Triage Desk

AI-powered GitHub issue triage dashboard for [MUI X](https://github.com/mui/mui-x).

**Live:** [nullref42.github.io/triage-desk](https://nullref42.github.io/triage-desk/)

## What it does

Triage Desk monitors open issues labeled `status: waiting for maintainer` on `mui/mui-x`, analyzes them using AI, and presents maintainers with a dashboard to review and act on triaged issues — all from a single view.

### Features

- **Master Detail DataGrid** — expand any row to see the full triage inline
- **AI Triage Analysis** — classification, priority, completeness checklist, suggested action
- **Markdown Comment Editor** — pre-filled with a suggested response, editable before posting
- **One-Click Actions** — Post Comment, Apply Labels, Post & Label, Skip
- **Issue Body Rendering** — rendered markdown of the original issue, without leaving the dashboard
- **Activity Log** — tracks every action you take
- **Scan History** — view past scan runs and AI investigations

## Architecture

```
┌──────────────┐     ┌───────────────────────┐     ┌──────────────┐
│  GitHub API   │────▶│  Cloudflare Worker     │────▶│  D1 Database │
│  (polling)    │     │  (cron scan + API)     │     │  (storage)   │
└──────────────┘     └───────────┬────────────┘     └──────────────┘
                                 │
                          ┌──────▼───────┐
                          │  GitHub Pages │
                          │  (dashboard)  │
                          └──────┬───────┘
                                 │
                          ┌──────▼───────┐
                          │  Maintainer   │
                          │  (browser)    │
                          └──────────────┘
```

1. **Cron scan**: A Cloudflare Worker runs on a schedule, fetches issues from `mui/mui-x`, analyzes them with AI, and stores results in a D1 database
2. **API**: The same Worker exposes a REST API for the frontend to read issues, update statuses, and log activity
3. **Dashboard**: A React SPA on GitHub Pages fetches data from the Worker API
4. **Actions**: Maintainers review triage suggestions and take actions using their own GitHub PAT (client-side only)

### Security

- **PATs stay local** — stored in your browser's `localStorage`, never sent to any server
- **Actions are yours** — comments and labels are posted using your own token, appearing as you

## Tech Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- [MUI v6](https://mui.com/) + [MUI X DataGrid Pro](https://mui.com/x/react-data-grid/)
- [Cloudflare Workers](https://workers.cloudflare.com/) + [D1](https://developers.cloudflare.com/d1/)
- [Octokit](https://github.com/octokit/rest.js) (client-side GitHub API)
- Deployed on [GitHub Pages](https://pages.github.com/)

## Development

### Frontend

```bash
npm install
npm run dev     # Start dev server
npm run build   # Build for production
```

Set `VITE_API_URL` in `.env.local` to your Worker URL (e.g. `https://triage-desk-api.triage-desk.workers.dev`).

### Worker (Backend)

```bash
cd worker
npm install
wrangler dev    # Local development
wrangler deploy # Deploy to Cloudflare
```

## License

MIT
