# Changelog

All notable changes to Triage Desk will be documented in this file.

## [0.5.0] - 2026-02-25

### Added
- **Phase 2: Frontend API integration** — migrated all data fetching from local JSON to live Cloudflare Worker API
- **Phase 3: Scan pipeline migration** — scan cron now POSTs triage results to Worker API with upsert logic
- **Scan History page** — view past scan runs in a DataGrid with status, timing, and issue counts
- **Investigation details** — expandable rows in Scan History showing AI investigation approach, pain points, conclusion, and suggested fix
- **Archive/Unarchive button** — move issues between active and archived status via API
- **Next scan/investigation timers** — chips on Scan History page showing countdown to next scheduled runs
- **Comprehensive README** — full architecture docs covering data flow, schema, auth, and deployment

### Fixed
- **Activity Log crash** (`e.map is not a function`) — API now returns array directly; frontend guards against non-array responses
- **CORS configuration** — added all required origins and headers to Worker CORS middleware
- **Paper import** — fixed missing MUI Paper import in multiple components
- **Flat API normalization** — frontend now handles both flat (snake_case) and nested API response formats
- **Issue body loading** — body field now properly fetched and rendered in detail panel

### Changed
- **Phase 4: Cleanup** — removed legacy local data files and unused imports
- Scan cron updated to re-triage ALL issues every run (not just new ones)

## [0.3.2] - 2026-02-18

### Changed
- **Removed Skip button** — no local state mutations without a database; will revisit when we have persistence
- **Issue chip redesigned** — now shows GitHub icon + `mui/mui-x#12345` + external link icon
- **Next scan timer** added to Issues Queue header with timezone
- **Timezone** now shown on all timers (Issues Queue + Investigation Queue)
- **Settings security notice** — added prominent info box reinforcing that the PAT never leaves the machine

### Fixed
- Investigation Queue now uses shared time utility (DRY)

## [0.3.1] - 2026-02-18

### Improved
- **DataGrid height** now fills available viewport — no more scrolling to the bottom to see errors
- **Error snackbar** anchored to top-center for immediate visibility
- **Investigation Queue** redesigned — focused solely on investigation info: approach, pain points, conclusion, reasoning, and suggested fix
- **Next investigation time** shown in Investigation Queue header and in each queued issue's detail
- **Investigation results** now reflected in Issues Queue — when investigation is done, the triage panel shows a summary and suggested fix inline
- **Investigation data model** expanded: `approach`, `painPoints`, `conclusion`, `reasoning`, `suggestedFix`, `completedAt`

## [0.3.0] - 2026-02-18

### Added
- **Investigation Queue** — dedicated view for issues needing codebase investigation, with investigation status tracking (Queued / In Progress / Done)
- **Active/Archived tabs** on Issues Queue — closed or resolved issues move to Archived, keeping the active queue clean
- **GitHub link chip** on `#` column — click the issue number to open it directly on GitHub

### Improved
- **PAT error handling** — Post Comment / Apply Labels / Post & Label now show a clear error message when no PAT is configured, instead of silently failing
- **Horizontal scroll isolation** — detail panel content no longer causes the entire DataGrid to scroll; content adjusts to available width
- **Vertical centering** fixed on all DataGrid cells (#, Complete, etc.)
- **Labels section** now clearly separates "Current Labels" from "Suggested Labels to Add"

## [0.2.2] - 2026-02-18

### Improved
- Centered text alignment across all DataGrid columns (except Title)
- Title column now uses `longText` column type for better readability
- Labels section split into "Current Labels" and "Suggested Labels to Add" — clearly distinguishes existing labels from AI suggestions
- Added "View on GitHub" button on the Issue tab

## [0.2.1] - 2026-02-18

### Fixed
- Replaced iframe with rendered markdown for Issue tab (GitHub blocks iframe embedding via `X-Frame-Options: deny`)

## [0.2.0] - 2026-02-18

### Added
- **Master Detail panel** — expand any row inline to see triage info and take actions without leaving the queue
- Two detail tabs: **🤖 Triage** (summary, checklist, comment editor, actions) and **🌐 Issue** (rendered issue body)
- Upgraded to MUI X DataGrid Pro for detail panel support
- "Open on GitHub" icon button in detail panel header

### Removed
- Separate drill-down Issue Detail page — everything is inline now

## [0.1.0] - 2026-02-18

### Added
- Initial MVP release
- Issues Queue with MUI DataGrid showing triaged issues
- Issue Detail page with markdown rendering, AI triage analysis, completeness checklist
- Markdown comment editor with Edit/Preview toggle
- Post Comment, Apply Labels, Post & Label, Skip actions via Octokit
- Settings page for GitHub PAT (stored in browser localStorage)
- Activity Log tracking all actions
- Dark theme with color-coded type/priority/status badges
- 16 real triaged issues from mui/mui-x
- Deployed on GitHub Pages
