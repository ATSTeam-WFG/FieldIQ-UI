import { api } from './client'

export type Period = 'mtd' | 'qtd' | 'ytd'

// ── Shared ───────────────────────────────────────────────────────────────────

export interface ActivityBreakdownItem {
  type: string
  count: number
  spend: number
}

// ── Manager Dashboard ─────────────────────────────────────────────────────────

export interface ManagerKPIs {
  totalActivities: number
  activitiesDelta: string
  totalSpend: number
  avgSpendPerAgent: number
  activeAgents: number
  totalAgents: number
  avgActivitiesPerAgent: number
  target: number
}

export interface LeaderboardEntry {
  rank: number
  name: string
  initials: string
  activities: number
  spend: number
  lastLog: string | null
  status: string
}

export interface AgentHeatmapEntry {
  name: string
  initials: string
  activities: number
  level: string
  status: string
  weeks: number[]
}

export interface AlertItem {
  agentName: string
  message: string
}

export interface ManagerDashboard {
  kpis: ManagerKPIs
  leaderboard: LeaderboardEntry[]
  breakdown: ActivityBreakdownItem[]
  agentActivity: AgentHeatmapEntry[]
  alerts: AlertItem[]
}

interface ManagerDashboardBackend {
  kpis: {
    total_activities: number
    activities_delta: string
    total_spend: number
    avg_spend_per_agent: number
    active_agents: number
    total_agents: number
    avg_activities_per_agent: number
    target: number
  }
  leaderboard: Array<{
    rank: number
    name: string
    initials: string
    activities: number
    spend: number
    last_log: string | null
    status: string
  }>
  breakdown: Array<{ type: string; count: number; spend: number }>
  agent_activity: Array<{
    name: string
    initials: string
    activities: number
    level: string
    status: string
    weeks: number[]
  }>
  alerts: Array<{ agent_name: string; message: string }>
}

export async function getManagerDashboard(period: Period = 'mtd'): Promise<ManagerDashboard> {
  const d = await api.get<ManagerDashboardBackend>(`/analytics/manager/dashboard?period=${period}`)
  return {
    kpis: {
      totalActivities: d.kpis.total_activities,
      activitiesDelta: d.kpis.activities_delta,
      totalSpend: d.kpis.total_spend,
      avgSpendPerAgent: d.kpis.avg_spend_per_agent,
      activeAgents: d.kpis.active_agents,
      totalAgents: d.kpis.total_agents,
      avgActivitiesPerAgent: d.kpis.avg_activities_per_agent,
      target: d.kpis.target,
    },
    leaderboard: d.leaderboard.map(e => ({
      rank: e.rank,
      name: e.name,
      initials: e.initials,
      activities: e.activities,
      spend: e.spend,
      lastLog: e.last_log,
      status: e.status,
    })),
    breakdown: d.breakdown,
    agentActivity: d.agent_activity.map(e => ({
      name: e.name,
      initials: e.initials,
      activities: e.activities,
      level: e.level,
      status: e.status,
      weeks: e.weeks,
    })),
    alerts: d.alerts.map(a => ({ agentName: a.agent_name, message: a.message })),
  }
}

// ── Agent Performance ─────────────────────────────────────────────────────────

export interface MonthlyTrendItem {
  month: string
  spend: number
  activities: number
}

export interface AgentPerformance {
  monthlySpend: MonthlyTrendItem[]
  activityBreakdown: ActivityBreakdownItem[]
  activitiesMtd: number
  spendMtd: number
  contactsEngaged: number
  mostActiveType: string
  avgCostPerActivity: number
}

interface AgentPerformanceBackend {
  monthly_spend: Array<{ month: string; spend: number; activities: number }>
  activity_breakdown: Array<{ type: string; count: number; spend: number }>
  activities_mtd: number
  spend_mtd: number
  contacts_engaged: number
  most_active_type: string
  avg_cost_per_activity: number
}

export async function getAgentPerformance(): Promise<AgentPerformance> {
  const d = await api.get<AgentPerformanceBackend>('/analytics/performance/agent')
  return {
    monthlySpend: d.monthly_spend,
    activityBreakdown: d.activity_breakdown,
    activitiesMtd: d.activities_mtd,
    spendMtd: d.spend_mtd,
    contactsEngaged: d.contacts_engaged,
    mostActiveType: d.most_active_type,
    avgCostPerActivity: d.avg_cost_per_activity,
  }
}

// ── Team Performance ──────────────────────────────────────────────────────────

export interface TeamWeeklyItem {
  week: string
  count: number
}

export interface AgentPerfEntry {
  name: string
  initials: string
  activities: number
  score: number
}

export interface TeamPerformance {
  teamWeekly: TeamWeeklyItem[]
  activityBreakdown: ActivityBreakdownItem[]
  agents: AgentPerfEntry[]
  totalActivitiesMtd: number
  totalSpendMtd: number
  avgScore: number
  mostActiveAgent: string
}

interface TeamPerformanceBackend {
  team_weekly: Array<{ week: string; count: number }>
  activity_breakdown: Array<{ type: string; count: number; spend: number }>
  agents: Array<{ name: string; initials: string; activities: number; score: number }>
  total_activities_mtd: number
  total_spend_mtd: number
  avg_score: number
  most_active_agent: string
}

export async function getTeamPerformance(): Promise<TeamPerformance> {
  const d = await api.get<TeamPerformanceBackend>('/analytics/performance/team')
  return {
    teamWeekly: d.team_weekly,
    activityBreakdown: d.activity_breakdown,
    agents: d.agents,
    totalActivitiesMtd: d.total_activities_mtd,
    totalSpendMtd: d.total_spend_mtd,
    avgScore: d.avg_score,
    mostActiveAgent: d.most_active_agent,
  }
}
