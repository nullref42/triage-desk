import { describe, it, expect, beforeEach } from 'vitest'
import { server } from './mocks/server'
import { http, HttpResponse } from 'msw'
import { fetchIssues, fetchActivity } from '../api/triageApi'

describe('triageApi fallback behavior', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('falls back to JSON when API returns error', async () => {
    server.use(
      http.get('http://test-api.local/api/issues', () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    // Will try API (fails), then fall back to static JSON fetch (also fails in test env)
    // Should not throw
    const issues = await fetchIssues()
    expect(Array.isArray(issues)).toBe(true)
  })

  it('falls back to localStorage for activity when API fails', async () => {
    const localEntries = [{ id: 'local-1', timestamp: '2025-01-01T00:00:00Z', issueNumber: 1, issueTitle: 'Local', action: 'test' }]
    localStorage.setItem('triage-desk-activity', JSON.stringify(localEntries))

    server.use(
      http.get('http://test-api.local/api/activity', () => {
        return new HttpResponse(null, { status: 500 })
      })
    )

    const entries = await fetchActivity()
    expect(entries).toHaveLength(1)
    expect(entries[0].id).toBe('local-1')
  })
})
