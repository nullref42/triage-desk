import { describe, it, expect } from 'vitest'
import { fetchIssues, fetchIssue, updateIssueStatus, postActivity, fetchActivity } from '../api/triageApi'

describe('triageApi', () => {
  describe('fetchIssues', () => {
    it('fetches issues from API', async () => {
      const issues = await fetchIssues()
      expect(issues).toHaveLength(1)
      expect(issues[0].number).toBe(1234)
    })

    it('returns issues with triage data', async () => {
      const issues = await fetchIssues()
      expect(issues[0].triage.type).toBe('Bug')
      expect(issues[0].triage.component).toBe('DataGrid')
    })

    it('normalizes flat snake_case API response into nested triage object', async () => {
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
    it('sends PATCH to API', async () => {
      await expect(updateIssueStatus(1234, 'done')).resolves.toBeUndefined()
    })
  })

  describe('activity', () => {
    it('postActivity sends to API', async () => {
      await expect(postActivity({
        issueNumber: 1234,
        issueTitle: 'Test',
        action: 'Posted comment',
      })).resolves.toBeUndefined()
    })

    it('fetchActivity returns from API', async () => {
      const entries = await fetchActivity()
      expect(Array.isArray(entries)).toBe(true)
    })
  })
})
