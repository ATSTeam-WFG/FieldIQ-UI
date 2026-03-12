'use client'

import { useEffect } from 'react'
import { toast } from '@/lib/hooks/use-toast'

interface SuccessToastProps {
  message?: string
}

/** Call this component to imperatively fire a success toast. */
export function useSuccessToast() {
  return (message = 'Activity logged successfully') => {
    toast({
      title: message,
      variant: 'default',
    })
  }
}

/**
 * Drop this component in a page to show a success toast once on mount.
 * Useful for post-form-submit redirect confirmations.
 */
export function SuccessToast({ message = 'Activity logged successfully' }: SuccessToastProps) {
  const showToast = useSuccessToast()
  useEffect(() => {
    showToast(message)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
