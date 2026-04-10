import { api, setToken, clearToken } from './client'

export interface AuthUser {
  id: string
  email: string
  name: string
  initials: string
  role: string
  status: string
  agency_id: string | null
  territory: string | null
  title: string | null
  monthly_budget: number | null
  team_id: string | null
  also_rep: boolean
}

export interface LoginResponse {
  access_token: string
  token_type: string
  user: {
    id: string
    email: string
    name: string
    initials: string
    role: string
  }
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/login', { email, password })
  setToken(res.access_token)
  return res
}

export async function signup(payload: {
  email: string
  password: string
  name: string
  account_type: 'individual' | 'manager'
  also_rep?: boolean
}): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/auth/signup', payload)
  setToken(res.access_token)
  return res
}

export async function logout(): Promise<void> {
  try {
    await api.post('/auth/logout', {})
  } catch {}
  clearToken()
}

export async function getMe(): Promise<AuthUser> {
  return api.get<AuthUser>('/auth/me')
}
