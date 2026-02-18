const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone

// Triage scan runs at :00 every hour (e.g., 3:00, 4:00)
export function getNextTriageRunTime(): string {
  const now = new Date()
  const next = new Date(now)
  next.setMinutes(0, 0, 0)
  next.setHours(next.getHours() + 1)
  return formatCountdown(now, next)
}

// Investigation runs at :10 every 2 hours (e.g., 2:10, 4:10)
// At least 10 min after triage scan to avoid overlapping AI load
export function getNextInvestigationTime(): string {
  const now = new Date()
  const next = new Date(now)
  // Next even hour + 10 min
  next.setHours(next.getHours() + (2 - (next.getHours() % 2)), 10, 0, 0)
  if (next <= now) next.setHours(next.getHours() + 2)
  return formatCountdown(now, next)
}

// Max issues to investigate per cycle to avoid overwhelming the AI model
export const MAX_INVESTIGATIONS_PER_CYCLE = 3

function formatCountdown(now: Date, next: Date): string {
  const diff = next.getTime() - now.getTime()
  const hours = Math.floor(diff / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  const timeStr = next.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return `~${timeStr} (in ${hours > 0 ? hours + 'h ' : ''}${mins}m) · ${TZ}`
}
