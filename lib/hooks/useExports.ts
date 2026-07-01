'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getExportHistory,
  addExportHistory,
  clearExportHistory,
  type ExportHistoryItem,
  type ExportType,
} from '@/lib/api/exports'

export function useExportHistory() {
  const [history, setHistory] = useState<ExportHistoryItem[]>([])

  useEffect(() => {
    setHistory(getExportHistory())
  }, [])

  const add = useCallback((item: Omit<ExportHistoryItem, 'id' | 'generatedAt'>) => {
    addExportHistory(item)
    setHistory(getExportHistory())
  }, [])

  const clear = useCallback(() => {
    clearExportHistory()
    setHistory([])
  }, [])

  return { history, add, clear }
}

export type { ExportHistoryItem, ExportType }
