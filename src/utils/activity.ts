import type { ActivityEntry } from '../types'

const KEY = 'triage-desk-activity'

export function getActivity(): ActivityEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch { return [] }
}

export function addActivity(entry: Omit<ActivityEntry, 'id' | 'timestamp'>) {
  const list = getActivity()
  list.unshift({ ...entry, id: crypto.randomUUID(), timestamp: new Date().toISOString() })
  localStorage.setItem(KEY, JSON.stringify(list.slice(0, 200)))
}

export function clearActivity() {
  localStorage.removeItem(KEY)
}
