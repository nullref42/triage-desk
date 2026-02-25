import { Routes, Route } from 'react-router-dom'
import { Box } from '@mui/material'
import Sidebar from './components/Sidebar'
import IssuesQueue from './pages/IssuesQueue'
import InvestigationQueue from './pages/InvestigationQueue'
import Settings from './pages/Settings'
import ActivityLog from './pages/ActivityLog'
import ScanHistory from './pages/ScanHistory'

export default function App() {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, overflow: 'auto' }}>
        <Routes>
          <Route path="/" element={<IssuesQueue />} />
          <Route path="/investigate" element={<InvestigationQueue />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/scans" element={<ScanHistory />} />
          <Route path="/activity" element={<ActivityLog />} />
        </Routes>
      </Box>
    </Box>
  )
}
