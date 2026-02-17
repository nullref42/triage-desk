import { Chip } from '@mui/material'

const typeColors: Record<string, string> = {
  Bug: '#ef4444',
  Feature: '#3b82f6',
  Question: '#a855f7',
}

const priorityColors: Record<string, string> = {
  Critical: '#ef4444',
  High: '#f97316',
  Medium: '#eab308',
  Low: '#22c55e',
}

export function TypeBadge({ type }: { type: string }) {
  return (
    <Chip
      label={type}
      size="small"
      sx={{
        bgcolor: `${typeColors[type] || '#666'}20`,
        color: typeColors[type] || '#666',
        fontWeight: 600,
        fontSize: 12,
        border: `1px solid ${typeColors[type] || '#666'}40`,
      }}
    />
  )
}

export function PriorityBadge({ priority }: { priority: string }) {
  return (
    <Chip
      label={priority}
      size="small"
      sx={{
        bgcolor: `${priorityColors[priority] || '#666'}20`,
        color: priorityColors[priority] || '#666',
        fontWeight: 600,
        fontSize: 12,
        border: `1px solid ${priorityColors[priority] || '#666'}40`,
      }}
    />
  )
}

export function StatusBadge({ status }: { status: string }) {
  const color = status === 'done' ? '#22c55e' : status === 'skipped' ? '#6b7280' : '#eab308'
  return (
    <Chip
      label={status}
      size="small"
      sx={{ bgcolor: `${color}20`, color, fontWeight: 600, fontSize: 12, border: `1px solid ${color}40`, textTransform: 'capitalize' }}
    />
  )
}
