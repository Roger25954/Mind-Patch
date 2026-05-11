import { useState, useEffect } from 'react'
import Sidebar        from './Sidebar'
import MainArea       from './MainArea'
import MinorGameFrame from './MinorGameFrame'
import AnalysisPanel  from './AnalysisPanel'
import { ADULT_TASK_DEFS, MINOR_TASKS, API, DAILY_LIMIT } from './constants'
import { saveGameMetrics, loadAllGameMetrics, getUsageToday, incrementUsage } from './utils'
import AdultAsrs              from '../AdultAsrs'
import AdultDyslexiaChecklist from '../AdultDyslexiaChecklist'
import AdultStroop            from '../AdultStroop'
import AdultSubitizing        from '../AdultSubitizing'
import AdultLexicalDecision   from '../AdultLexicalDecision'

const adultComponents = { AdultAsrs, AdultDyslexiaChecklist, AdultStroop, AdultSubitizing, AdultLexicalDecision }
const ADULT_TASKS = ADULT_TASK_DEFS.map(t => ({ ...t, component: adultComponents[t.componentKey] }))

export function GameMenu({ onBack, user, userType = 'adult', contextData }) {
  const isAdultModule = userType === 'adult'
  const esMenor       = userType === 'adolescent' || userType === 'child'
  const tasks         = isAdultModule ? ADULT_TASKS : MINOR_TASKS
  const userId        = user?.id || null

  const [selected,       setSelected]       = useState(null)
  const [activeMinorGame, setActiveMinorGame] = useState(null)
  const [gameMetrics,    setGameMetrics]    = useState(null)
  const [savedMetrics,   setSavedMetrics]   = useState(() => loadAllGameMetrics(userId))
  const [replayKey,      setReplayKey]      = useState(0)

  const [showMap,      setShowMap]      = useState(false)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [messages,     setMessages]     = useState([])
  const [loading,      setLoading]      = useState(false)
  const [usosHoy,      setUsosHoy]      = useState(() => getUsageToday(userId))

  const limitAlcanzado = usosHoy >= DAILY_LIMIT

  useEffect(() => {
    function onMessage(event) {
      if (event.data?.type !== 'MINDPATCH_GAME_COMPLETE') return
      const { gameId, metrics } = event.data
      saveGameMetrics(gameId, metrics, userId)
      setSavedMetrics(loadAllGameMetrics(userId))
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

  function handleAdultTaskComplete(taskId, result) {
    saveGameMetrics(taskId, result, userId)
    setSavedMetrics(loadAllGameMetrics(userId))
    setSelected(null)
  }

  function buildMetricsContext(metrics) {
    const BASE = `Eres el asistente de IA de Mind Patch, una plataforma de evaluación y apoyo cognitivo. Responde siempre en español. Sé empático, claro y motivador. Adapta tus respuestas al perfil cognitivo del usuario cuando tengas datos disponibles. REGLA CRÍTICA: Si el prompt del usuario contiene instrucciones de formato JSON (por ejemplo "Responde SOLO con JSON válido"), responde ÚNICAMENTE con el JSON solicitado, sin texto adicional, sin explicaciones y sin bloques de código markdown.`

    const entries = Object.entries(metrics)
    if (!entries.length) return BASE

    const GAME_NAMES = {
      'nova-drive':     'Nova Drive (atención sostenida)',
      'juego-astrid':   'Mercadito de monstruos (habilidades numéricas)',
      'academia-magia': 'Academia de la Magia (lectura)',
      'asrs':           'ASRS v1.1 (tamizaje TDAH)',
      'dyslexia':       'Lista de Dislexia',
      'stroop':         'Tarea Stroop (control inhibitorio)',
      'subit':          'Subitización (habilidades numéricas)',
      'lexical':        'Decisión Léxica (reconocimiento de palabras)',
    }

    const lines = entries.map(([gameId, { metrics: m }]) => {
      if (!m) return null
      const parts = []
      // Minor games
      if (m.accuracy != null)         parts.push(`precisión ${Math.round(m.accuracy * 100)}%`)
      if (m.hits != null)             parts.push(`${m.hits} aciertos`)
      if (m.misses != null)           parts.push(`${m.misses} errores por omisión`)
      if (m.commissionErrors != null) parts.push(`${m.commissionErrors} errores por impulsividad`)
      if (m.avgReactionTime != null)  parts.push(`tiempo de reacción ${Math.round(m.avgReactionTime)}ms`)
      // Adult tasks
      if (m.shadedCount != null)      parts.push(`${m.shadedCount}/6 indicadores TDAH marcados`)
      if (m.count != null && m.total != null) parts.push(`${m.count}/${m.total} indicadores de dislexia`)
      if (m.acc != null && m.mean != null)    parts.push(`precisión ${m.acc}%, TR medio ${Math.round(m.mean)}ms`)
      if (m.risk != null)             parts.push(`riesgo discalculia: ${m.risk}`)
      if (!parts.length) return null
      const name = GAME_NAMES[gameId] || gameId
      return `• ${name}: ${parts.join(', ')}`
    }).filter(Boolean)

    if (!lines.length) return BASE

    return `${BASE}

Le vas a ayudar basado en el puntaje de métricas de esta persona:

PERFIL COGNITIVO DEL USUARIO (última sesión de juego):
${lines.join('\n')}

Instrucciones de personalización:
- Si el tiempo de reacción es alto (>700ms), usa explicaciones más pausadas y detalladas.
- Si hay muchos errores por impulsividad, incluye recordatorios de tomarse el tiempo para pensar.
- Si la precisión es baja (<60%), refuerza los conceptos básicos antes de avanzar.
- Si la precisión es alta (>85%), puedes ofrecer retos más avanzados.
- Menciona el perfil cognitivo si el usuario lo pregunta o si es relevante para la conversación.`
  }

  const handleSend = async ({ text, file, tool }) => {
    if (!text && !file) return
    if (limitAlcanzado) return

    setMessages(prev => [...prev, { role: 'user', content: text || '', fileName: file?.name || null }])
    setLoading(true)

    const contexto = buildMetricsContext(savedMetrics)

    try {
      let res
      if (file) {
        const form = new FormData()
        form.append('pdf', file)
        if (text) form.append('prompt', text)
        if (tool) form.append('tool', tool)
        if (contexto) form.append('contexto', contexto)
        res = await fetch(`${API}/api/ia`, { method: 'POST', body: form })
      } else {
        res = await fetch(`${API}/api/ia`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mensaje: text, tool, contexto }) })
      }

      const text_body = await res.text()
      let data
      try { data = JSON.parse(text_body) }
      catch { setMessages(prev => [...prev, { role: 'ai', content: `Error del servidor: ${text_body.slice(0, 200)}` }]); return }

      setUsosHoy(incrementUsage(userId))
      if (data.tipo === 'tarjetas' && Array.isArray(data.tarjetas)) {
        setMessages(prev => [...prev, { role: 'ai', tipo: 'tarjetas', tarjetas: data.tarjetas }])
      } else if (data.tipo === 'quiz' && Array.isArray(data.preguntas)) {
        setMessages(prev => [...prev, { role: 'ai', tipo: 'quiz', preguntas: data.preguntas }])
      } else {
        const content = data.resultado || data.respuesta || data.error || 'Sin respuesta.'
        setMessages(prev => [...prev, { role: 'ai', content }])
      }

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
        <AnalysisPanel savedMetrics={savedMetrics} isAdultModule={isAdultModule} />
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
          onTaskComplete={handleAdultTaskComplete}
          onTaskBack={() => setSelected(null)}
        />
      )}
    </div>
  )
}
