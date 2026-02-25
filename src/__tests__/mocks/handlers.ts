import { http, HttpResponse } from 'msw'
import type { TriageIssue, ActivityEntry } from '../../types'

export const mockIssues: TriageIssue[] = [
  {
    number: 1234,
    title: 'Test issue: DataGrid crash',
    url: 'https://github.com/mui/mui-x/issues/1234',
    author: 'testuser',
    authorAvatar: 'https://avatars.githubusercontent.com/u/1?v=4',
    createdAt: '2025-01-15T10:00:00Z',
    labels: ['bug', 'component: data grid'],
    body: 'The DataGrid crashes when...',
    triage: {
      type: 'Bug',
      component: 'DataGrid',
      priority: 'High',
      completeness: 80,
      summary: 'DataGrid crashes on sort',
      classification: 'Confirmed bug in sorting logic',
      checklist: {
        hasReproSteps: true,
        hasVersion: true,
        hasExpectedBehavior: true,
        hasEnvironment: false,
        hasScreenshot: false,
      },
      suggestedLabels: ['bug', 'component: data grid', 'priority: high'],
      suggestedAction: 'Triage & Label',
      suggestedComment: 'Thank you for the report.',
    },
    status: 'pending',
  },
  {
    number: 5678,
    title: 'Feature: add dark mode to DatePicker',
    url: 'https://github.com/mui/mui-x/issues/5678',
    author: 'anotheruser',
    authorAvatar: 'https://avatars.githubusercontent.com/u/2?v=4',
    createdAt: '2025-02-01T12:00:00Z',
    labels: ['feature request'],
    body: 'It would be nice if...',
    triage: {
      type: 'Feature',
      component: 'DatePicker',
      priority: 'Medium',
      completeness: 60,
      summary: 'Dark mode for DatePicker',
      classification: 'Feature request',
      checklist: {
        hasReproSteps: false,
        hasVersion: true,
        hasExpectedBehavior: true,
        hasEnvironment: false,
        hasScreenshot: true,
      },
      suggestedLabels: ['feature request', 'component: date picker'],
      suggestedAction: 'Investigate & Fix',
      suggestedComment: 'Thanks for the suggestion.',
    },
    status: 'pending',
  },
]

export const mockActivity: ActivityEntry[] = [
  {
    id: 'act-1',
    timestamp: '2025-02-20T10:00:00Z',
    issueNumber: 1234,
    issueTitle: 'Test issue: DataGrid crash',
    action: 'Posted comment',
  },
]

/** Flat snake_case format as returned by the real Cloudflare Worker API (D1 join) */
export const mockFlatApiIssues = [
  {
    number: 1234,
    title: 'Test issue: DataGrid crash',
    url: 'https://github.com/mui/mui-x/issues/1234',
    author: 'testuser',
    author_avatar: 'https://avatars.githubusercontent.com/u/1?v=4',
    created_at: '2025-01-15T10:00:00Z',
    labels: '["bug","component: data grid"]',
    body: 'The DataGrid crashes when...',
    status: 'pending',
    updated_at: '2025-01-15T10:00:00Z',
    updated_by: null,
    type: 'Bug',
    component: 'DataGrid',
    priority: 'High',
    completeness: 80,
    summary: 'DataGrid crashes on sort',
    classification: 'Confirmed bug in sorting logic',
    checklist: '{"hasReproSteps":true,"hasVersion":true,"hasExpectedBehavior":true,"hasEnvironment":false,"hasScreenshot":false}',
    suggested_labels: '["bug","component: data grid","priority: high"]',
    suggested_action: 'Triage & Label',
    suggested_comment: 'Thank you for the report.',
    investigation: null,
    analyzed_at: '2025-01-15T10:00:00Z',
  },
]

export const mockScanRuns = [
  {
    id: 1,
    started_at: '2025-02-20T08:00:00Z',
    finished_at: '2025-02-20T08:05:00Z',
    issues_found: 15,
    issues_new: 3,
    issues_updated: 12,
    status: 'completed',
    summary: 'Routine scan',
  },
  {
    id: 2,
    started_at: '2025-02-21T08:00:00Z',
    finished_at: '2025-02-21T08:04:00Z',
    issues_found: 10,
    issues_new: 1,
    issues_updated: 9,
    status: 'completed',
    summary: null,
  },
]

export const mockInvestigations = [
  {
    number: 1234,
    title: 'Test issue: DataGrid crash',
    url: 'https://github.com/mui/mui-x/issues/1234',
    status: 'pending',
    component: 'DataGrid',
    priority: 'High',
    investigation: JSON.stringify({
      status: 'done',
      approach: 'Reproduced locally',
      painPoints: 'Hard to debug',
      conclusion: 'Confirmed bug in sort comparator',
      reasoning: 'The comparator fails on null values',
      suggestedFix: 'Add null check in comparator',
      completedAt: '2025-02-20T09:00:00Z',
    }),
    analyzed_at: '2025-02-20T08:30:00Z',
  },
]

export const handlers = [
  http.get('http://test-api.local/api/issues', () => {
    // Return flat API format (like real Worker does)
    return HttpResponse.json({ issues: mockFlatApiIssues })
  }),

  http.get('http://test-api.local/api/issues/:number', ({ params }) => {
    const issue = mockFlatApiIssues.find(i => i.number === Number(params.number))
    if (!issue) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(issue)
  }),

  http.patch('http://test-api.local/api/issues/:number/status', () => {
    return HttpResponse.json({ ok: true })
  }),

  http.get('http://test-api.local/api/activity', () => {
    return HttpResponse.json(mockActivity)
  }),

  http.post('http://test-api.local/api/activity', () => {
    return HttpResponse.json({ ok: true })
  }),

  http.get('http://test-api.local/api/scan/history', ({ request }) => {
    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit') || 20)
    const offset = Number(url.searchParams.get('offset') || 0)
    const sliced = mockScanRuns.slice(offset, offset + limit)
    return HttpResponse.json({ runs: sliced, total: mockScanRuns.length })
  }),

  http.get('http://test-api.local/api/scan/investigations', ({ request }) => {
    const url = new URL(request.url)
    const limit = Number(url.searchParams.get('limit') || 50)
    const offset = Number(url.searchParams.get('offset') || 0)
    const sliced = mockInvestigations.slice(offset, offset + limit)
    return HttpResponse.json({ investigations: sliced, total: mockInvestigations.length })
  }),
]
