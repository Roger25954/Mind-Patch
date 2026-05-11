import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { BackIcon } from './icons'
import { formatSavedAt } from './utils'
import MetricsPanel from './MetricsPanel'

export default function MinorGameFrame({ game, gameMetrics, savedSession, onBack, onReplay }) {
  const [showSaved, setShowSaved] = useState(false)

  const panelData  = gameMetrics ?? (showSaved ? savedSession : null)
  const fromStorage = !gameMetrics && showSaved

  return (
    <div style={{ flex: 1, position: 'relative', height: '100vh', background: '#000', overflow: 'hidden' }}>

      {/* Barra superior */}
      <div style={{ position: 'absolute', top: '12px', left: '12px', right: '12px', zIndex: 20, display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.18)',
            color: 'rgba(255,255,255,0.75)', borderRadius: '8px', padding: '7px 12px',
            cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit',
            backdropFilter: 'blur(8px)', transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.85)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.65)'}
        >
          <BackIcon /> Volver al menú
        </button>

        {savedSession && !gameMetrics && (
          <button
            onClick={() => setShowSaved(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: showSaved ? 'rgba(242,112,89,0.2)' : 'rgba(0,0,0,0.55)',
              border: `1px solid ${showSaved ? 'rgba(242,112,89,0.5)' : 'rgba(255,255,255,0.14)'}`,
              color: showSaved ? '#f27059' : 'rgba(255,255,255,0.6)',
              borderRadius: '8px', padding: '7px 12px',
              cursor: 'pointer', fontSize: '12px', fontFamily: 'inherit',
              backdropFilter: 'blur(8px)', transition: 'all 0.2s',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {showSaved ? 'Ocultar resultados' : 'Ver última sesión'}
            <span style={{ fontSize: '10px', opacity: 0.6, marginLeft: '2px' }}>
              {formatSavedAt(savedSession.savedAt)}
            </span>
          </button>
        )}

        <div style={{ marginLeft: 'auto', background: 'rgba(0,0,0,0.55)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '5px 12px', backdropFilter: 'blur(8px)' }}>
          <span style={{ color: game.color, fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px' }}>
            {game.name}
          </span>
        </div>
      </div>

      <iframe
        src={game.href}
        style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
        title={game.name}
        allow="fullscreen; autoplay"
      />

      <AnimatePresence>
        {panelData && (
          <MetricsPanel
            gameId={panelData.gameId}
            metrics={panelData.metrics}
            fromStorage={fromStorage}
            savedAt={fromStorage ? savedSession.savedAt : null}
            onClose={fromStorage ? () => setShowSaved(false) : onBack}
            onReplay={() => { setShowSaved(false); onReplay() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
