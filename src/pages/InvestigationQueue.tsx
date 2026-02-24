import { useEffect, useState } from 'react'
import {
  Box, Typography, Chip, Paper, Divider,
} from '@mui/material'
import { DataGridPro } from '@mui/x-data-grid-pro'
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid-pro'
import ScienceIcon from '@mui/icons-material/Science'
import ScheduleIcon from '@mui/icons-material/Schedule'
import GitHubIcon from '@mui/icons-material/GitHub'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import type { TriageIssue } from '../types'
import { PriorityBadge } from '../components/Badges'
import { getNextInvestigationTime } from '../utils/time'

const columns: GridColDef[] = [
  { field: 'number', headerName: '#', width: 190, align: 'center', headerAlign: 'center', renderCell: (p: GridRenderCellParams) => (
    <Chip
      icon={<GitHubIcon sx={{ fontSize: '14px !important' }} />}
      deleteIcon={<OpenInNewIcon sx={{ fontSize: '12px !important', opacity: 0.6 }} />}
      onDelete={() => window.open(`https://github.com/mui/mui-x/issues/${p.value}`, '_blank')}
      label={`mui/mui-x#${p.value}`}
      size="small"
      component="a"
      href={`https://github.com/mui/mui-x/issues/${p.value}`}
      target="_blank"
      clickable
      sx={{ fontWeight: 600, fontSize: 12, bgcolor: 'rgba(108,99,255,0.08)', color: '#a5a0ff', border: '1px solid rgba(108,99,255,0.2)', '&:hover': { bgcolor: 'rgba(108,99,255,0.15)' }, '& .MuiChip-icon': { color: '#a5a0ff' }, '& .MuiChip-deleteIcon': { color: '#a5a0ff' } }}
    />
  )},
  { field: 'title', headerName: 'Title', flex: 1, minWidth: 300, type: 'longText' as any },
  { field: 'component', headerName: 'Component', width: 130, align: 'center', headerAlign: 'center' },
  { field: 'priority', headerName: 'Priority', width: 110, align: 'center', headerAlign: 'center', renderCell: (p: GridRenderCellParams) => <PriorityBadge priority={p.value} /> },
  { field: 'investigationStatus', headerName: 'Status', width: 130, align: 'center', headerAlign: 'center', renderCell: (p: GridRenderCellParams) => {
    const color = p.value === 'done' ? '#22c55e' : p.value === 'in-progress' ? '#3b82f6' : '#6b7280'
    const label = p.value === 'done' ? 'Done' : p.value === 'in-progress' ? 'In Progress' : 'Queued'
    return <Chip label={label} size="small" sx={{ bgcolor: `${color}20`, color, fontWeight: 600, fontSize: 12, border: `1px solid ${color}40` }} />
  }},
]

function DetailPanel({ issue }: { issue: TriageIssue }) {
  const investigation = (issue.triage as any).investigation
  const isQueued = !investigation || investigation.status === 'queued'

  return (
    <Box sx={{ p: 3, bgcolor: 'rgba(0,0,0,0.15)', borderTop: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' }}>
      {isQueued ? (
        <Paper sx={{ p: 3, bgcolor: 'rgba(59,130,246,0.04)', border: '1px solid rgba(59,130,246,0.1)', borderRadius: 2, maxWidth: 600 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <ScheduleIcon sx={{ fontSize: 18, color: '#6b7280' }} />
            <Typography fontSize={14} fontWeight={600} color="grey.400">Queued for Investigation</Typography>
          </Box>
          <Typography fontSize={13} color="text.secondary" mb={1}>
            This issue will be investigated during the next scheduled cycle. Investigation involves reading the relevant source code, understanding the root cause, and suggesting a fix.
          </Typography>
          <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />
          <Typography fontSize={12} color="grey.500">
            <strong>Next investigation window:</strong> {getNextInvestigationTime()}
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ maxWidth: 800 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <ScienceIcon sx={{ fontSize: 20, color: investigation.status === 'done' ? '#22c55e' : '#3b82f6' }} />
            <Typography fontSize={14} fontWeight={700} color={investigation.status === 'done' ? '#22c55e' : '#3b82f6'}>
              {investigation.status === 'done' ? 'Investigation Complete' : 'Investigation In Progress'}
            </Typography>
            {investigation.completedAt && (
              <Typography fontSize={12} color="grey.500" sx={{ ml: 1 }}>
                {new Date(investigation.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </Typography>
            )}
          </Box>

          {investigation.approach && (
            <>
              <Typography fontSize={12} fontWeight={700} color="grey.400" mb={0.5} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Approach</Typography>
              <Typography fontSize={13} mb={2} sx={{ lineHeight: 1.7 }}>{investigation.approach}</Typography>
            </>
          )}

          {investigation.painPoints && (
            <>
              <Typography fontSize={12} fontWeight={700} color="grey.400" mb={0.5} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Pain Points</Typography>
              <Typography fontSize={13} mb={2} sx={{ lineHeight: 1.7 }}>{investigation.painPoints}</Typography>
            </>
          )}

          {investigation.conclusion && (
            <>
              <Typography fontSize={12} fontWeight={700} color="grey.400" mb={0.5} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Conclusion</Typography>
              <Typography fontSize={13} mb={2} sx={{ lineHeight: 1.7 }}>{investigation.conclusion}</Typography>
            </>
          )}

          {investigation.reasoning && (
            <>
              <Typography fontSize={12} fontWeight={700} color="grey.400" mb={0.5} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Reasoning</Typography>
              <Typography fontSize={13} mb={2} sx={{ lineHeight: 1.7 }}>{investigation.reasoning}</Typography>
            </>
          )}

          {investigation.suggestedFix && (
            <>
              <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />
              <Typography fontSize={12} fontWeight={700} color="grey.400" mb={0.5} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Suggested Fix</Typography>
              <Paper sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2 }}>
                <Typography fontSize={13} fontFamily="monospace" whiteSpace="pre-wrap" sx={{ lineHeight: 1.6 }}>{investigation.suggestedFix}</Typography>
              </Paper>
            </>
          )}
        </Box>
      )}
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
        const investigateIssues = data.filter(i => i.triage?.suggestedAction === 'Investigate & Fix' && i.status !== 'archived')
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
    investigationStatus: (i.triage as any).investigation?.status || 'queued',
  }))

  const queuedCount = rows.filter(r => r.investigationStatus === 'queued').length
  const doneCount = rows.filter(r => r.investigationStatus === 'done').length

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
        <ScienceIcon sx={{ color: '#3b82f6', fontSize: 28 }} />
        <Typography variant="h4" fontWeight={700}>Investigation Queue</Typography>
      </Box>
      <Typography color="text.secondary" mb={1}>Issues that need codebase investigation to suggest a fix</Typography>
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
        <Chip label={`${queuedCount} queued`} size="small" sx={{ bgcolor: 'rgba(107,114,128,0.15)', color: '#9ca3af', fontWeight: 600, fontSize: 12 }} />
        <Chip label={`${doneCount} investigated`} size="small" sx={{ bgcolor: 'rgba(34,197,94,0.15)', color: '#22c55e', fontWeight: 600, fontSize: 12 }} />
        <Chip icon={<ScheduleIcon sx={{ fontSize: 14 }} />} label={`Next cycle: ${getNextInvestigationTime()}`} size="small" variant="outlined" sx={{ fontSize: 12, borderColor: 'rgba(255,255,255,0.1)' }} />
      </Box>
      <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', height: 'calc(100vh - 240px)', minHeight: 300 }}>
        <DataGridPro
          rows={rows}
          columns={columns}
          loading={loading}
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
