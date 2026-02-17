export interface TriageChecklist {
  hasReproSteps: boolean
  hasVersion: boolean
  hasExpectedBehavior: boolean
  hasEnvironment: boolean
  hasScreenshot: boolean
}

export interface Triage {
  type: 'Bug' | 'Feature' | 'Question'
  component: string
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  completeness: number
  summary: string
  classification: string
  checklist: TriageChecklist
  suggestedLabels: string[]
  suggestedAction: string
  suggestedComment: string
}

export interface TriageIssue {
  number: number
  title: string
  url: string
  author: string
  authorAvatar: string
  createdAt: string
  labels: string[]
  body: string
  triage: Triage
  status: 'pending' | 'done' | 'skipped'
}

export interface ActivityEntry {
  id: string
  timestamp: string
  issueNumber: number
  issueTitle: string
  action: string
  details?: string
}
