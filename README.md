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
- **Hourly Auto-Refresh** — triage data is updated via cron and redeployed automatically

### How it works

```
┌──────────────┐     ┌───────────────┐     ┌──────────────┐
│  GitHub API   │────▶│  AI Triage    │────▶│  Static JSON │
│  (polling)    │     │  (analysis)   │     │  (committed) │
└──────────────┘     └───────────────┘     └──────┬───────┘
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

1. **Polling**: Issues with `status: waiting for maintainer` are fetched hourly from `mui/mui-x`
2. **Triage**: Each issue is analyzed — type, component, priority, completeness, suggested action & comment
3. **Deploy**: Results are committed as `data/triage-results.json` and deployed to GitHub Pages
4. **Review**: Maintainers open the dashboard, review triage suggestions, and take actions using their own GitHub PAT

### Security

- **No backend** — the dashboard is a static site
- **PATs stay local** — stored in your browser's `localStorage`, never sent to any server
- **Actions are yours** — comments and labels are posted using your own token, appearing as you

## Tech Stack

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- [MUI v6](https://mui.com/) + [MUI X DataGrid Pro](https://mui.com/x/react-data-grid/)
- [Octokit](https://github.com/octokit/rest.js) (client-side GitHub API)
- [react-markdown](https://github.com/remarkjs/react-markdown) + [remark-gfm](https://github.com/remarkjs/remark-gfm)
- Deployed on [GitHub Pages](https://pages.github.com/)

## Development

```bash
npm install
npm run dev     # Start dev server
npm run build   # Build for production
```

## License

MIT
