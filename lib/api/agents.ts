import { api } from './client'

// Backend snake_case shape
interface KPIBackend {
  activities_this_week: number
  activities_week_delta: string
  activities_week_delta_positive: boolean
  total_spend_mtd: string
  spend_sub_label: string
  contacts_engaged: number
  contacts_sub_label: string
  follow_ups_pending: number
  follow_ups_overdue: number
  week_streak: {
    days: string[]
    active: boolean[]
    is_today: boolean[]
    label: string
  }
  streak_stats: {
    avg_cost_per_activity: string
    most_active_type: string
    longest_streak: string
  }
}

// Frontend camelCase shape matching agent-kpis.json
export interface AgentKPIs {
  activitiesThisWeek: number
  activitiesWeekDelta: string
  activitiesWeekDeltaPositive: boolean
  totalSpendMTD: string
  spendSubLabel: string
  contactsEngaged: number
  contactsSubLabel: string
  followUpsPending: number
  followUpsOverdue: number
  weekStreak: {
    days: string[]
    active: boolean[]
    isToday: boolean[]
    label: string
  }
  streakStats: {
    avgCostPerActivity: string
    mostActiveType: string
    longestStreak: string
  }
}

export async function getMyKpis(): Promise<AgentKPIs> {
  const d = await api.get<KPIBackend>('/agents/me/kpis')
  return {
    activitiesThisWeek: d.activities_this_week,
    activitiesWeekDelta: d.activities_week_delta,
    activitiesWeekDeltaPositive: d.activities_week_delta_positive,
    totalSpendMTD: d.total_spend_mtd,
    spendSubLabel: d.spend_sub_label,
    contactsEngaged: d.contacts_engaged,
    contactsSubLabel: d.contacts_sub_label,
    followUpsPending: d.follow_ups_pending,
    followUpsOverdue: d.follow_ups_overdue,
    weekStreak: {
      days: d.week_streak.days,
      active: d.week_streak.active,
      isToday: d.week_streak.is_today,
      label: d.week_streak.label,
    },
    streakStats: {
      avgCostPerActivity: d.streak_stats.avg_cost_per_activity,
      mostActiveType: d.streak_stats.most_active_type,
      longestStreak: d.streak_stats.longest_streak,
    },
  }
}

export interface AgentProfile {
  id: string
  name: string
  initials: string
  role: string
  agency_id: string | null
  territory: string | null
  title: string | null
  monthly_budget: number
  rep_tier: string | null
  team_id: string | null
}

export async function getMyProfile(): Promise<AgentProfile> {
  return api.get<AgentProfile>('/agents/me/profile')
}
