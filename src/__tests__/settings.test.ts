import { describe, it, expect, beforeEach } from 'vitest'
import { getToken, setToken, clearToken, getOctokit } from '../utils/github'

describe('Settings - PAT storage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('getToken returns null when no token stored', () => {
    expect(getToken()).toBeNull()
  })

  it('setToken stores and getToken retrieves', () => {
    setToken('ghp_test123')
    expect(getToken()).toBe('ghp_test123')
  })

  it('clearToken removes the token', () => {
    setToken('ghp_test123')
    clearToken()
    expect(getToken()).toBeNull()
  })

  it('getOctokit returns null without token', () => {
    expect(getOctokit()).toBeNull()
  })

  it('getOctokit returns Octokit instance with token', () => {
    setToken('ghp_test123')
    const octokit = getOctokit()
    expect(octokit).not.toBeNull()
  })
})
