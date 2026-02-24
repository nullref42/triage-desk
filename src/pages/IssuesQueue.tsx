import { useCallback, useEffect, useState } from 'react'
import {
  Box, Typography, LinearProgress, Tabs, Tab, TextField, Button,
  ToggleButtonGroup, ToggleButton, Checkbox, FormControlLabel,
  Divider, Chip, Avatar, Snackbar, Alert, Tooltip, IconButton,
} from '@mui/material'
import { DataGridPro } from '@mui/x-data-grid-pro'
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid-pro'
import SendIcon from '@mui/icons-material/Send'
import LabelIcon from '@mui/icons-material/Label'
import GitHubIcon from '@mui/icons-material/GitHub'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { TriageIssue } from '../types'
import { TypeBadge, PriorityBadge, StatusBadge } from '../components/Badges'
import { getOctokit } from '../utils/github'
import { addActivity } from '../utils/activity'
import { getNextTriageRunTime } from '../utils/time'
import ScheduleIcon from '@mui/icons-material/Schedule'

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
  { field: 'title', headerName: 'Title', flex: 1, minWidth: 250, type: 'longText' as any },
  { field: 'type', headerName: 'Type', width: 110, align: 'center', headerAlign: 'center', renderCell: (p: GridRenderCellParams) => <TypeBadge type={p.value} /> },
  { field: 'component', headerName: 'Component', width: 130, align: 'center', headerAlign: 'center' },
  { field: 'priority', headerName: 'Priority', width: 110, align: 'center', headerAlign: 'center', renderCell: (p: GridRenderCellParams) => <PriorityBadge priority={p.value} /> },
  { field: 'completeness', headerName: 'Complete', width: 120, align: 'center', headerAlign: 'center', renderCell: (p: GridRenderCellParams) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
      <LinearProgress variant="determinate" value={p.value} sx={{ flex: 1, borderRadius: 4, height: 6, bgcolor: 'rgba(255,255,255,0.05)', '& .MuiLinearProgress-bar': { bgcolor: p.value > 70 ? '#22c55e' : p.value > 40 ? '#eab308' : '#ef4444' } }} />
      <Typography fontSize={12} color="text.secondary">{p.value}%</Typography>
    </Box>
  )},
  { field: 'suggestedAction', headerName: 'Action', width: 160, align: 'center', headerAlign: 'center' },
  { field: 'status', headerName: 'Status', width: 100, align: 'center', headerAlign: 'center', renderCell: (p: GridRenderCellParams) => <StatusBadge status={p.value} /> },
]

function DetailPanel({ issue }: { issue: TriageIssue }) {
  const [tab, setTab] = useState(0)
  const [comment, setComment] = useState(issue.triage.suggestedComment)
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit')
  const [selectedLabels, setSelectedLabels] = useState<string[]>(issue.triage.suggestedLabels)
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' })
  const [loading, setLoading] = useState(false)

  const showSnack = (msg: string, severity: 'success' | 'error') => setSnack({ open: true, msg, severity })

  const postComment = async (): Promise<boolean> => {
    const octokit = getOctokit()
    if (!octokit) { showSnack('Set your GitHub token in Settings first. Go to Settings → add your PAT.', 'error'); return false }
    setLoading(true)
    try {
      await octokit.issues.createComment({ owner: 'mui', repo: 'mui-x', issue_number: issue.number, body: comment })
      addActivity({ issueNumber: issue.number, issueTitle: issue.title, action: 'Posted comment' })
      showSnack('Comment posted!', 'success')
      setLoading(false)
      return true
    } catch (e: any) { showSnack(e.message, 'error'); setLoading(false); return false }
  }

  const applyLabels = async (): Promise<boolean> => {
    const octokit = getOctokit()
    if (!octokit) { showSnack('Set your GitHub token in Settings first. Go to Settings → add your PAT.', 'error'); return false }
    setLoading(true)
    try {
      await octokit.issues.addLabels({ owner: 'mui', repo: 'mui-x', issue_number: issue.number, labels: selectedLabels })
      addActivity({ issueNumber: issue.number, issueTitle: issue.title, action: 'Applied labels', details: selectedLabels.join(', ') })
      showSnack('Labels applied!', 'success')
      setLoading(false)
      return true
    } catch (e: any) { showSnack(e.message, 'error'); setLoading(false); return false }
  }

  const postAndLabel = async () => {
    const posted = await postComment()
    if (posted) await applyLabels()
  }

  const { triage } = issue

  return (
    <Box sx={{ bgcolor: 'rgba(0,0,0,0.15)', borderTop: '1px solid rgba(255,255,255,0.04)', overflow: 'hidden' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 3, pt: 1.5 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ '& .MuiTab-root': { textTransform: 'none', fontSize: 13, fontWeight: 600, minHeight: 40 } }}>
          <Tab label="🤖 Triage" />
          <Tab label="🌐 Issue" />
        </Tabs>
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Open on GitHub">
          <IconButton size="small" href={issue.url} target="_blank" sx={{ color: 'grey.400' }}>
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      {tab === 0 && (
        <Box sx={{ display: 'flex', gap: 3, p: 3, flexWrap: 'wrap', overflow: 'hidden', width: '100%', boxSizing: 'border-box' }}>
          {/* Left: Summary & Checklist */}
          <Box sx={{ flex: '1 1 280px', minWidth: 0, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Avatar src={issue.authorAvatar} sx={{ width: 28, height: 28 }} />
              <Typography fontSize={13} fontWeight={600}>{issue.author}</Typography>
              <Typography fontSize={12} color="text.secondary">
                {new Date(issue.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Typography>
              <TypeBadge type={triage.type} />
              <PriorityBadge priority={triage.priority} />
            </Box>

            <Typography fontSize={13} color="text.secondary" mb={2}>{triage.summary}</Typography>

            <Typography fontSize={12} fontWeight={700} color="grey.400" mb={0.5} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Classification</Typography>
            <Typography fontSize={13} mb={2}>{triage.classification}</Typography>

            <Typography fontSize={12} fontWeight={700} color="grey.400" mb={0.5} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Completeness</Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
              {Object.entries(triage.checklist).map(([key, val]) => (
                <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {val ? <CheckCircleIcon sx={{ fontSize: 14, color: '#22c55e' }} /> : <CancelIcon sx={{ fontSize: 14, color: '#ef4444' }} />}
                  <Typography fontSize={12}>{key.replace(/^has/, '').replace(/([A-Z])/g, ' $1').trim()}</Typography>
                </Box>
              ))}
            </Box>

            <Typography fontSize={12} fontWeight={700} color="grey.400" mb={0.5} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Suggested Action</Typography>
            <Chip label={triage.suggestedAction} color="primary" size="small" sx={{ fontWeight: 600, mb: 2 }} />

            {triage.investigation?.status === 'done' && (
              <Paper sx={{ p: 2, mb: 2, bgcolor: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 2 }}>
                <Typography fontSize={12} fontWeight={700} color="#22c55e" mb={0.5}>🔬 Investigation Complete</Typography>
                {triage.investigation.conclusion && (
                  <Typography fontSize={12} color="text.secondary" mb={0.5}>{triage.investigation.conclusion}</Typography>
                )}
                {triage.investigation.suggestedFix && (
                  <Typography fontSize={11} fontFamily="monospace" color="grey.400" sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}>{triage.investigation.suggestedFix}</Typography>
                )}
              </Paper>
            )}

            <Divider sx={{ my: 1.5, borderColor: 'rgba(255,255,255,0.06)' }} />

            <Typography fontSize={12} fontWeight={700} color="grey.400" mb={0.5} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Current Labels</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1.5 }}>
              {issue.labels.length > 0 ? issue.labels.map(l => (
                <Chip key={l} label={l} size="small" variant="outlined" sx={{ fontSize: 11 }} />
              )) : (
                <Typography fontSize={12} color="text.secondary">None</Typography>
              )}
            </Box>

            <Typography fontSize={12} fontWeight={700} color="grey.400" mb={0.5} sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Suggested Labels to Add</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {triage.suggestedLabels.filter(l => !issue.labels.includes(l)).length > 0 ? (
                triage.suggestedLabels.filter(l => !issue.labels.includes(l)).map(l => (
                  <FormControlLabel
                    key={l}
                    control={<Checkbox size="small" checked={selectedLabels.includes(l)} onChange={(_, checked) => setSelectedLabels(prev => checked ? [...prev, l] : prev.filter(x => x !== l))} />}
                    label={<Chip label={l} size="small" sx={{ fontSize: 11, bgcolor: 'rgba(108,99,255,0.15)', border: '1px solid rgba(108,99,255,0.3)' }} />}
                    sx={{ mr: 0.5 }}
                  />
                ))
              ) : (
                <Typography fontSize={12} color="text.secondary">All suggested labels already applied ✅</Typography>
              )}
            </Box>
          </Box>

          {/* Right: Comment editor & actions */}
          <Box sx={{ flex: '1 1 350px', minWidth: 0, overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography fontSize={12} fontWeight={700} color="grey.400" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>Comment</Typography>
              <ToggleButtonGroup size="small" value={previewMode} exclusive onChange={(_, v) => v && setPreviewMode(v)}>
                <ToggleButton value="edit" sx={{ px: 1.5, py: 0.25, fontSize: 12 }}>Edit</ToggleButton>
                <ToggleButton value="preview" sx={{ px: 1.5, py: 0.25, fontSize: 12 }}>Preview</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            {previewMode === 'edit' ? (
              <TextField
                multiline
                minRows={5}
                maxRows={12}
                fullWidth
                value={comment}
                onChange={e => setComment(e.target.value)}
                sx={{ mb: 1.5, '& .MuiInputBase-root': { fontFamily: 'monospace', fontSize: 12, bgcolor: 'rgba(0,0,0,0.2)' } }}
              />
            ) : (
              <Box sx={{ minHeight: 120, p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, mb: 1.5, '& p': { lineHeight: 1.6, fontSize: 13 }, '& pre': { bgcolor: 'rgba(0,0,0,0.3)', p: 2, borderRadius: 2, overflow: 'auto' }, '& code': { fontSize: 12 } }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{comment}</ReactMarkdown>
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button size="small" variant="contained" startIcon={<SendIcon />} onClick={postComment} disabled={loading}>Post Comment</Button>
              <Button size="small" variant="outlined" startIcon={<LabelIcon />} onClick={applyLabels} disabled={loading}>Apply Labels</Button>
              <Button size="small" variant="contained" color="secondary" onClick={postAndLabel} disabled={loading}>Post & Label</Button>
            </Box>
          </Box>
        </Box>
      )}

      {tab === 1 && (
        <Box sx={{ p: 3, maxHeight: 600, overflow: 'auto', width: '100%', boxSizing: 'border-box' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Avatar src={issue.authorAvatar} sx={{ width: 32, height: 32 }} />
            <Typography fontWeight={600} fontSize={14}>{issue.author}</Typography>
            <Typography color="text.secondary" fontSize={13}>
              opened on {new Date(issue.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Button size="small" variant="outlined" startIcon={<OpenInNewIcon />} href={issue.url} target="_blank" sx={{ textTransform: 'none', fontSize: 12 }}>
              View on GitHub
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
            {issue.labels.map(l => <Chip key={l} label={l} size="small" variant="outlined" sx={{ fontSize: 11 }} />)}
          </Box>
          <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.06)' }} />
          <Box sx={{ '& img': { maxWidth: '100%' }, '& pre': { bgcolor: 'rgba(0,0,0,0.3)', p: 2, borderRadius: 2, overflow: 'auto' }, '& code': { fontSize: 13 }, '& p': { lineHeight: 1.7 }, '& h1,& h2,& h3': { mt: 2, mb: 1 } }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{issue.body}</ReactMarkdown>
          </Box>
        </Box>
      )}

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snack.severity} variant="filled" sx={{ minWidth: 300 }}>{snack.msg}</Alert>
      </Snackbar>
    </Box>
  )
}

export default function IssuesQueue() {
  const [issues, setIssues] = useState<TriageIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'active' | 'archived'>('active')

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data/triage-results.json?v=' + Date.now())
      .then(r => r.json())
      .then((data: TriageIssue[] | { issues: TriageIssue[] }) => {
        const list = Array.isArray(data) ? data : data.issues ?? []
        setIssues(list.filter(i => i.triage))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredIssues = issues.filter(i => view === 'archived' ? i.status === 'archived' : i.status !== 'archived')
  const archivedCount = issues.filter(i => i.status === 'archived').length
  const activeCount = issues.filter(i => i.status !== 'archived').length

  const rows = filteredIssues.map(i => ({
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

  const getDetailPanelContent = useCallback(
    ({ row }: any) => {
      const issue = issues.find(i => i.number === row.number)
      if (!issue) return null
      return <DetailPanel issue={issue} />
    },
    [issues]
  )

  const getDetailPanelHeight = useCallback(() => 'auto' as const, [])

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
        <Typography variant="h4" fontWeight={700}>Issues Queue</Typography>
        <Box sx={{ flex: 1 }} />
        <Chip icon={<ScheduleIcon sx={{ fontSize: 14 }} />} label={`Next scan: ${getNextTriageRunTime()}`} size="small" variant="outlined" sx={{ fontSize: 12, borderColor: 'rgba(255,255,255,0.1)' }} />
      </Box>
      <Typography color="text.secondary" mb={2}>Triaged issues from mui/mui-x ready for review</Typography>
      <Tabs value={view} onChange={(_, v) => setView(v)} sx={{ mb: 2, '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, fontSize: 13, minHeight: 36 } }}>
        <Tab label={`Active (${activeCount})`} value="active" />
        <Tab label={`Archived (${archivedCount})`} value="archived" />
      </Tabs>
      <Box sx={{ bgcolor: 'background.paper', borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden', height: 'calc(100vh - 220px)', minHeight: 400 }}>
        <DataGridPro
          rows={rows}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          getDetailPanelContent={getDetailPanelContent}
          getDetailPanelHeight={getDetailPanelHeight}
          sx={{
            border: 'none',
            '& .MuiDataGrid-row': { cursor: 'pointer', '&:hover': { bgcolor: 'rgba(108,99,255,0.04)' } },
            '& .MuiDataGrid-columnHeaders': { bgcolor: 'rgba(255,255,255,0.02)' },
            '& .MuiDataGrid-cell': { borderColor: 'rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center' },
            '& .MuiDataGrid-detailPanel': { bgcolor: 'transparent' },
          }}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
        />
      </Box>
    </Box>
  )
}
