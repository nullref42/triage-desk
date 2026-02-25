import { describe, it, expect, beforeEach } from 'vitest'
import { fetchIssues, fetchIssue, updateIssueStatus, postActivity, fetchActivity, clearLocalActivity } from '../api/triageApi'

describe('triageApi', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('fetchIssues', () => {
    it('fetches issues from API when configured', async () => {
      const issues = await fetchIssues()
      expect(issues).toHaveLength(2)
      expect(issues[0].number).toBe(1234)
      expect(issues[1].number).toBe(5678)
    })

    it('returns issues with triage data', async () => {
      const issues = await fetchIssues()
      expect(issues[0].triage.type).toBe('Bug')
      expect(issues[0].triage.component).toBe('DataGrid')
    })
  })

  describe('fetchIssue', () => {
    it('fetches a single issue by number', async () => {
      const issue = await fetchIssue(1234)
      expect(issue).not.toBeNull()
      expect(issue!.title).toBe('Test issue: DataGrid crash')
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
      expect(entries).toHaveLength(1)
      expect(entries[0].issueNumber).toBe(1234)
    })

    it('clearLocalActivity clears localStorage', async () => {
      await postActivity({ issueNumber: 1, issueTitle: 'x', action: 'test' })
      clearLocalActivity()
      const stored = JSON.parse(localStorage.getItem('triage-desk-activity') || '[]')
      expect(stored).toHaveLength(0)
    })
  })
})
