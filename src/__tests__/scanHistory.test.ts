import { describe, it, expect } from 'vitest'
import { fetchScanHistory, fetchInvestigations } from '../api/triageApi'

describe('Scan History API', () => {
  describe('fetchScanHistory', () => {
    it('returns scan runs from API', async () => {
      const result = await fetchScanHistory()
      expect(result.total).toBe(2)
      expect(result.runs).toHaveLength(2)
      expect(result.runs[0].id).toBe(1)
      expect(result.runs[0].status).toBe('completed')
      expect(result.runs[0].issues_found).toBe(15)
    })

    it('respects limit parameter', async () => {
      const result = await fetchScanHistory(1, 0)
      expect(result.runs).toHaveLength(1)
      expect(result.total).toBe(2)
    })

    it('respects offset parameter', async () => {
      const result = await fetchScanHistory(20, 1)
      expect(result.runs).toHaveLength(1)
      expect(result.runs[0].id).toBe(2)
    })
  })

  describe('fetchInvestigations', () => {
    it('returns investigations from API', async () => {
      const result = await fetchInvestigations()
      expect(result.total).toBe(1)
      expect(result.investigations).toHaveLength(1)
      expect(result.investigations[0].number).toBe(1234)
      expect(result.investigations[0].component).toBe('DataGrid')
    })

    it('returns investigation JSON string', async () => {
      const result = await fetchInvestigations()
      const inv = JSON.parse(result.investigations[0].investigation)
      expect(inv.status).toBe('done')
      expect(inv.approach).toBe('Reproduced locally')
      expect(inv.suggestedFix).toBe('Add null check in comparator')
    })
  })
})
