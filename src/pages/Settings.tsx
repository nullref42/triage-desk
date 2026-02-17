import { useState, useEffect } from 'react'
import {
  Box, Typography, Paper, TextField, Button, Avatar, Alert, InputAdornment, IconButton,
} from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import { getToken, setToken, clearToken, getOctokit } from '../utils/github'

export default function Settings() {
  const [pat, setPat] = useState('')
  const [showPat, setShowPat] = useState(false)
  const [user, setUser] = useState<{ login: string; avatar_url: string } | null>(null)
  const [error, setError] = useState('')
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    const t = getToken()
    if (t) setPat(t)
  }, [])

  const testToken = async () => {
    setToken(pat)
    setTesting(true)
    setError('')
    setUser(null)
    try {
      const octokit = getOctokit()!
      const { data } = await octokit.users.getAuthenticated()
      setUser(data as any)
    } catch (e: any) {
      setError(e.message)
    }
    setTesting(false)
  }

  const handleClear = () => {
    clearToken()
    setPat('')
    setUser(null)
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={0.5}>Settings</Typography>
      <Typography color="text.secondary" mb={3}>Configure your GitHub Personal Access Token</Typography>
      <Paper sx={{ p: 4, maxWidth: 600, bgcolor: 'background.paper', border: '1px solid rgba(255,255,255,0.06)' }}>
        <Typography fontWeight={600} mb={1}>GitHub PAT</Typography>
        <Typography fontSize={13} color="text.secondary" mb={2}>
          Required for posting comments and applying labels. Needs <code>repo</code> scope.
        </Typography>
        <TextField
          fullWidth
          value={pat}
          onChange={e => setPat(e.target.value)}
          type={showPat ? 'text' : 'password'}
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          sx={{ mb: 2 }}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPat(!showPat)} edge="end">
                    {showPat ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button variant="contained" onClick={testToken} disabled={!pat || testing}>
            {testing ? 'Testing...' : 'Test Token'}
          </Button>
          <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleClear} disabled={!pat}>
            Clear Token
          </Button>
        </Box>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 3, p: 2, bgcolor: 'rgba(34,197,94,0.08)', borderRadius: 2, border: '1px solid rgba(34,197,94,0.2)' }}>
            <CheckCircleIcon sx={{ color: '#22c55e' }} />
            <Avatar src={user.avatar_url} sx={{ width: 40, height: 40 }} />
            <Box>
              <Typography fontWeight={600} fontSize={14}>Connected as {user.login}</Typography>
              <Typography fontSize={12} color="text.secondary">Token is valid</Typography>
            </Box>
          </Box>
        )}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>
    </Box>
  )
}
