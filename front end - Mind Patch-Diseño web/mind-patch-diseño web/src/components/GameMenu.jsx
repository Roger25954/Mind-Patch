import { useState } from 'react'
import { motion } from 'framer-motion'
import { PromptBox } from './PromptBox'

const games = [
  { id: 1, name: 'Test de Memoria',       duration: '3 min', difficulty: 'Facil',   color: '#6366f1' },
  { id: 2, name: 'Velocidad de Reaccion', duration: '2 min', difficulty: 'Media',   color: '#f59e0b' },
  { id: 3, name: 'Test de Ansiedad',      duration: '5 min', difficulty: 'Facil',   color: '#10b981' },
  { id: 4, name: 'Enfoque y Atencion',    duration: '4 min', difficulty: 'Dificil', color: '#ef4444' },
  { id: 5, name: 'Respiracion y Calma',   duration: '2 min', difficulty: 'Facil',   color: '#3b82f6' },
  { id: 6, name: 'Asociacion de Palabras',duration: '3 min', difficulty: 'Media',   color: '#8b5cf6' },
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

const GameIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
  </svg>
)

const ChevronIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
)

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({ selected, onSelect, onBack, sidebarOpen, setSidebarOpen }) {
  return (
    <>
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 30,
            background: 'rgba(0,0,0,0.6)',
            display: 'none',
          }}
          className="mobile-overlay"
        />
      )}

      <aside style={{
        width: '240px',
        flexShrink: 0,
        height: '100vh',
        position: 'sticky',
        top: 0,
        background: '#0a0a0a',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Logo */}
        <div style={{
          padding: '20px 16px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
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
              width: '100%',
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.5)',
              fontSize: '13px',
              padding: '8px 12px',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}
          >
            <BackIcon /> Volver al inicio
          </button>
        </div>

        {/* Games list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
          <p style={{
            color: 'rgba(255,255,255,0.2)',
            fontSize: '10px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            padding: '4px 8px 10px',
            margin: 0,
          }}>
            Evaluaciones
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {games.map((game) => {
              const active = selected?.id === game.id
              return (
                <button
                  key={game.id}
                  onClick={() => onSelect(game)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '9px 10px',
                    borderRadius: '8px',
                    background: active ? 'rgba(255,255,255,0.07)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                >
                  {/* Color dot */}
                  <div style={{
                    width: '8px', height: '8px',
                    borderRadius: '50%',
                    background: game.color,
                    flexShrink: 0,
                    opacity: active ? 1 : 0.5,
                    transition: 'opacity 0.2s',
                  }} />

                  <span style={{
                    color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)',
                    fontSize: '13px',
                    flex: 1,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    transition: 'color 0.15s',
                  }}>
                    {game.name}
                  </span>

                  <span style={{
                    color: 'rgba(255,255,255,0.2)',
                    fontSize: '10px',
                    flexShrink: 0,
                  }}>
                    {game.duration}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '12px 16px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '11px', margin: 0, lineHeight: 1.5 }}>
            Selecciona una evaluacion o usa la IA para comenzar.
          </p>
        </div>
      </aside>
    </>
  )
}

// ── Main content ──────────────────────────────────────────────────────────────
function MainArea({ selected, onSelect }) {
  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'hidden',
      background: '#080808',
    }}>

      {/* Scrollable center */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px 0',
        overflow: 'auto',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ width: '100%', maxWidth: '680px', textAlign: 'center' }}
        >
          {/* Greeting */}
          {!selected ? (
            <>
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
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
              <h1 style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                fontWeight: 700, color: 'white',
                letterSpacing: '-0.02em', lineHeight: 1.2,
                margin: '0 0 12px',
              }}>
                Hola, como te sientes hoy?
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '16px', margin: '0 0 40px', lineHeight: 1.6 }}>
                Selecciona una evaluacion del menu o preguntale algo a tu IA de estudio.
              </p>

              {/* Suggestion chips */}
              <div style={{
                display: 'flex', flexWrap: 'wrap',
                gap: '8px', justifyContent: 'center',
                marginBottom: '40px',
              }}>
                {suggestions.map((s) => (
                  <button
                    key={s}
                    style={{
                      padding: '8px 14px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '999px',
                      color: 'rgba(255,255,255,0.5)',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Game selected view */
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              style={{ marginBottom: '40px' }}
            >
              <div style={{
                width: '52px', height: '52px', borderRadius: '14px',
                background: selected.color + '18',
                border: `1px solid ${selected.color}35`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: selected.color }} />
              </div>
              <h2 style={{
                fontSize: 'clamp(1.4rem, 2.5vw, 2rem)',
                fontWeight: 700, color: 'white',
                letterSpacing: '-0.02em', margin: '0 0 10px',
              }}>
                {selected.name}
              </h2>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
                <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                  {selected.duration}
                </span>
                <span style={{ padding: '4px 12px', borderRadius: '999px', fontSize: '12px', background: selected.color + '18', color: selected.color }}>
                  {selected.difficulty}
                </span>
              </div>
              <button
                style={{
                  padding: '12px 36px',
                  background: 'white', color: 'black',
                  border: 'none', borderRadius: '999px',
                  fontSize: '14px', fontWeight: 600,
                  cursor: 'pointer', transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#e5e5e5'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
              >
                Iniciar evaluacion
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Prompt box fijo abajo */}
      <div style={{
        padding: '16px 24px 24px',
        width: '100%',
        maxWidth: '760px',
        margin: '0 auto',
        boxSizing: 'border-box',
      }}>
        <PromptBox />
        <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: '11px', textAlign: 'center', margin: '10px 0 0' }}>
          Mind Patch IA puede cometer errores. Verifica la informacion importante.
        </p>
      </div>

    </div>
  )
}

// ── Componente raiz ───────────────────────────────────────────────────────────
export function GameMenu({ onBack }) {
  const [selected, setSelected] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#080808' }}>
      <Sidebar
        selected={selected}
        onSelect={setSelected}
        onBack={onBack}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <MainArea selected={selected} onSelect={setSelected} />
    </div>
  )
}
