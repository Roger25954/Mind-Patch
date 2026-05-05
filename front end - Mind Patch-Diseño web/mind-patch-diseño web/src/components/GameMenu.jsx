import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PromptBox } from './PromptBox'
import { PsychologistsMap } from './PsychologistsMap'

const API = 'http://localhost:3000'

const games = [
  { id: 1, name: 'Test de Memoria',        duration: '3 min', difficulty: 'Facil',   color: '#6366f1' },
  { id: 2, name: 'Velocidad de Reaccion',  duration: '2 min', difficulty: 'Media',   color: '#f59e0b' },
  { id: 3, name: 'Test de Ansiedad',       duration: '5 min', difficulty: 'Facil',   color: '#10b981' },
  { id: 4, name: 'Enfoque y Atencion',     duration: '4 min', difficulty: 'Dificil', color: '#ef4444' },
  { id: 5, name: 'Respiracion y Calma',    duration: '2 min', difficulty: 'Facil',   color: '#3b82f6' },
  { id: 6, name: 'Asociacion de Palabras', duration: '3 min', difficulty: 'Media',   color: '#8b5cf6' },
]

const suggestions = [
  'Como mejorar mi memoria',
  'Tecnicas para reducir ansiedad',
  'Como concentrarme mejor',
  'Que evaluacion hacer primero',
]

// ── Iconos ────────────────────────────────────────────────────────────────────
const BackIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
)

const FileIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14,2 14,8 20,8"/>
  </svg>
)

// ── Loading dots ──────────────────────────────────────────────────────────────
function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '4px 0' }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }}
        />
      ))}
    </div>
  )
}

// ── Tarjeta individual con flip ───────────────────────────────────────────────
function Flashcard({ pregunta, respuesta, index }) {
  const [flipped, setFlipped] = useState(false)

  const cardBase = {
    position: 'absolute', inset: 0,
    borderRadius: '14px', padding: '18px',
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      onClick={() => setFlipped(f => !f)}
      style={{ cursor: 'pointer', height: '140px', userSelect: 'none', position: 'relative' }}
    >
      <AnimatePresence initial={false} mode="wait">
        {!flipped ? (
          <motion.div
            key="front"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0,   opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } }}
            exit={{   rotateY: 90,   opacity: 0, transition: { duration: 0.2,  ease: 'easeIn'  } }}
            style={{ ...cardBase, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)' }}
          >
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
              {pregunta}
            </p>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px' }}>Toca para ver respuesta</span>
          </motion.div>
        ) : (
          <motion.div
            key="back"
            initial={{ rotateY: -90, opacity: 0 }}
            animate={{ rotateY: 0,   opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } }}
            exit={{   rotateY: 90,   opacity: 0, transition: { duration: 0.2,  ease: 'easeIn'  } }}
            style={{ ...cardBase, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', lineHeight: 1.6, margin: 0 }}>
              {respuesta}
            </p>
            <span style={{ color: 'rgba(99,102,241,0.5)', fontSize: '11px' }}>Toca para volver</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Pregunta individual del quiz ──────────────────────────────────────────────
function QuizQuestion({ pregunta, opciones, correcta, explicacion, index }) {
  const [selected, setSelected] = useState(null)
  const answered = selected !== null

  const getStyle = (i) => {
    if (!answered) return {
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      color: 'rgba(255,255,255,0.75)',
    }
    if (i === correcta) return {
      background: 'rgba(16,185,129,0.12)',
      border: '1px solid rgba(16,185,129,0.35)',
      color: '#34d399',
    }
    if (i === selected) return {
      background: 'rgba(239,68,68,0.1)',
      border: '1px solid rgba(239,68,68,0.3)',
      color: '#f87171',
    }
    return {
      background: 'transparent',
      border: '1px solid rgba(255,255,255,0.05)',
      color: 'rgba(255,255,255,0.25)',
    }
  }

  const getIcon = (i) => {
    if (!answered) return null
    if (i === correcta) return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
    )
    if (i === selected) return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    )
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '16px', padding: '18px',
        display: 'flex', flexDirection: 'column', gap: '12px',
      }}
    >
      {/* Número + pregunta */}
      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <span style={{
          flexShrink: 0, width: '22px', height: '22px', borderRadius: '6px',
          background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: 700, color: '#818cf8',
        }}>{index + 1}</span>
        <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '14px', lineHeight: 1.5, margin: 0, fontWeight: 500 }}>
          {pregunta}
        </p>
      </div>

      {/* Opciones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {opciones.map((op, i) => (
          <button
            key={i}
            onClick={() => !answered && setSelected(i)}
            disabled={answered}
            style={{
              ...getStyle(i),
              width: '100%', textAlign: 'left', borderRadius: '10px',
              padding: '10px 14px', fontSize: '13px', lineHeight: 1.4,
              cursor: answered ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (!answered) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)' }}
            onMouseLeave={e => { if (!answered) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
          >
            <span>{op}</span>
            {getIcon(i)}
          </button>
        ))}
      </div>

      {/* Explicación */}
      <AnimatePresence>
        {answered && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            style={{
              background: selected === correcta ? 'rgba(16,185,129,0.07)' : 'rgba(99,102,241,0.07)',
              border: `1px solid ${selected === correcta ? 'rgba(16,185,129,0.2)' : 'rgba(99,102,241,0.2)'}`,
              borderRadius: '10px', padding: '10px 14px',
            }}
          >
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '12px', lineHeight: 1.6, margin: 0 }}>
              {explicacion}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Bloque de quiz en el chat ──────────────────────────────────────────────────
function QuizBlock({ preguntas }) {
  return (
    <div style={{ paddingLeft: '30px' }}>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: '0 0 14px' }}>
        {preguntas.length} preguntas · Selecciona una opcion para responder
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {preguntas.map((p, i) => (
          <QuizQuestion
            key={i}
            index={i}
            pregunta={p.pregunta}
            opciones={p.opciones}
            correcta={p.correcta}
            explicacion={p.explicacion}
          />
        ))}
      </div>
    </div>
  )
}

// ── Bloque de tarjetas en el chat ─────────────────────────────────────────────
function FlashcardsBlock({ tarjetas }) {
  return (
    <div style={{ paddingLeft: '30px' }}>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: '0 0 14px' }}>
        {tarjetas.length} tarjetas · Toca cada una para ver la respuesta
      </p>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '10px',
      }}>
        {tarjetas.map((t, i) => (
          <Flashcard key={i} index={i} pregunta={t.pregunta} respuesta={t.respuesta} />
        ))}
      </div>
    </div>
  )
}

// ── Mensaje individual ────────────────────────────────────────────────────────
function Message({ msg }) {
  const isUser = msg.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '20px 0',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        <div style={{
          width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
          background: isUser ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.2)',
          border: `1px solid ${isUser ? 'rgba(255,255,255,0.15)' : 'rgba(99,102,241,0.3)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '10px', color: isUser ? 'rgba(255,255,255,0.7)' : '#6366f1', fontWeight: 700,
        }}>
          {isUser ? 'Tu' : 'MP'}
        </div>
        <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', fontWeight: 500 }}>
          {isUser ? 'Tu' : 'Mind Patch IA'}
        </span>
        {msg.fileName && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '2px 8px', borderRadius: '999px', fontSize: '10px',
            background: 'rgba(99,102,241,0.1)', color: '#6366f1',
            border: '1px solid rgba(99,102,241,0.2)',
          }}>
            <FileIcon /> {msg.fileName}
          </span>
        )}
      </div>

      {/* Contenido */}
      {msg.tipo === 'tarjetas' ? (
        <FlashcardsBlock tarjetas={msg.tarjetas} />
      ) : msg.tipo === 'quiz' ? (
        <QuizBlock preguntas={msg.preguntas} />
      ) : (
        <div style={{
          color: isUser ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.75)',
          fontSize: '15px', lineHeight: 1.75, whiteSpace: 'pre-wrap', paddingLeft: '30px',
        }}>
          {msg.content}
        </div>
      )}
    </motion.div>
  )
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ selected, onSelect, onBack, showMap, onToggleMap }) {
  return (
    <aside style={{
      width: '240px', flexShrink: 0,
      height: '100vh', position: 'sticky', top: 0,
      background: '#0a0a0a',
      borderRight: '1px solid rgba(255,255,255,0.06)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ position: 'relative', width: '18px', height: '18px', flexShrink: 0 }}>
            {[
              { top: 0, left: '50%', transform: 'translateX(-50%)' },
              { top: '50%', left: 0, transform: 'translateY(-50%)' },
              { top: '50%', right: 0, transform: 'translateY(-50%)' },
              { bottom: 0, left: '50%', transform: 'translateX(-50%)' },
            ].map((s, i) => (
              <span key={i} style={{ position: 'absolute', width: '5px', height: '5px', borderRadius: '50%', background: 'white', ...s }} />
            ))}
          </div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '12px', letterSpacing: '3px', textTransform: 'uppercase' }}>
            Mind Patch
          </span>
        </div>

        <button
          onClick={onBack}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '8px', color: 'rgba(255,255,255,0.5)', fontSize: '13px',
            padding: '8px 12px', cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
        >
          <BackIcon /> Volver al inicio
        </button>
      </div>

      {/* Lista de juegos */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', padding: '4px 8px 10px', margin: 0 }}>
          Evaluaciones
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {games.map((game) => {
            const active = selected?.id === game.id
            return (
              <button
                key={game.id}
                onClick={() => onSelect(active ? null : game)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 10px', borderRadius: '8px',
                  background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
                  border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: game.color, flexShrink: 0, opacity: active ? 1 : 0.45 }} />
                <span style={{ color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)', fontSize: '13px', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'color 0.15s' }}>
                  {game.name}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', flexShrink: 0 }}>{game.duration}</span>
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
            background: showMap ? 'rgba(99,102,241,0.12)' : 'transparent',
            border: showMap ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
            cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (!showMap) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
          onMouseLeave={e => { if (!showMap) e.currentTarget.style.background = 'transparent' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={showMap ? '#6366f1' : 'rgba(255,255,255,0.35)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span style={{ color: showMap ? '#a5b4fc' : 'rgba(255,255,255,0.45)', fontSize: '13px', transition: 'color 0.15s' }}>
            Psicologos cerca
          </span>
        </button>
      </div>

      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '8px' }}>
        <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', margin: 0, lineHeight: 1.5 }}>
          Selecciona una evaluacion o usa la IA para comenzar.
        </p>
      </div>
    </aside>
  )
}

// ── Main area ─────────────────────────────────────────────────────────────────
function MainArea({ selected, onSelect, messages, loading, onSend, showMap }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const hasMessages = messages.length > 0

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#080808' }}>

      {/* Área de mensajes / bienvenida / mapa */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
        <div style={{ maxWidth: showMap ? '100%' : '680px', margin: '0 auto', height: showMap ? 'calc(100% - 24px)' : 'auto' }}>

          <AnimatePresence mode="wait">
            {showMap ? (
              /* ── Mapa de psicólogos ── */
              <motion.div
                key="map"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                style={{ height: '100%' }}
              >
                <PsychologistsMap />
              </motion.div>
            ) : !hasMessages && !selected ? (
              /* ── Bienvenida ── */
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                style={{ paddingTop: '80px', textAlign: 'center' }}
              >
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
                }}>
                  <div style={{ position: 'relative', width: '20px', height: '20px' }}>
                    {[
                      { top: 0, left: '50%', transform: 'translateX(-50%)' },
                      { top: '50%', left: 0, transform: 'translateY(-50%)' },
                      { top: '50%', right: 0, transform: 'translateY(-50%)' },
                      { bottom: 0, left: '50%', transform: 'translateX(-50%)' },
                    ].map((s, i) => (
                      <span key={i} style={{ position: 'absolute', width: '6px', height: '6px', borderRadius: '50%', background: 'white', ...s }} />
                    ))}
                  </div>
                </div>
                <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', lineHeight: 1.2, margin: '0 0 12px' }}>
                  Hola, como te sientes hoy?
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '16px', margin: '0 0 40px', lineHeight: 1.6 }}>
                  Selecciona una evaluacion o preguntale algo a tu IA de estudio.
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '40px' }}>
                  {suggestions.map(s => (
                    <button
                      key={s}
                      onClick={() => onSend({ text: s, file: null, tool: null })}
                      style={{
                        padding: '8px 14px', background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)', borderRadius: '999px',
                        color: 'rgba(255,255,255,0.5)', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : !hasMessages && selected ? (
              /* ── Juego seleccionado ── */
              <motion.div
                key={`game-${selected.id}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                style={{ paddingTop: '80px', textAlign: 'center' }}
              >
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px',
                  background: selected.color + '18', border: `1px solid ${selected.color}35`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: selected.color }} />
                </div>
                <h2 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 2rem)', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', margin: '0 0 10px' }}>
                  {selected.name}
                </h2>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
                  <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>{selected.duration}</span>
                  <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', background: selected.color + '18', color: selected.color }}>{selected.difficulty}</span>
                </div>
                <button
                  style={{ padding: '12px 36px', background: 'white', color: 'black', border: 'none', borderRadius: '999px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e5e5e5'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                  Iniciar evaluacion
                </button>
              </motion.div>
            ) : (
              /* ── Chat ── */
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: '32px' }}>
                {messages.map((msg, i) => <Message key={i} msg={msg} />)}
                {loading && (
                  <div style={{ padding: '20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
                      background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', color: '#6366f1', fontWeight: 700,
                    }}>MP</div>
                    <LoadingDots />
                  </div>
                )}
                <div ref={bottomRef} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* PromptBox fijo abajo */}
      <div style={{ padding: '12px 24px 20px', width: '100%', maxWidth: '760px', margin: '0 auto', boxSizing: 'border-box' }}>
        <PromptBox onSend={onSend} disabled={loading} />
        <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: '11px', textAlign: 'center', margin: '8px 0 0' }}>
          Mind Patch IA puede cometer errores. Verifica la informacion importante.
        </p>
      </div>
    </div>
  )
}

// ── Componente raiz ───────────────────────────────────────────────────────────
export function GameMenu({ onBack }) {
  const [selected, setSelected] = useState(null)
  const [showMap,  setShowMap]  = useState(false)
  const [messages, setMessages] = useState([])
  const [loading,  setLoading]  = useState(false)

  const handleSend = async ({ text, file, tool }) => {
    if (!text && !file) return

    const userMsg = {
      role: 'user',
      content: text || '',
      fileName: file?.name || null,
    }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      let res, text_body

      if (file) {
        // PDF → FormData
        const form = new FormData()
        form.append('pdf', file)
        if (text)  form.append('prompt', text)
        if (tool)  form.append('tool', tool)
        res = await fetch(`${API}/api/ia`, { method: 'POST', body: form })
      } else {
        // Texto → JSON
        res = await fetch(`${API}/api/ia`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mensaje: text, tool }),
        })
      }

      text_body = await res.text()

      let data
      try {
        data = JSON.parse(text_body)
      } catch {
        setMessages(prev => [...prev, { role: 'ai', content: `Error del servidor: ${text_body.slice(0, 200)}` }])
        return
      }

      if (data.tipo === 'tarjetas' && Array.isArray(data.tarjetas)) {
        setMessages(prev => [...prev, { role: 'ai', tipo: 'tarjetas', tarjetas: data.tarjetas }])
      } else if (data.tipo === 'quiz' && Array.isArray(data.preguntas)) {
        setMessages(prev => [...prev, { role: 'ai', tipo: 'quiz', preguntas: data.preguntas }])
      } else {
        const content = data.resultado || data.respuesta || data.error || 'Sin respuesta.'
        setMessages(prev => [...prev, { role: 'ai', content }])
      }

    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: err.message?.includes('fetch')
          ? 'No se pudo conectar con el servidor. Verifica que el backend este corriendo en el puerto 3000.'
          : `Error: ${err.message}`,
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#080808' }}>
      <Sidebar
        selected={selected}
        onSelect={(g) => { setSelected(g); setShowMap(false) }}
        onBack={onBack}
        showMap={showMap}
        onToggleMap={() => { setShowMap(m => !m); setSelected(null) }}
      />
      <MainArea selected={selected} onSelect={setSelected} messages={messages} loading={loading} onSend={handleSend} showMap={showMap} />
    </div>
  )
}
