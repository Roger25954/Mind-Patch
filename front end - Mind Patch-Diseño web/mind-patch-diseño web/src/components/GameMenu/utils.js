import { METRICS_STORAGE, STORAGE_KEY } from './constants'

export function saveGameMetrics(gameId, metrics) {
  try {
    const all = JSON.parse(localStorage.getItem(METRICS_STORAGE) || '{}')
    all[gameId] = { savedAt: new Date().toISOString(), metrics }
    localStorage.setItem(METRICS_STORAGE, JSON.stringify(all))
  } catch (_) {}
}

export function loadAllGameMetrics() {
  try { return JSON.parse(localStorage.getItem(METRICS_STORAGE) || '{}') }
  catch { return {} }
}

export function formatSavedAt(iso) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  } catch { return '' }
}

export function getUsageToday() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return 0
    const { date, count } = JSON.parse(raw)
    return new Date().toISOString().slice(0, 10) === date ? count : 0
  } catch { return 0 }
}

export function incrementUsage() {
  const today = new Date().toISOString().slice(0, 10)
  const count = getUsageToday() + 1
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count }))
  return count
}
