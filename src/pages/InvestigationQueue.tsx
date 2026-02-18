import { useEffect, useState } from 'react'
import {
  Box, Typography, Chip, LinearProgress, Paper, Avatar, Divider,
} from '@mui/material'
import { DataGridPro } from '@mui/x-data-grid-pro'
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid-pro'
import ScienceIcon from '@mui/icons-material/Science'
import type { TriageIssue } from '../types'
import { PriorityBadge } from '../components/Badges'

const columns: GridColDef[] = [
  { field: 'number', headerName: '#', width: 100, align: 'center', headerAlign: 'center', renderCell: (p: GridRenderCellParams) => (
    <Chip
      label={`#${p.value}`}
      size="small"
      component="a"
      href={`https://github.com/mui/mui-x/issues/${p.value}`}
      target="_blank"
      clickable
      sx={{ fontWeight: 600, fontSize: 12, bgcolor: 'rgba(108,99,255,0.12)', color: '#a5a0ff', border: '1px solid rgba(108,99,255,0.25)', '&:hover': { bgcolor: 'rgba(108,99,255,0.2)' } }}
    />
  )},
  { field: 'title', headerName: 'Title', flex: 1, minWidth: 300, type: 'longText' as any },
  { field: 'component', headerName: 'Component', width: 130, align: 'center', headerAlign: 'center' },
  { field: 'priority', headerName: 'Priority', width: 110, align: 'center', headerAlign: 'center', renderCell: (p: GridRenderCellParams) => <PriorityBadge priority={p.value} /> },
  { field: 'completeness', headerName: 'Complete', width: 120, align: 'center', headerAlign: 'center', renderCell: (p: GridRenderCellParams) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
      <LinearProgress variant="determinate" value={p.value} sx={{ flex: 1, borderRadius: 4, height: 6, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: p.value > 70 ? '#22c55e' : p.value > 40 ? '#eab308' : '#ef4444' } }} />
      <Typography fontSize={12} color="text.secondary">{p.value}%</Typography>
    </Box>
  )},
  { field: 'investigationStatus', headerName: 'Investigation', width: 140, align: 'center', headerAlign: 'center', renderCell: (p: GridRenderCellParams) => {
    const color = p.value === 'done' ? '#22c55e' : p.value === 'in-progress' ? '#3b82f6' : '#6b7280'
    const label = p.value === 'done' ? 'Done' : p.value === 'in-progress' ? 'In Progress' : 'Queued'
    return <Chip label={label} size="small" sx={{ bgcolor: `${color}20`, color, fontWeight: 600, fontSize: 12, border: `1px solid ${color}40` }} />
  }},
]

function DetailPanel({ issue }: { issue: TriageIssue }) {
  return (
    <Box sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.15)', borderTop: '1px solid rgba(255,255,255,0.04)' }}>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: '1 1 400px', minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Avatar src={issue.authorAvatar} sx={{ width: 28, height: 28 }} />
            <Typography fontSize={13} fontWeight={600}>{issue.author}</Typography>
            <Typography fontSize={12} color="text.secondary">
              {new Date(issue.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Typography>
          </Box>
          <Typography fontSize={12} fontWeight={700} color="grey.400" mb={0.5} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Summary</Typography>
          <Typography fontSize={13} mb={2}>{issue.triage.summary}</Typography>
          <Typography fontSize={12} fontWeight={700} color="grey.400" mb={0.5} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Classification</Typography>
          <Typography fontSize={13} mb={2}>{issue.triage.classification}</Typography>
        </Box>
        <Box sx={{ flex: '1 1 300px', minWidth: 0 }}>
          <Paper sx={{ p: 2, bgcolor: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ScienceIcon sx={{ fontSize: 18, color: '#3b82f6' }} />
              <Typography fontSize={13} fontWeight={700} color="#3b82f6">Investigation Notes</Typography>
            </Box>
            <Typography fontSize={13} color="text.secondary">
              {issue.triage.investigationNotes || 'Queued for investigation. Will be analyzed during the next scheduled investigation cycle.'}
            </Typography>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

export default function InvestigationQueue() {
  const [issues, setIssues] = useState<TriageIssue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data/triage-results.json?v=' + Date.now())
      .then(r => r.json())
      .then((data: TriageIssue[]) => {
        const investigateIssues = data.filter(i => i.triage.suggestedAction === 'Investigate & Fix' && i.status !== 'archived')
        setIssues(investigateIssues)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const rows = issues.map(i => ({
    id: i.number,
    number: i.number,
    title: i.title,
    component: i.triage.component,
    priority: i.triage.priority,
    completeness: i.triage.completeness,
    investigationStatus: (i.triage as any).investigationStatus || 'queued',
  }))

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
        <ScienceIcon sx={{ color: '#3b82f6', fontSize: 28 }} />
        <Typography variant="h4" fontWeight={700}>Investigation Queue</Typography>
      </Box>
      <Typography color="text.secondary" mb={3}>Issues that need codebase investigation to suggest a fix</Typography>
      <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <DataGridPro
          rows={rows}
          columns={columns}
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
          getDetailPanelContent={({ row }) => {
            const issue = issues.find(i => i.number === row.number)
            return issue ? <DetailPanel issue={issue} /> : null
          }}
          getDetailPanelHeight={() => 'auto' as const}
          sx={{
            border: 'none',
            '& .MuiDataGrid-row': { cursor: 'pointer', '&:hover': { bgcolor: 'rgba(59,130,246,0.04)' } },
            '& .MuiDataGrid-columnHeaders': { bgcolor: 'rgba(255,255,255,0.02)' },
            '& .MuiDataGrid-cell': { borderColor: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center' },
          }}
          pageSizeOptions={[10, 25]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        />
      </Box>
    </Box>
  )
}
