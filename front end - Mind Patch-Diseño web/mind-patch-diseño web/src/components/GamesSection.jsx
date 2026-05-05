import { motion } from 'framer-motion'
import { useState, useRef, useEffect } from 'react'

const games = [
  {
    id: 1,
    name: 'Test de Memoria',
    duration: '3 min',
    difficulty: 'Facil',
    color: '#6366f1',
    desc: 'Mide tu capacidad de retención a corto plazo mediante secuencias visuales y patrones que debes recordar y reproducir.',
    howTo: 'Se mostrarán una serie de patrones durante unos segundos. Deberás recordarlos y seleccionarlos en el orden correcto cuando desaparezcan.',
  },
  {
    id: 2,
    name: 'Velocidad de Reaccion',
    duration: '2 min',
    difficulty: 'Media',
    color: '#f59e0b',
    desc: 'Evalúa qué tan rápido responde tu mente ante estímulos visuales inesperados.',
    howTo: 'Cuando aparezca la señal en pantalla, presiona la tecla o toca la pantalla lo más rápido posible. Se registrará tu tiempo de reacción promedio.',
  },
  {
    id: 3,
    name: 'Test de Ansiedad',
    duration: '5 min',
    difficulty: 'Facil',
    color: '#10b981',
    desc: 'Cuestionario clínico validado para evaluar tu estado emocional y nivel de ansiedad antes de la sesión de estudio.',
    howTo: 'Lee cada afirmación y selecciona la opción que mejor describa cómo te has sentido durante los últimos días. No hay respuestas correctas o incorrectas.',
  },
  {
    id: 4,
    name: 'Enfoque y Atencion',
    duration: '4 min',
    difficulty: 'Dificil',
    color: '#ef4444',
    desc: 'Detecta tu nivel de concentración actual mediante tareas que requieren atención sostenida y selectiva.',
    howTo: 'Identifica y selecciona únicamente los elementos que cumplan con el criterio indicado, ignorando los distractores que aparecen simultáneamente.',
  },
  {
    id: 5,
    name: 'Respiracion y Calma',
    duration: '2 min',
    difficulty: 'Facil',
    color: '#3b82f6',
    desc: 'Ejercicio guiado de respiración para reducir el estrés y preparar tu mente para el aprendizaje.',
    howTo: 'Sigue el ritmo visual que aparece en pantalla: inhala cuando el círculo se expande, exhala cuando se contrae. Mantén un ritmo constante.',
  },
  {
    id: 6,
    name: 'Asociacion de Palabras',
    duration: '3 min',
    difficulty: 'Media',
    color: '#8b5cf6',
    desc: 'Analiza patrones cognitivos y creatividad mediante asociaciones semánticas entre conceptos.',
    howTo: 'Se mostrará una palabra central. Selecciona la palabra que consideres más relacionada. Responde con tu primera intuición sin pensar demasiado.',
  },
]

const difficultyColor = {
  'Facil':   '#10b981',
  'Media':   '#f59e0b',
  'Dificil': '#ef4444',
}

const FullscreenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 3 21 3 21 9" />
    <polyline points="9 21 3 21 3 15" />
    <line x1="21" y1="3" x2="14" y2="10" />
    <line x1="3" y1="21" x2="10" y2="14" />
  </svg>
)

const ExitFullscreenIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 14 10 14 10 20" />
    <polyline points="20 10 14 10 14 4" />
    <line x1="10" y1="14" x2="3" y2="21" />
    <line x1="21" y1="3" x2="14" y2="10" />
  </svg>
)

const ClockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
)

const BarIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)

export function GamesSection({ onAuthRequired }) {
  const [selected, setSelected] = useState(games[0])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(false)
  const playerRef = useRef(null)

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      playerRef.current?.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  return (
    <section
      id="evaluacion"
      style={{
        background: '#080808',
        padding: '100px 0 120px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ marginBottom: '48px' }}
        >
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', letterSpacing: '3px', textTransform: 'uppercase' }}>
            Evaluacion
          </span>
          <h2 style={{
            marginTop: '16px',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 700,
            color: 'white',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            margin: '16px 0 0',
          }}>
            Conoce tu estado<br />
            <span style={{ color: 'rgb(107,114,128)' }}>antes de estudiar</span>
          </h2>
          <p style={{ marginTop: '16px', color: 'rgb(107,114,128)', fontSize: '17px', lineHeight: 1.7, maxWidth: '480px' }}>
            Completa juegos y pruebas rapidas. La IA analiza tus resultados y adapta tu sesion de estudio en tiempo real.
          </p>
        </motion.div>

        {/* Player + Info panel */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
          style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'flex-start',
            flexWrap: 'wrap',
          }}
        >

          {/* Left: player + thumbnails */}
          <div style={{ flex: '1 1 480px', minWidth: '0' }}>

            {/* Player */}
            <div
              ref={playerRef}
              onMouseEnter={() => setControlsVisible(true)}
              onMouseLeave={() => setControlsVisible(false)}
              style={{
                position: 'relative',
                width: '100%',
                paddingBottom: '56.25%',
                background: '#0a0a0a',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
                cursor: 'default',
              }}
            >
              {/* Game area */}
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: `radial-gradient(ellipse at 50% 40%, ${selected.color}15 0%, transparent 65%), #0a0a0a`,
              }}>
                {/* Background grid */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage:
                    'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
                  backgroundSize: '44px 44px',
                  pointerEvents: 'none',
                }} />

                {/* Play button */}
                <div style={{
                  position: 'relative',
                  zIndex: 1,
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  background: selected.color + '18',
                  border: `1px solid ${selected.color}45`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '18px',
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill={selected.color}>
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>

                <p style={{
                  position: 'relative',
                  zIndex: 1,
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: '13px',
                  margin: 0,
                  letterSpacing: '0.5px',
                }}>
                  Presiona iniciar para comenzar
                </p>
              </div>

              {/* Bottom controls bar — visible on hover */}
              <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                padding: '40px 14px 12px',
                background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                opacity: controlsVisible ? 1 : 0,
                transition: 'opacity 0.22s ease',
                pointerEvents: controlsVisible ? 'auto' : 'none',
              }}>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: 500 }}>
                  {selected.name}
                </span>
                <button
                  onClick={toggleFullscreen}
                  title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                  style={{
                    background: 'rgba(0,0,0,0.55)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '8px',
                    color: 'white',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.8)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.55)'}
                >
                  {isFullscreen ? <ExitFullscreenIcon /> : <FullscreenIcon />}
                </button>
              </div>
            </div>

            {/* Thumbnails */}
            <div style={{
              display: 'flex',
              gap: '10px',
              marginTop: '12px',
              overflowX: 'auto',
              paddingBottom: '4px',
            }}>
              {games.map((game) => {
                const active = selected.id === game.id
                return (
                  <button
                    key={game.id}
                    onClick={() => setSelected(game)}
                    style={{
                      flexShrink: 0,
                      width: '130px',
                      background: active ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: '10px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'all 0.2s',
                    }}
                  >
                    {/* Thumbnail preview */}
                    <div style={{
                      width: '100%',
                      aspectRatio: '16/9',
                      background: `radial-gradient(ellipse at 50% 50%, ${game.color}28 0%, #0d0d0d 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <div style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        background: game.color + '25',
                        border: `1px solid ${game.color}55`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <svg width="8" height="8" viewBox="0 0 24 24" fill={game.color}>
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </div>
                    </div>
                    <div style={{ padding: '7px 9px' }}>
                      <p style={{
                        color: active ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
                        fontSize: '11px',
                        fontWeight: 500,
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'left',
                        transition: 'color 0.2s',
                      }}>
                        {game.name}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right: info panel */}
          <div style={{
            width: '290px',
            flexShrink: 0,
            background: '#0f0f0f',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px',
            padding: '24px',
          }}>
            {/* Color accent bar */}
            <div style={{
              width: '28px',
              height: '3px',
              borderRadius: '999px',
              background: selected.color,
              marginBottom: '18px',
              transition: 'background 0.3s',
            }} />

            <h3 style={{ color: 'white', fontSize: '16px', fontWeight: 600, margin: '0 0 12px' }}>
              {selected.name}
            </h3>

            {/* Badges */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '3px 10px', borderRadius: '999px', fontSize: '11px',
                background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)',
              }}>
                <ClockIcon /> {selected.duration}
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                padding: '3px 10px', borderRadius: '999px', fontSize: '11px',
                background: difficultyColor[selected.difficulty] + '18',
                color: difficultyColor[selected.difficulty],
              }}>
                <BarIcon /> {selected.difficulty}
              </span>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '20px' }} />

            {/* Description */}
            <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 8px' }}>
              Descripcion
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: 1.7, margin: '0 0 22px' }}>
              {selected.desc}
            </p>

            {/* How to play */}
            <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 8px' }}>
              Como jugar
            </p>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '13px', lineHeight: 1.7, margin: '0 0 28px' }}>
              {selected.howTo}
            </p>

            {/* CTA */}
            <button
              onClick={onAuthRequired}
              style={{
                width: '100%',
                padding: '11px',
                background: 'white',
                color: 'black',
                border: 'none',
                borderRadius: '10px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#e5e5e5'}
              onMouseLeave={e => e.currentTarget.style.background = 'white'}
            >
              Iniciar evaluacion
            </button>
          </div>

        </motion.div>
      </div>
    </section>
  )
}
