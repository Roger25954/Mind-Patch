// components/GameMenu.jsx
// Menú principal post-onboarding.
// Recibe userType ('adult' | 'adolescent' | 'child') y muestra
// las tareas cognitivas correspondientes en el sidebar y en el área principal.

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PromptBox }        from './PromptBox'
import { PsychologistsMap } from './PsychologistsMap'

// Tareas cognitivas adulto (módulos individuales; default exports)
import AdultAsrs from './AdultAsrs'
import AdultDyslexiaChecklist from './AdultDyslexiaChecklist'
import AdultStroop from './AdultStroop'
import AdultSubitizing from './AdultSubitizing'
import AdultLexicalDecision from './AdultLexicalDecision'

const API         = 'http://localhost:3000'
const DAILY_LIMIT = 5
const STORAGE_KEY = 'mp_ia_uses'

function getUsageToday() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return 0
    const { date, count } = JSON.parse(raw)
    return new Date().toISOString().slice(0, 10) === date ? count : 0
  } catch { return 0 }
}
function incrementUsage() {
  const today = new Date().toISOString().slice(0, 10)
  const count = getUsageToday() + 1
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count }))
  return count
}

/**
 * Abre un juego externo: URL completa (http...) o ruta relativa al origen actual
 * (p. ej. "/nova-drive/" → window.location.origin + "/nova-drive/").
 */
function resolveMinorGameHref(href) {
  const h = String(href ?? '').trim()
  if (!h) return ''
  if (/^https?:\/\//i.test(h)) return h
  const path = h.startsWith('/') ? h : `/${h}`
  if (typeof window === 'undefined') return path
  return `${window.location.origin}${path}`
}

/**
 * Sale del sitio hacia el juego. Si la app va dentro de un iframe (p. ej. preview del IDE),
 * window.location a veces no cambia la pestaña completa; probamos top y luego nueva pestaña.
 */
function navigateToMinorGame(url) {
  if (!url || typeof window === 'undefined') return
  try {
    const target = window.top ?? window
    target.location.assign(url)
  } catch {
    try {
      window.location.assign(url)
    } catch {
      const opened = window.open(url, '_blank', 'noopener,noreferrer')
      if (!opened) window.location.href = url
    }
  }
}

/** URL final del juego (por si `task.href` falla tras HMR o caché). */
function getMinorTaskUrl(task) {
  if (!task?.href) {
    const byId = {
      'juego-astrid': import.meta.env.VITE_MINOR_GAME_ASTRID_URL || 'http://localhost:5174',
      // Academia solo expone juego.html en la raíz del proyecto
      'academia-magia': import.meta.env.VITE_MINOR_GAME_ACADEMIA_URL || 'http://localhost:5175/juego.html',
      'nova-drive': import.meta.env.VITE_MINOR_GAME_NOVA_URL || 'http://localhost:5176',
    }
    const raw = byId[task?.id]
    if (!raw) return ''
    return resolveMinorGameHref(raw)
  }
  return resolveMinorGameHref(task.href)
}

// ── Catálogos de tareas por perfil ───────────────────────────────────────────
const ADULT_TASKS = [
  { id: 'asrs',     name: 'Cuestionario ASRS', duration: '5 min', difficulty: 'Fácil',   color: '#10b981', component: AdultAsrs },
  { id: 'dyslexia', name: 'Lista de Dislexia',  duration: '4 min', difficulty: 'Fácil',   color: '#3b82f6', component: AdultDyslexiaChecklist },
  { id: 'stroop',   name: 'Tarea Stroop',       duration: '3 min', difficulty: 'Media',   color: '#f59e0b', component: AdultStroop },
  { id: 'subit',    name: 'Subitización',       duration: '5 min', difficulty: 'Media',   color: '#BE7D57', component: AdultSubitizing },
  { id: 'lexical',  name: 'Decisión Léxica',    duration: '4 min', difficulty: 'Difícil', color: '#ef4444', component: AdultLexicalDecision },
]

// Juegos en proyectos aparte: al elegirlos se navega con window.location (mismo origen o URL absoluta).
// Motor: Astrid y Academia = Phaser · Nova Drive = Three.js (da igual para esta shell: solo importa la URL del dev server).
// Ajusta VITE_* en .env al puerto/ruta que imprima cada `npm run dev`.
const MINOR_TASKS = [
  {
    id: 'juego-astrid',
    name: 'Juego Astrid',
    duration: 'Juego',
    difficulty: 'Menores',
    color: '#BE7D57',
    href: import.meta.env.VITE_MINOR_GAME_ASTRID_URL || 'http://localhost:5174',
  },
  {
    id: 'academia-magia',
    name: 'Academia de la Magia',
    duration: 'Juego',
    difficulty: 'Menores',
    color: '#3b82f6',
    href: import.meta.env.VITE_MINOR_GAME_ACADEMIA_URL || 'http://localhost:5175/juego.html',
  },
  {
    id: 'nova-drive',
    name: 'Nova Drive',
    duration: 'Juego',
    difficulty: 'Menores',
    color: '#10b981',
    href: import.meta.env.VITE_MINOR_GAME_NOVA_URL || 'http://localhost:5176',
  },
]

const suggestions = [
  'Cómo mejorar mi memoria',
  'Técnicas para reducir ansiedad',
  'Cómo concentrarme mejor',
  'Qué evaluación hacer primero',
]

// ── Iconos ────────────────────────────────────────────────────────────────────
const BackIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '4px 0' }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(47,47,47,0.45)' }}
        />
      ))}
    </div>
  )
}

// ── Mensaje del chat ──────────────────────────────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '20px 0', borderBottom: '1px solid rgba(47,47,47,0.08)' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <div style={{
          width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
          background: isUser ? 'rgba(47,47,47,0.08)' : 'rgba(242,112,89,0.12)',
          border: `1px solid ${isUser ? 'rgba(47,47,47,0.14)' : 'rgba(242,112,89,0.25)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', color: isUser ? 'rgba(47,47,47,0.6)' : '#f27059', fontWeight: 700,
        }}>
          {isUser ? 'Tu' : 'MP'}
        </div>
        <span style={{ color: 'rgba(47,47,47,0.40)', fontSize: '12px', fontWeight: 500 }}>
          {isUser ? 'Tú' : 'Mind Patch IA'}
        </span>
      </div>
      <div style={{ paddingLeft: '30px' }}>
        {isUser ? (
          <div style={{ color: 'rgba(47,47,47,0.85)', fontSize: '15px', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
            {msg.content}
          </div>
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p:      ({ children }) => <p style={{ color: 'rgba(47,47,47,0.80)', fontSize: '15px', lineHeight: 1.8, margin: '0 0 12px' }}>{children}</p>,
              strong: ({ children }) => <strong style={{ color: '#2F2F2F', fontWeight: 600 }}>{children}</strong>,
              ul:     ({ children }) => <ul style={{ color: 'rgba(47,47,47,0.75)', fontSize: '15px', lineHeight: 1.8, margin: '0 0 12px', paddingLeft: '20px' }}>{children}</ul>,
              li:     ({ children }) => <li style={{ marginBottom: '4px' }}>{children}</li>,
            }}
          >
            {msg.content}
          </ReactMarkdown>
        )}
      </div>
    </motion.div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ tasks, selected, onSelect, onBack, showMap, onToggleMap, userType, esMenor, moduleLabel }) {
  const profileLabel = { adult: 'Adulto', adolescent: 'Adolescente', child: 'Niño / Niña' }

  return (
    <aside style={{
      width: '240px', flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
      background: '#9A9F82', borderRight: '1px solid rgba(47,47,47,0.15)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Logo + perfil */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(47,47,47,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ position: 'relative', width: '18px', height: '18px', flexShrink: 0 }}>
            {[
              { top: 0, left: '50%', transform: 'translateX(-50%)' },
              { top: '50%', left: 0, transform: 'translateY(-50%)' },
              { top: '50%', right: 0, transform: 'translateY(-50%)' },
              { bottom: 0, left: '50%', transform: 'translateX(-50%)' },
            ].map((s, i) => (
              <span key={i} style={{ position: 'absolute', width: '5px', height: '5px', borderRadius: '50%', background: '#2F2F2F', ...s }} />
            ))}
          </div>
          <span style={{ color: '#2F2F2F', fontWeight: 700, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase' }}>
            Mind Patch
          </span>
        </div>
        <button
          onClick={onBack}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(47,47,47,0.08)', border: '1px solid rgba(47,47,47,0.15)',
            borderRadius: '8px', color: 'rgba(47,47,47,0.60)', fontSize: '13px',
            padding: '8px 12px', cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#2F2F2F'; e.currentTarget.style.borderColor = 'rgba(47,47,47,0.28)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(47,47,47,0.60)'; e.currentTarget.style.borderColor = 'rgba(47,47,47,0.15)' }}
        >
          <BackIcon /> Volver al inicio
        </button>
      </div>

      {/* Lista de tareas */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        <p style={{ color: 'rgba(47,47,47,0.45)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', padding: '4px 8px 10px', margin: 0 }}>
          {moduleLabel} · {profileLabel[userType] || 'General'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {tasks.map(task => {
            const active = selected?.id === task.id
            return (
              <button
                type="button"
                key={task.id}
                onClick={() => {
                  const next = active ? null : task
                  const minorUrl = next ? getMinorTaskUrl(next) : ''
                  if (minorUrl) {
                    navigateToMinorGame(minorUrl)
                    return
                  }
                  onSelect(next)
                }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 10px', borderRadius: '8px',
                  background: active ? 'rgba(47,47,47,0.12)' : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(47,47,47,0.06)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: task.color, flexShrink: 0, opacity: active ? 1 : 0.55 }} />
                <span style={{ color: active ? 'rgba(47,47,47,0.90)' : 'rgba(47,47,47,0.60)', fontSize: '13px', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'color 0.15s' }}>
                  {task.name}
                </span>
                <span style={{ color: 'rgba(47,47,47,0.40)', fontSize: '10px', flexShrink: 0 }}>{task.duration}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Mapa */}
      <div style={{ padding: '8px 8px 0' }}>
        <button
          onClick={onToggleMap}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 10px', borderRadius: '8px',
            background: showMap ? 'rgba(190,125,87,0.18)' : 'transparent',
            border: showMap ? '1px solid rgba(190,125,87,0.30)' : '1px solid transparent',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (!showMap) e.currentTarget.style.background = 'rgba(47,47,47,0.06)' }}
          onMouseLeave={e => { if (!showMap) e.currentTarget.style.background = 'transparent' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={showMap ? '#BE7D57' : 'rgba(47,47,47,0.45)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span style={{ color: showMap ? '#BE7D57' : 'rgba(47,47,47,0.60)', fontSize: '13px', transition: 'color 0.15s' }}>
            Psicólogos cerca
          </span>
        </button>
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(47,47,47,0.12)', marginTop: '8px' }}>
        <p style={{ color: 'rgba(47,47,47,0.45)', fontSize: '11px', margin: 0, lineHeight: 1.5 }}>
          {esMenor
            ? 'Selecciona un juego o usa la IA para comenzar.'
            : 'Selecciona una tarea cognitiva o usa la IA para comenzar.'}
        </p>
        {esMenor && (
          <div style={{ marginTop: '10px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '10px', padding: '3px 9px', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.28)', color: '#92400e', borderRadius: '999px', fontWeight: 700 }}>
              Cuenta de menor
            </span>
          </div>
        )}
      </div>
    </aside>
  )
}

// ── Área principal ────────────────────────────────────────────────────────────
function MainArea({ selected, messages, loading, onSend, showMap, usosHoy, limitAlcanzado, isAdultModule }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const hasMessages = messages.length > 0
  const TaskComponent = selected?.component

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#DADBC6' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
        <div style={{ maxWidth: showMap ? '100%' : '680px', margin: '0 auto', height: showMap ? 'calc(100% - 24px)' : 'auto' }}>
          <AnimatePresence mode="wait">

            {/* Mapa */}
            {showMap && (
              <motion.div key="map" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} style={{ height: '100%' }}>
                <PsychologistsMap />
              </motion.div>
            )}

            {/* Bienvenida */}
            {!showMap && !hasMessages && !selected && (
              <motion.div key="welcome" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} style={{ paddingTop: '80px', textAlign: 'center' }}>
                <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 700, color: '#2F2F2F', letterSpacing: '-0.02em', lineHeight: 1.2, margin: '0 0 12px' }}>
                  Hola, ¿cómo te sientes hoy?
                </h1>
                <p style={{ color: 'rgba(47,47,47,0.55)', fontSize: '16px', margin: '0 0 40px', lineHeight: 1.6 }}>
                  {isAdultModule
                    ? 'Selecciona una tarea cognitiva o pregúntale algo a tu IA de estudio.'
                    : 'Selecciona un juego o pregúntale algo a tu IA de estudio.'}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '40px' }}>
                  {suggestions.map(s => (
                    <button key={s} onClick={() => onSend({ text: s, file: null, tool: null })}
                      style={{ padding: '8px 14px', background: 'rgba(47,47,47,0.04)', border: '1px solid rgba(47,47,47,0.10)', borderRadius: '999px', color: 'rgba(47,47,47,0.55)', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(47,47,47,0.08)'; e.currentTarget.style.color = '#2F2F2F' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(47,47,47,0.04)'; e.currentTarget.style.color = 'rgba(47,47,47,0.55)' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Tarea seleccionada — renderiza el componente individual */}
            {!showMap && !hasMessages && selected && TaskComponent && !selected.href && (
              <motion.div key={`task-${selected.id}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} style={{ paddingTop: '40px' }}>
                <TaskComponent task={selected} />
              </motion.div>
            )}

            {/* Chat */}
            {!showMap && hasMessages && (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: '32px' }}>
                {messages.map((msg, i) => <Message key={i} msg={msg} />)}
                {loading && (
                  <div style={{ padding: '20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0, background: 'rgba(242,112,89,0.12)', border: '1px solid rgba(242,112,89,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#f27059', fontWeight: 700 }}>MP</div>
                    <LoadingDots />
                  </div>
                )}
                <div ref={bottomRef} />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* PromptBox */}
      <div style={{ padding: '12px 24px 20px', width: '100%', maxWidth: '760px', margin: '0 auto', boxSizing: 'border-box' }}>
        {limitAlcanzado ? (
          <div style={{ padding: '14px 18px', borderRadius: '16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center' }}>
            <p style={{ color: '#dc2626', fontSize: '14px', fontWeight: 600, margin: '0 0 4px' }}>Límite diario alcanzado</p>
            <p style={{ color: 'rgba(47,47,47,0.55)', fontSize: '12px', margin: 0 }}>Has usado los {DAILY_LIMIT} mensajes de hoy. Vuelve mañana para continuar.</p>
          </div>
        ) : (
          <>
            <PromptBox onSend={onSend} disabled={loading} />
            <p style={{ color: 'rgba(47,47,47,0.35)', fontSize: '11px', textAlign: 'center', margin: '8px 0 0' }}>
              {usosHoy}/{DAILY_LIMIT} mensajes usados hoy · Mind Patch IA puede cometer errores.
            </p>
          </>
        )}
      </div>
    </div>
  )
}

// ── Componente raíz ───────────────────────────────────────────────────────────
// Adulto → tareas cognitivas (ASRS, Stroop, etc.). Niño / adolescente → juegos (menores).
export function GameMenu({ onBack, user, userType = 'adult', contextData }) {
  const isAdultModule = userType === 'adult'
  const tasks = isAdultModule ? ADULT_TASKS : MINOR_TASKS
  const esMenor = userType === 'adolescent' || userType === 'child'

  const [selected,    setSelected]    = useState(null)
  const [showMap,     setShowMap]     = useState(false)
  const [messages,    setMessages]    = useState([])
  const [loading,     setLoading]     = useState(false)
  const [usosHoy,     setUsosHoy]     = useState(getUsageToday)

  const limitAlcanzado = usosHoy >= DAILY_LIMIT

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

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#DADBC6' }}>
      <Sidebar
        tasks={tasks}
        selected={selected}
        onSelect={g => {
          if (g?.href) return
          setSelected(g)
          setShowMap(false)
        }}
        onBack={onBack}
        showMap={showMap}
        onToggleMap={() => { setShowMap(m => !m); setSelected(null) }}
        userType={userType}
        esMenor={esMenor}
        moduleLabel={isAdultModule ? 'Tareas cognitivas' : 'Juegos'}
      />
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
    </div>
  )
}