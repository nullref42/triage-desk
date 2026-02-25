import type { TriageIssue, ActivityEntry, Triage } from '../types'

const API_BASE = import.meta.env.VITE_API_URL || ''

function apiUrl(path: string): string {
  return API_BASE ? `${API_BASE}${path}` : ''
}

function isApiConfigured(): boolean {
  return !!API_BASE
}

/** Transform flat API row (snake_case, triage fields at top level) into TriageIssue shape */
function normalizeIssue(raw: any): TriageIssue {
  // If already has nested triage object, return as-is (JSON fallback format)
  if (raw.triage) return raw

  const parseJson = (v: any, fallback: any = null) => {
    if (v == null) return fallback
    if (typeof v === 'object') return v
    try { return JSON.parse(v) } catch { return fallback }
  }

  const triage: Triage = {
    type: raw.type || 'Bug',
    component: raw.component || '',
    priority: raw.priority || 'Medium',
    completeness: raw.completeness ?? 0,
    summary: raw.summary || '',
    classification: raw.classification || '',
    checklist: parseJson(raw.checklist, { hasReproSteps: false, hasVersion: false, hasExpectedBehavior: false, hasEnvironment: false, hasScreenshot: false }),
    suggestedLabels: parseJson(raw.suggested_labels, []),
    suggestedAction: raw.suggested_action || '',
    suggestedComment: raw.suggested_comment || '',
    investigation: parseJson(raw.investigation, undefined),
  }

  return {
    number: raw.number,
    title: raw.title,
    url: raw.url,
    author: raw.author,
    authorAvatar: raw.author_avatar || raw.authorAvatar || '',
    createdAt: raw.created_at || raw.createdAt || '',
    labels: parseJson(raw.labels, []),
    body: raw.body || '',
    triage,
    status: raw.status || 'pending',
  }
}

// --------------- Issues ---------------

export async function fetchIssues(): Promise<TriageIssue[]> {
  if (isApiConfigured()) {
    try {
      const res = await fetch(apiUrl('/api/issues'), { credentials: 'include' })
      if (!res.ok) throw new Error(`API ${res.status}`)
      const data = await res.json()
      const list = Array.isArray(data) ? data : data.issues ?? []
      return list.map(normalizeIssue)
    } catch {
      // fallback to static JSON
    }
  }
  return fetchIssuesFromJson()
}

async function fetchIssuesFromJson(): Promise<TriageIssue[]> {
  try {
    const res = await fetch(import.meta.env.BASE_URL + 'data/triage-results.json?v=' + Date.now())
    const data = await res.json()
    const list: TriageIssue[] = Array.isArray(data) ? data : data.issues ?? []
    return list.filter(i => i.triage)
  } catch {
    return []
  }
}

export async function fetchIssue(number: number): Promise<TriageIssue | null> {
  if (isApiConfigured()) {
    try {
      const res = await fetch(apiUrl(`/api/issues/${number}`), { credentials: 'include' })
      if (!res.ok) throw new Error(`API ${res.status}`)
      const raw = await res.json()
      return raw ? normalizeIssue(raw) : null
    } catch {
      // fallback
    }
  }
  const all = await fetchIssuesFromJson()
  return all.find(i => i.number === number) ?? null
}

// --------------- Status ---------------

const STATUS_KEY = 'triage-desk-statuses'

function getLocalStatuses(): Record<number, string> {
  try {
    return JSON.parse(localStorage.getItem(STATUS_KEY) || '{}')
  } catch {
    return {}
  }
}

function setLocalStatus(issueNumber: number, status: string) {
  const statuses = getLocalStatuses()
  statuses[issueNumber] = status
  localStorage.setItem(STATUS_KEY, JSON.stringify(statuses))
}

export async function updateIssueStatus(issueNumber: number, status: string): Promise<void> {
  // Always write to localStorage
  setLocalStatus(issueNumber, status)

  // Also write to API if configured
  if (isApiConfigured()) {
    try {
      await fetch(apiUrl(`/api/issues/${issueNumber}/status`), {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
    } catch {
      // localStorage already has the change, API will sync later
    }
  }
}

// --------------- Activity ---------------

const ACTIVITY_KEY = 'triage-desk-activity'

function getLocalActivity(): ActivityEntry[] {
  try {
    return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || '[]')
  } catch {
    return []
  }
}

export async function fetchActivity(): Promise<ActivityEntry[]> {
  if (isApiConfigured()) {
    try {
      const res = await fetch(apiUrl('/api/activity'), { credentials: 'include' })
      if (!res.ok) throw new Error(`API ${res.status}`)
      return await res.json()
    } catch {
      // fallback
    }
  }
  return getLocalActivity()
}

export async function postActivity(entry: Omit<ActivityEntry, 'id' | 'timestamp'>): Promise<void> {
  const full: ActivityEntry = {
    ...entry,
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
  }

  // Always write to localStorage
  const list = getLocalActivity()
  list.unshift(full)
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(list.slice(0, 200)))

  // Also write to API if configured
  if (isApiConfigured()) {
    try {
      await fetch(apiUrl('/api/activity'), {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(full),
      })
    } catch {
      // localStorage already has it
    }
  }
}

export function clearLocalActivity(): void {
  localStorage.removeItem(ACTIVITY_KEY)
}

// --------------- Scan History ---------------

export interface ScanRun {
  id: number
  started_at: string
  finished_at: string
  issues_found: number
  issues_new: number
  issues_updated: number
  status: string
  summary?: string
}

export interface InvestigationRow {
  number: number
  title: string
  url: string
  status: string
  component: string
  priority: string
  investigation: string // JSON string
  analyzed_at: string
}

export async function fetchScanHistory(limit = 20, offset = 0): Promise<{ runs: ScanRun[]; total: number }> {
  if (isApiConfigured()) {
    const res = await fetch(apiUrl(`/api/scan/history?limit=${limit}&offset=${offset}`), { credentials: 'include' })
    if (!res.ok) throw new Error(`API ${res.status}`)
    return await res.json()
  }
  return { runs: [], total: 0 }
}

export async function fetchInvestigations(limit = 50, offset = 0): Promise<{ investigations: InvestigationRow[]; total: number }> {
  if (isApiConfigured()) {
    const res = await fetch(apiUrl(`/api/scan/investigations?limit=${limit}&offset=${offset}`), { credentials: 'include' })
    if (!res.ok) throw new Error(`API ${res.status}`)
    return await res.json()
  }
  return { investigations: [], total: 0 }
}
