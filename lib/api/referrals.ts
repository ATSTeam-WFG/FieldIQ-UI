import { api, ApiError } from './client'

export async function validateReferralCode(
  code: string,
): Promise<{ valid: boolean; rep_name?: string }> {
  try {
    return await api.get(`/referral/${code.trim().toUpperCase()}`)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return { valid: false }
    throw err
  }
}
