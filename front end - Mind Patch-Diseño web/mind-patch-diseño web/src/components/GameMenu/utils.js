import { STORAGE_KEY } from './constants'

function metricsKey(userId) {
  return `mp_game_metrics_${userId || 'guest'}`
}

export function saveGameMetrics(gameId, metrics, userId) {
  try {
    const key = metricsKey(userId)
    const all = JSON.parse(localStorage.getItem(key) || '{}')
    all[gameId] = { savedAt: new Date().toISOString(), metrics }
    localStorage.setItem(key, JSON.stringify(all))
  } catch (_) {}
}

export function loadAllGameMetrics(userId) {
  try { return JSON.parse(localStorage.getItem(metricsKey(userId)) || '{}') }
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
