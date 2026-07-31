'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getImportHistory,
  addImportHistory,
  clearImportHistory,
  type ImportHistoryItem,
} from '@/lib/api/imports'

export function useImportHistory() {
  const [history, setHistory] = useState<ImportHistoryItem[]>([])

  useEffect(() => {
    setHistory(getImportHistory())
  }, [])

  const add = useCallback((item: Omit<ImportHistoryItem, 'id' | 'generatedAt'>) => {
    addImportHistory(item)
    setHistory(getImportHistory())
  }, [])

  const clear = useCallback(() => {
    clearImportHistory()
    setHistory([])
  }, [])

  return { history, add, clear }
}

export type { ImportHistoryItem }
