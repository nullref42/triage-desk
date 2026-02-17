import { Octokit } from '@octokit/rest'

export function getToken(): string | null {
  return localStorage.getItem('triage-desk-token')
}

export function setToken(token: string) {
  localStorage.setItem('triage-desk-token', token)
}

export function clearToken() {
  localStorage.removeItem('triage-desk-token')
}

export function getOctokit(): Octokit | null {
  const token = getToken()
  if (!token) return null
  return new Octokit({ auth: token })
}
