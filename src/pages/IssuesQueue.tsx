import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Typography, LinearProgress } from '@mui/material'
import { DataGrid } from '@mui/x-data-grid'
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import type { TriageIssue } from '../types'
import { TypeBadge, PriorityBadge, StatusBadge } from '../components/Badges'

const columns: GridColDef[] = [
  { field: 'number', headerName: '#', width: 80, renderCell: (p: GridRenderCellParams) => <Typography fontWeight={600} fontSize={13}>#{p.value}</Typography> },
  { field: 'title', headerName: 'Title', flex: 1, minWidth: 250 },
  { field: 'type', headerName: 'Type', width: 110, renderCell: (p: GridRenderCellParams) => <TypeBadge type={p.value} /> },
  { field: 'component', headerName: 'Component', width: 130 },
  { field: 'priority', headerName: 'Priority', width: 110, renderCell: (p: GridRenderCellParams) => <PriorityBadge priority={p.value} /> },
  { field: 'completeness', headerName: 'Complete', width: 100, renderCell: (p: GridRenderCellParams) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
      <LinearProgress variant="determinate" value={p.value} sx={{ flex: 1, borderRadius: 4, height: 6, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: p.value > 70 ? '#22c55e' : p.value > 40 ? '#eab308' : '#ef4444' } }} />
      <Typography fontSize={12} color="text.secondary">{p.value}%</Typography>
    </Box>
  )},
  { field: 'suggestedAction', headerName: 'Action', width: 160 },
  { field: 'status', headerName: 'Status', width: 100, renderCell: (p: GridRenderCellParams) => <StatusBadge status={p.value} /> },
]

export default function IssuesQueue() {
  const [issues, setIssues] = useState<TriageIssue[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data/triage-results.json')
      .then(r => r.json())
      .then((data: TriageIssue[]) => { setIssues(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const rows = issues.map(i => ({
    id: i.number,
    number: i.number,
    title: i.title,
    type: i.triage.type,
    component: i.triage.component,
    priority: i.triage.priority,
    completeness: i.triage.completeness,
    suggestedAction: i.triage.suggestedAction,
    status: i.status,
  }))

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={0.5}>Issues Queue</Typography>
      <Typography color="text.secondary" mb={3}>Triaged issues from mui/mui-x ready for review</Typography>
      <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          autoHeight
          disableRowSelectionOnClick
          onRowClick={(params) => navigate(`/issues/${params.row.number}`)}
          sx={{
            border: 'none',
            '& .MuiDataGrid-row': { cursor: 'pointer', '&:hover': { bgcolor: 'rgba(108,99,255,0.04)' } },
            '& .MuiDataGrid-columnHeaders': { bgcolor: 'rgba(255,255,255,0.02)' },
            '& .MuiDataGrid-cell': { borderColor: 'rgba(255,255,255,0.04)' },
          }}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
        />
      </Box>
    </Box>
  )
}
