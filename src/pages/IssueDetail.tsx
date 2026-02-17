import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Typography, Paper, Chip, Avatar, Button, TextField,
  ToggleButtonGroup, ToggleButton, Checkbox, FormControlLabel,
  Divider, IconButton, Tooltip, Snackbar, Alert, Grid,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import SendIcon from '@mui/icons-material/Send'
import LabelIcon from '@mui/icons-material/Label'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { TriageIssue } from '../types'
import { TypeBadge, PriorityBadge } from '../components/Badges'
import { getOctokit } from '../utils/github'
import { addActivity } from '../utils/activity'

export default function IssueDetail() {
  const { number } = useParams<{ number: string }>()
  const navigate = useNavigate()
  const [issue, setIssue] = useState<TriageIssue | null>(null)
  const [comment, setComment] = useState('')
  const [previewMode, setPreviewMode] = useState<'edit' | 'preview'>('edit')
  const [selectedLabels, setSelectedLabels] = useState<string[]>([])
  const [snack, setSnack] = useState<{ open: boolean; msg: string; severity: 'success' | 'error' }>({ open: false, msg: '', severity: 'success' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + 'data/triage-results.json?v=' + Date.now())
      .then(r => r.json())
      .then((data: TriageIssue[]) => {
        const found = data.find(i => i.number === Number(number))
        if (found) {
          setIssue(found)
          setComment(found.triage.suggestedComment)
          setSelectedLabels(found.triage.suggestedLabels)
        }
      })
  }, [number])

  const showSnack = (msg: string, severity: 'success' | 'error') => setSnack({ open: true, msg, severity })

  const postComment = async () => {
    const octokit = getOctokit()
    if (!octokit || !issue) return showSnack('Set your GitHub token in Settings first', 'error')
    setLoading(true)
    try {
      await octokit.issues.createComment({ owner: 'mui', repo: 'mui-x', issue_number: issue.number, body: comment })
      addActivity({ issueNumber: issue.number, issueTitle: issue.title, action: 'Posted comment' })
      showSnack('Comment posted!', 'success')
    } catch (e: any) { showSnack(e.message, 'error') }
    setLoading(false)
  }

  const applyLabels = async () => {
    const octokit = getOctokit()
    if (!octokit || !issue) return showSnack('Set your GitHub token in Settings first', 'error')
    setLoading(true)
    try {
      await octokit.issues.addLabels({ owner: 'mui', repo: 'mui-x', issue_number: issue.number, labels: selectedLabels })
      addActivity({ issueNumber: issue.number, issueTitle: issue.title, action: 'Applied labels', details: selectedLabels.join(', ') })
      showSnack('Labels applied!', 'success')
    } catch (e: any) { showSnack(e.message, 'error') }
    setLoading(false)
  }

  const postAndLabel = async () => { await postComment(); await applyLabels() }

  const skip = () => {
    if (issue) addActivity({ issueNumber: issue.number, issueTitle: issue.title, action: 'Skipped' })
    navigate('/')
  }

  if (!issue) return <Typography>Loading...</Typography>

  const { triage } = issue

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/')}><ArrowBackIcon /></IconButton>
        <Typography variant="h5" fontWeight={700} sx={{ flex: 1 }}>#{issue.number}: {issue.title}</Typography>
        <TypeBadge type={triage.type} />
        <PriorityBadge priority={triage.priority} />
      </Box>

      <Grid container spacing={3}>
        {/* Left: Issue body */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ p: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Avatar src={issue.authorAvatar} sx={{ width: 32, height: 32 }} />
              <Typography fontWeight={600} fontSize={14}>{issue.author}</Typography>
              <Typography color="text.secondary" fontSize={13}>
                opened on {new Date(issue.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5, mb: 2, flexWrap: 'wrap' }}>
              {issue.labels.map(l => <Chip key={l} label={l} size="small" variant="outlined" sx={{ fontSize: 11 }} />)}
            </Box>
            <Divider sx={{ mb: 2, borderColor: 'rgba(255,255,255,0.06)' }} />
            <Box sx={{ '& img': { maxWidth: '100%' }, '& pre': { bgcolor: 'rgba(0,0,0,0.3)', p: 2, borderRadius: 2, overflow: 'auto' }, '& code': { fontSize: 13 }, '& p': { lineHeight: 1.7 } }}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{issue.body}</ReactMarkdown>
            </Box>
          </Paper>
        </Grid>

        {/* Right: AI triage */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Paper sx={{ p: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.06)', mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2} sx={{ color: '#6C63FF' }}>🤖 AI Triage Analysis</Typography>
            <Typography fontSize={14} mb={2}>{triage.summary}</Typography>
            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.06)' }} />
            <Typography fontSize={13} fontWeight={600} mb={1}>Classification</Typography>
            <Typography fontSize={13} color="text.secondary" mb={2}>{triage.classification}</Typography>
            <Typography fontSize={13} fontWeight={600} mb={1}>Issue Completeness Checklist</Typography>
            {Object.entries(triage.checklist).map(([key, val]) => (
              <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                {val ? <CheckCircleIcon sx={{ fontSize: 16, color: '#22c55e' }} /> : <CancelIcon sx={{ fontSize: 16, color: '#ef4444' }} />}
                <Typography fontSize={13}>{key.replace(/^has/, '').replace(/([A-Z])/g, ' $1').trim()}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 2, borderColor: 'rgba(255,255,255,0.06)' }} />
            <Typography fontSize={13} fontWeight={600} mb={1}>Suggested Action</Typography>
            <Chip label={triage.suggestedAction} color="primary" size="small" sx={{ fontWeight: 600 }} />
          </Paper>

          {/* Labels */}
          <Paper sx={{ p: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Typography variant="subtitle2" fontWeight={700} mb={1}>Labels</Typography>
            {triage.suggestedLabels.map(l => (
              <FormControlLabel
                key={l}
                control={<Checkbox size="small" checked={selectedLabels.includes(l)} onChange={(_, checked) => setSelectedLabels(prev => checked ? [...prev, l] : prev.filter(x => x !== l))} />}
                label={<Typography fontSize={13}>{l}</Typography>}
              />
            ))}
          </Paper>
        </Grid>

        {/* Bottom: Comment editor */}
        <Grid size={{ xs: 12 }}>
          <Paper sx={{ p: 3, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={700}>💬 Comment</Typography>
              <ToggleButtonGroup
                size="small"
                value={previewMode}
                exclusive
                onChange={(_, v) => v && setPreviewMode(v)}
              >
                <ToggleButton value="edit" sx={{ px: 2, fontSize: 13 }}>Edit</ToggleButton>
                <ToggleButton value="preview" sx={{ px: 2, fontSize: 13 }}>Preview</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            {previewMode === 'edit' ? (
              <TextField
                multiline
                minRows={6}
                maxRows={20}
                fullWidth
                value={comment}
                onChange={e => setComment(e.target.value)}
                sx={{ '& .MuiInputBase-root': { fontFamily: 'monospace', fontSize: 13 } }}
              />
            ) : (
              <Box sx={{ minHeight: 150, p: 2, bgcolor: 'rgba(0,0,0,0.2)', borderRadius: 2, '& p': { lineHeight: 1.7 }, '& pre': { bgcolor: 'rgba(0,0,0,0.3)', p: 2, borderRadius: 2, overflow: 'auto' }, '& code': { fontSize: 13 } }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{comment}</ReactMarkdown>
              </Box>
            )}
            <Box sx={{ display: 'flex', gap: 1.5, mt: 2, flexWrap: 'wrap' }}>
              <Button variant="contained" startIcon={<SendIcon />} onClick={postComment} disabled={loading}>Post Comment</Button>
              <Button variant="outlined" startIcon={<LabelIcon />} onClick={applyLabels} disabled={loading}>Apply Labels</Button>
              <Button variant="contained" color="secondary" onClick={postAndLabel} disabled={loading}>Post & Label</Button>
              <Tooltip title="Skip this issue">
                <Button variant="text" color="inherit" startIcon={<SkipNextIcon />} onClick={skip}>Skip</Button>
              </Tooltip>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.severity} variant="filled">{snack.msg}</Alert>
      </Snackbar>
    </Box>
  )
}
