import { useState, useEffect, useCallback } from 'react'
import { Box, Typography, Paper, Chip, Collapse, IconButton } from '@mui/material'
import { DataGridPro } from '@mui/x-data-grid-pro'
import type { GridColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid-pro'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import {
  fetchScanHistory, fetchInvestigations,
  type ScanRun, type InvestigationRow,
} from '../api/triageApi'
import type { Investigation } from '../types'

const statusColor: Record<string, 'success' | 'error' | 'warning' | 'info'> = {
  completed: 'success', failed: 'error', running: 'warning',
}

const scanColumns: GridColDef[] = [
  {
    field: 'started_at', headerName: 'Started', width: 180,
    renderCell: (p: GridRenderCellParams) => new Date(p.value).toLocaleString(),
  },
  {
    field: 'finished_at', headerName: 'Finished', width: 180,
    renderCell: (p: GridRenderCellParams) => p.value ? new Date(p.value).toLocaleString() : '—',
  },
  { field: 'issues_found', headerName: 'Found', width: 90, align: 'center', headerAlign: 'center' },
  { field: 'issues_new', headerName: 'New', width: 80, align: 'center', headerAlign: 'center' },
  { field: 'issues_updated', headerName: 'Updated', width: 90, align: 'center', headerAlign: 'center' },
  {
    field: 'status', headerName: 'Status', width: 120,
    renderCell: (p: GridRenderCellParams) => (
      <Chip label={p.value} size="small" color={statusColor[p.value] ?? 'default'} sx={{ fontWeight: 600, fontSize: 12 }} />
    ),
  },
  { field: 'summary', headerName: 'Summary', flex: 1, minWidth: 200 },
]

const invColumns: GridColDef[] = [
  { field: 'number', headerName: '#', width: 80, align: 'center', headerAlign: 'center' },
  { field: 'title', headerName: 'Title', flex: 1, minWidth: 250 },
  { field: 'component', headerName: 'Component', width: 140 },
  {
    field: 'priority', headerName: 'Priority', width: 100,
    renderCell: (p: GridRenderCellParams) => {
      const colors: Record<string, string> = { Critical: '#f44336', High: '#ff9800', Medium: '#2196f3', Low: '#4caf50' }
      return <Chip label={p.value || '—'} size="small" sx={{ bgcolor: colors[p.value] ?? '#666', color: '#fff', fontWeight: 600, fontSize: 12 }} />
    },
  },
  {
    field: 'inv_status', headerName: 'Status', width: 110,
    valueGetter: (_value: unknown, row: InvestigationRow) => {
      try { return JSON.parse(row.investigation)?.status ?? '—' } catch { return '—' }
    },
    renderCell: (p: GridRenderCellParams) => (
      <Chip label={p.value} size="small" color={p.value === 'done' ? 'success' : 'warning'} sx={{ fontWeight: 600, fontSize: 12 }} />
    ),
  },
  {
    field: 'url', headerName: '', width: 50,
    renderCell: (p: GridRenderCellParams) => (
      <IconButton size="small" onClick={() => window.open(p.value, '_blank')}><OpenInNewIcon fontSize="small" /></IconButton>
    ),
  },
]

function InvestigationDetail({ row }: { row: InvestigationRow }) {
  let inv: Investigation | null = null
  try { inv = JSON.parse(row.investigation) } catch { /* */ }
  if (!inv) return <Typography color="text.secondary" p={2}>No investigation data</Typography>

  const sections = [
    { label: 'Approach', value: inv.approach },
    { label: 'Pain Points', value: inv.painPoints },
    { label: 'Reasoning', value: inv.reasoning },
    { label: 'Conclusion', value: inv.conclusion },
    { label: 'Suggested Fix', value: inv.suggestedFix },
  ]

  return (
    <Box sx={{ p: 2, pl: 4, bgcolor: 'rgba(108,99,255,0.04)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {sections.map(s => s.value ? (
        <Box key={s.label} mb={1.5}>
          <Typography fontSize={12} fontWeight={700} color="primary.main" mb={0.3}>{s.label}</Typography>
          <Typography fontSize={13} color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{s.value}</Typography>
        </Box>
      ) : null)}
      {inv.completedAt && (
        <Typography fontSize={11} color="text.secondary" mt={1}>Completed: {new Date(inv.completedAt).toLocaleString()}</Typography>
      )}
    </Box>
  )
}

export default function ScanHistory() {
  const [scans, setScans] = useState<ScanRun[]>([])
  const [scanTotal, setScanTotal] = useState(0)
  const [investigations, setInvestigations] = useState<InvestigationRow[]>([])
  const [invTotal, setInvTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  useEffect(() => {
    Promise.all([
      fetchScanHistory().then(d => { setScans(d.runs); setScanTotal(d.total) }),
      fetchInvestigations().then(d => { setInvestigations(d.investigations); setInvTotal(d.total) }),
    ]).finally(() => setLoading(false))
  }, [])

  const toggleRow = useCallback((id: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={0.5}>Scan History</Typography>
      <Typography color="text.secondary" mb={3}>Overview of scan runs and investigated issues</Typography>

      {/* Scan Runs */}
      <Typography variant="h6" fontWeight={600} mb={1.5}>Scan Runs</Typography>
      <Paper sx={{ bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.06)', mb: 4 }}>
        <DataGridPro
          rows={scans}
          columns={scanColumns}
          loading={loading}
          autoHeight
          getRowId={(row) => row.id}
          pageSizeOptions={[10, 20, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pagination
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': { borderColor: 'rgba(255,255,255,0.04)' },
            '& .MuiDataGrid-columnHeaders': { bgcolor: 'rgba(108,99,255,0.06)' },
          }}
        />
      </Paper>

      {/* Investigations */}
      <Typography variant="h6" fontWeight={600} mb={1.5}>
        Investigations <Chip label={invTotal} size="small" sx={{ ml: 1, fontWeight: 600 }} />
      </Typography>
      <Paper sx={{ bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.06)' }}>
        <DataGridPro
          rows={investigations}
          columns={[
            {
              field: 'expand', headerName: '', width: 50, sortable: false, filterable: false,
              renderCell: (p: GridRenderCellParams) => (
                <IconButton size="small" onClick={() => toggleRow(p.row.number)}>
                  {expandedRows.has(p.row.number) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              ),
            },
            ...invColumns,
          ]}
          loading={loading}
          autoHeight
          getRowId={(row) => row.number}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          pagination
          disableRowSelectionOnClick
          getDetailPanelContent={(params: GridRowParams) => <InvestigationDetail row={params.row as InvestigationRow} />}
          getDetailPanelHeight={() => 'auto'}
          detailPanelExpandedRowIds={[...expandedRows]}
          onDetailPanelExpandedRowIdsChange={(ids) => setExpandedRows(new Set(ids as number[]))}
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': { borderColor: 'rgba(255,255,255,0.04)' },
            '& .MuiDataGrid-columnHeaders': { bgcolor: 'rgba(108,99,255,0.06)' },
          }}
        />
      </Paper>
    </Box>
  )
}
