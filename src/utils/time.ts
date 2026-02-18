const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone

export function getNextTriageRunTime(): string {
  const now = new Date()
  const next = new Date(now)
  next.setMinutes(0, 0, 0)
  next.setHours(next.getHours() + 1)
  const diff = next.getTime() - now.getTime()
  const mins = Math.floor(diff / 60000)
  const timeStr = next.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return `~${timeStr} (in ${mins}m) · ${TZ}`
}

export function getNextInvestigationTime(): string {
  const now = new Date()
  const next = new Date(now)
  next.setHours(next.getHours() + (2 - (next.getHours() % 2)), 0, 0, 0)
  if (next <= now) next.setHours(next.getHours() + 2)
  const diff = next.getTime() - now.getTime()
  const hours = Math.floor(diff / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  const timeStr = next.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  return `~${timeStr} (in ${hours > 0 ? hours + 'h ' : ''}${mins}m) · ${TZ}`
}
