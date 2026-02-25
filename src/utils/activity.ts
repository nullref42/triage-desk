import type { ActivityEntry } from '../types'
import { postActivity, clearLocalActivity, fetchActivity } from '../api/triageApi'

const KEY = 'triage-desk-activity'

/** @deprecated Use fetchActivity() for async version. Kept for sync backwards compat. */
export function getActivity(): ActivityEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch { return [] }
}

export { fetchActivity }

export function addActivity(entry: Omit<ActivityEntry, 'id' | 'timestamp'>) {
  // Fire-and-forget — writes to both localStorage and API
  postActivity(entry)
}

export function clearActivity() {
  clearLocalActivity()
}
