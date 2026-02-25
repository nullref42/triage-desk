import type { ActivityEntry } from '../types'
import { postActivity, fetchActivity } from '../api/triageApi'

export { fetchActivity }

export function addActivity(entry: Omit<ActivityEntry, 'id' | 'timestamp'>) {
  // Fire-and-forget — writes to API
  postActivity(entry)
}
