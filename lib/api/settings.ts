import { api } from './client'

export interface UserSettings {
  email_digest: boolean
  push_notifications: boolean
  follow_up_reminders: boolean
  team_alerts: boolean
  default_period: 'MTD' | 'QTD' | 'YTD'
  theme: 'light' | 'dark'
  // manager-only
  activity_target?: number
  below_target_alert?: boolean
  inactivity_alert?: boolean
  weekly_digest?: boolean
}

function endpoint(role: string): string {
  return role === 'manager' ? '/managers/me/profile' : '/agents/me/profile'
}

export async function getSettings(role: string): Promise<UserSettings> {
  return api.get<UserSettings>(endpoint(role))
}

export async function updateSettings(
  role: string,
  patch: Partial<UserSettings>
): Promise<UserSettings> {
  return api.put<UserSettings>(endpoint(role), patch)
}
