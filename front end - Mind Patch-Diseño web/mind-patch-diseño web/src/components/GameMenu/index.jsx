import { useState, useEffect } from 'react'
import Sidebar        from './Sidebar'
import MainArea       from './MainArea'
import MinorGameFrame from './MinorGameFrame'
import AnalysisPanel  from './AnalysisPanel'
import { ADULT_TASKS, MINOR_TASKS, API, DAILY_LIMIT } from './constants'
import { saveGameMetrics, loadAllGameMetrics, getUsageToday, incrementUsage } from './utils'

export function GameMenu({ onBack, user, userType = 'adult', contextData }) {
  const isAdultModule = userType === 'adult'
  const esMenor       = userType === 'adolescent' || userType === 'child'
  const tasks         = isAdultModule ? ADULT_TASKS : MINOR_TASKS

  const [selected,       setSelected]       = useState(null)
  const [activeMinorGame, setActiveMinorGame] = useState(null)
  const [gameMetrics,    setGameMetrics]    = useState(null)
  const [savedMetrics,   setSavedMetrics]   = useState(loadAllGameMetrics)
  const [replayKey,      setReplayKey]      = useState(0)

  const [showMap,      setShowMap]      = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [messages,     setMessages]     = useState([])
  const [loading,      setLoading]      = useState(false)
  const [usosHoy,      setUsosHoy]      = useState(getUsageToday)

  const limitAlcanzado = usosHoy >= DAILY_LIMIT

  useEffect(() => {
    function onMessage(event) {
      if (event.data?.type !== 'MINDPATCH_GAME_COMPLETE') return
      const { gameId, metrics } = event.data
      saveGameMetrics(gameId, metrics)
      setSavedMetrics(loadAllGameMetrics())
      setGameMetrics({ gameId, metrics })
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  function handleSelect(task) {
    if (!task) {
      setSelected(null)
      setActiveMinorGame(null)
      setGameMetrics(null)
      return
    }
    setShowAnalysis(false)
    if (task.href) {
      setActiveMinorGame(task)
      setGameMetrics(null)
      setSelected(null)
      setShowMap(false)
      return
    }
    setSelected(task)
    setActiveMinorGame(null)
    setGameMetrics(null)
    setShowMap(false)
  }

  function handleReplay() {
    setGameMetrics(null)
    setReplayKey(k => k + 1)
  }

  const handleSend = async ({ text, file, tool }) => {
    if (!text && !file) return
    if (limitAlcanzado) return

    setMessages(prev => [...prev, { role: 'user', content: text || '', fileName: file?.name || null }])
    setLoading(true)

    try {
      let res
      if (file) {
        const form = new FormData()
        form.append('pdf', file)
        if (text) form.append('prompt', text)
        if (tool) form.append('tool', tool)
        res = await fetch(`${API}/api/ia`, { method: 'POST', body: form })
      } else {
        res = await fetch(`${API}/api/ia`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mensaje: text, tool }) })
      }

      const text_body = await res.text()
      let data
      try { data = JSON.parse(text_body) }
      catch { setMessages(prev => [...prev, { role: 'ai', content: `Error del servidor: ${text_body.slice(0, 200)}` }]); return }

      setUsosHoy(incrementUsage())
      const content = data.resultado || data.respuesta || data.error || 'Sin respuesta.'
      setMessages(prev => [...prev, { role: 'ai', content }])

    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', content: err.message?.includes('fetch') ? 'No se pudo conectar con el servidor.' : `Error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  const activeId = selected?.id || activeMinorGame?.id

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#DADBC6' }}>
      <Sidebar
        tasks={tasks}
        activeId={activeId}
        onSelect={handleSelect}
        onBack={onBack}
        showMap={showMap}
        onToggleMap={() => { setShowMap(m => !m); setSelected(null); setShowAnalysis(false) }}
        showAnalysis={showAnalysis}
        onToggleAnalysis={() => { setShowAnalysis(a => !a); setShowMap(false); setActiveMinorGame(null); setGameMetrics(null); setSelected(null) }}
        userType={userType}
        esMenor={esMenor}
        moduleLabel={isAdultModule ? 'Tareas cognitivas' : 'Juegos'}
        savedMetrics={savedMetrics}
      />

      {showAnalysis ? (
        <AnalysisPanel savedMetrics={savedMetrics} />
      ) : activeMinorGame ? (
        <MinorGameFrame
          key={`${activeMinorGame.id}-${replayKey}`}
          game={activeMinorGame}
          gameMetrics={gameMetrics}
          savedSession={savedMetrics[activeMinorGame.id] ?? null}
          onBack={() => { setActiveMinorGame(null); setGameMetrics(null); setSelected(null) }}
          onReplay={handleReplay}
        />
      ) : (
        <MainArea
          selected={selected}
          messages={messages}
          loading={loading}
          onSend={handleSend}
          showMap={showMap}
          usosHoy={usosHoy}
          limitAlcanzado={limitAlcanzado}
          isAdultModule={isAdultModule}
        />
      )}
    </div>
  )
}
