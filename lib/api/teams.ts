import { api } from './client'

export interface TeamInfo {
  id: string
  name: string
}

export interface TeamAgentEntry {
  id: string
  name: string
  initials: string
  territory: string | null
  repTier: string | null
  activitiesMtd: number
  spendMtd: number
  lastActivity: string | null
  status: string
  avgScore: number
}

export interface TeamRoster {
  team: TeamInfo | null
  agents: TeamAgentEntry[]
  totalAgents: number
}

interface TeamRosterBackend {
  team: { id: string; name: string } | null
  agents: Array<{
    id: string
    name: string
    initials: string
    territory: string | null
    rep_tier: string | null
    activities_mtd: number
    spend_mtd: number
    last_activity: string | null
    status: string
    avg_score: number
  }>
  total_agents: number
}

export async function getMyTeam(): Promise<TeamRoster> {
  const d = await api.get<TeamRosterBackend>('/teams/my-team')
  return {
    team: d.team,
    agents: d.agents.map(a => ({
      id: a.id,
      name: a.name,
      initials: a.initials,
      territory: a.territory,
      repTier: a.rep_tier,
      activitiesMtd: a.activities_mtd,
      spendMtd: a.spend_mtd,
      lastActivity: a.last_activity,
      status: a.status,
      avgScore: a.avg_score,
    })),
    totalAgents: d.total_agents,
  }
}
