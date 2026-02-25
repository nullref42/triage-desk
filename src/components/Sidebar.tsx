import { useLocation, useNavigate } from 'react-router-dom'
import {
  Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  Typography, Box, Divider,
} from '@mui/material'
import BugReportIcon from '@mui/icons-material/BugReport'
import SettingsIcon from '@mui/icons-material/Settings'
import HistoryIcon from '@mui/icons-material/History'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ScienceIcon from '@mui/icons-material/Science'
import TimelineIcon from '@mui/icons-material/Timeline'

const DRAWER_WIDTH = 240

const navItems = [
  { label: 'Issues Queue', path: '/', icon: <DashboardIcon /> },
  { label: 'Investigation', path: '/investigate', icon: <ScienceIcon /> },
  { label: 'Settings', path: '/settings', icon: <SettingsIcon /> },
  { label: 'Scan History', path: '/scans', icon: <TimelineIcon /> },
  { label: 'Activity Log', path: '/activity', icon: <HistoryIcon /> },
]

export default function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: '#0d1117',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        },
      }}
    >
      <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <BugReportIcon sx={{ color: '#6C63FF', fontSize: 28 }} />
        <Typography variant="h6" fontWeight={700} sx={{ background: 'linear-gradient(135deg, #6C63FF, #FF6584)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Triage Desk
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
      <List sx={{ px: 1, mt: 1 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path || (item.path === '/' && location.pathname.startsWith('/issues'))
          return (
            <ListItemButton
              key={item.path}
              onClick={() => navigate(item.path)}
              sx={{
                borderRadius: 2,
                mb: 0.5,
                bgcolor: active ? 'rgba(108,99,255,0.12)' : 'transparent',
                '&:hover': { bgcolor: 'rgba(108,99,255,0.08)' },
              }}
            >
              <ListItemIcon sx={{ color: active ? '#6C63FF' : 'grey.500', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 400 }} />
            </ListItemButton>
          )
        })}
      </List>
    </Drawer>
  )
}
