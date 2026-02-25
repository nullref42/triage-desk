import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, Button, List, ListItem, ListItemText, Chip, Divider,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import { fetchActivity } from '../utils/activity'
import type { ActivityEntry } from '../types'

export default function ActivityLog() {
  const [entries, setEntries] = useState<ActivityEntry[]>([])

  useEffect(() => {
    fetchActivity().then(d => setEntries(Array.isArray(d) ? d : []))
  }, [])

  const handleClear = () => { setEntries([]) }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} mb={0.5}>Activity Log</Typography>
          <Typography color="text.secondary">Actions you've taken on triaged issues</Typography>
        </Box>
        <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleClear} disabled={!entries.length}>
          Clear Log
        </Button>
      </Box>
      <Paper sx={{ bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.06)' }}>
        {entries.length === 0 ? (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">No activity yet. Start triaging issues!</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {entries.map((e, i) => (
              <Box key={e.id}>
                {i > 0 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.04)' }} />}
                <ListItem sx={{ py: 2 }}>
                  <ListItemText
                    primary={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={e.action} size="small" color="primary" sx={{ fontWeight: 600, fontSize: 12 }} />
                      <Typography fontSize={14}>#{e.issueNumber} — {e.issueTitle}</Typography>
                    </Box>}
                    secondary={<>
                      {e.details && <Typography fontSize={12} color="text.secondary">{e.details}</Typography>}
                      <Typography fontSize={11} color="text.secondary">{new Date(e.timestamp).toLocaleString()}</Typography>
                    </>}
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  )
}
