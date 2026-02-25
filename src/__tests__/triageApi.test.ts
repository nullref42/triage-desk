import { describe, it, expect, beforeEach } from 'vitest'
import { fetchIssues, fetchIssue, updateIssueStatus, postActivity, fetchActivity, clearLocalActivity } from '../api/triageApi'

describe('triageApi', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('fetchIssues', () => {
    it('fetches issues from API when configured', async () => {
      const issues = await fetchIssues()
      expect(issues).toHaveLength(1)
      expect(issues[0].number).toBe(1234)
    })

    it('returns issues with triage data', async () => {
      const issues = await fetchIssues()
      expect(issues[0].triage.type).toBe('Bug')
      expect(issues[0].triage.component).toBe('DataGrid')
    })

    it('normalizes flat snake_case API response into nested triage object (regression #1)', async () => {
      // The real API returns flat rows from a D1 JOIN — no nested `triage` object.
      // This crashed the frontend with: "can't access property 'type', triage is undefined"
      const issues = await fetchIssues()
      const issue = issues[0]
      expect(issue.triage).toBeDefined()
      expect(issue.triage.type).toBe('Bug')
      expect(issue.triage.priority).toBe('High')
      expect(issue.triage.completeness).toBe(80)
      expect(issue.triage.suggestedAction).toBe('Triage & Label')
      expect(issue.triage.suggestedComment).toBe('Thank you for the report.')
      expect(issue.triage.suggestedLabels).toEqual(['bug', 'component: data grid', 'priority: high'])
      expect(issue.triage.checklist).toEqual({
        hasReproSteps: true, hasVersion: true, hasExpectedBehavior: true,
        hasEnvironment: false, hasScreenshot: false,
      })
      expect(issue.authorAvatar).toBe('https://avatars.githubusercontent.com/u/1?v=4')
      expect(issue.createdAt).toBe('2025-01-15T10:00:00Z')
      expect(issue.labels).toEqual(['bug', 'component: data grid'])
    })
  })

  describe('fetchIssue', () => {
    it('fetches a single issue by number', async () => {
      const issue = await fetchIssue(1234)
      expect(issue).not.toBeNull()
      expect(issue!.title).toBe('Test issue: DataGrid crash')
    })

    it('normalizes single issue from flat API format', async () => {
      const issue = await fetchIssue(1234)
      expect(issue).not.toBeNull()
      expect(issue!.triage).toBeDefined()
      expect(issue!.triage.type).toBe('Bug')
    })

    it('returns null for non-existent issue', async () => {
      const issue = await fetchIssue(9999)
      expect(issue).toBeNull()
    })
  })

  describe('updateIssueStatus', () => {
    it('writes status to localStorage', async () => {
      await updateIssueStatus(1234, 'done')
      const statuses = JSON.parse(localStorage.getItem('triage-desk-statuses') || '{}')
      expect(statuses[1234]).toBe('done')
    })

    it('sends PATCH to API', async () => {
      await updateIssueStatus(1234, 'archived')
      const statuses = JSON.parse(localStorage.getItem('triage-desk-statuses') || '{}')
      expect(statuses[1234]).toBe('archived')
    })
  })

  describe('activity', () => {
    it('postActivity writes to localStorage', async () => {
      await postActivity({
        issueNumber: 1234,
        issueTitle: 'Test',
        action: 'Posted comment',
      })
      const stored = JSON.parse(localStorage.getItem('triage-desk-activity') || '[]')
      expect(stored).toHaveLength(1)
      expect(stored[0].action).toBe('Posted comment')
    })

    it('fetchActivity returns from API when configured', async () => {
      const entries = await fetchActivity()
      expect(Array.isArray(entries)).toBe(true)
    })

    it('clearLocalActivity clears localStorage', async () => {
      await postActivity({ issueNumber: 1, issueTitle: 'x', action: 'test' })
      clearLocalActivity()
      const stored = JSON.parse(localStorage.getItem('triage-desk-activity') || '[]')
      expect(stored).toHaveLength(0)
    })
  })
})
