import type { TriageIssue, ActivityEntry } from '../types'

const API_BASE = import.meta.env.VITE_API_URL || ''

function apiUrl(path: string): string {
  return API_BASE ? `${API_BASE}${path}` : ''
}

function isApiConfigured(): boolean {
  return !!API_BASE
}

// --------------- Issues ---------------

export async function fetchIssues(): Promise<TriageIssue[]> {
  if (isApiConfigured()) {
    try {
      const res = await fetch(apiUrl('/api/issues'), { credentials: 'include' })
      if (!res.ok) throw new Error(`API ${res.status}`)
      const data = await res.json()
      return Array.isArray(data) ? data : data.issues ?? []
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
      return await res.json()
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
