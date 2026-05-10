import { BackIcon } from './icons'
import { formatSavedAt } from './utils'

export default function Sidebar({
  tasks, activeId, onSelect, onBack,
  showMap, onToggleMap,
  showAnalysis, onToggleAnalysis,
  userType, esMenor, moduleLabel, savedMetrics,
}) {
  const profileLabel = { adult: 'Adulto', adolescent: 'Adolescente', child: 'Niño / Niña' }

  return (
    <aside style={{
      width: '240px', flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
      background: '#9A9F82', borderRight: '1px solid rgba(47,47,47,0.15)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>
      {/* Logo + botón de regreso */}
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

      {/* Lista de tareas / juegos */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 8px' }}>
        <p style={{ color: 'rgba(47,47,47,0.45)', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', padding: '4px 8px 10px', margin: 0 }}>
          {moduleLabel} · {profileLabel[userType] || 'General'}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {tasks.map(task => {
            const active = activeId === task.id
            return (
              <button
                type="button"
                key={task.id}
                onClick={() => onSelect(task)}
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
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ color: active ? 'rgba(47,47,47,0.90)' : 'rgba(47,47,47,0.60)', fontSize: '13px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'color 0.15s' }}>
                    {task.name}
                  </span>
                  {task.desc && (
                    <span style={{ color: 'rgba(47,47,47,0.35)', fontSize: '10px', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {task.duration}
                    </span>
                  )}
                </div>
                {savedMetrics?.[task.id] && (
                  <span title={`Última sesión: ${formatSavedAt(savedMetrics[task.id].savedAt)}`} style={{
                    width: '7px', height: '7px', borderRadius: '50%',
                    background: '#f27059', flexShrink: 0, opacity: 0.75,
                  }} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Análisis */}
      <div style={{ padding: '0 8px' }}>
        <button
          onClick={onToggleAnalysis}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
            padding: '9px 10px', borderRadius: '8px',
            background: showAnalysis ? 'rgba(16,185,129,0.18)' : 'transparent',
            border: showAnalysis ? '1px solid rgba(16,185,129,0.30)' : '1px solid transparent',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => { if (!showAnalysis) e.currentTarget.style.background = 'rgba(47,47,47,0.06)' }}
          onMouseLeave={e => { if (!showAnalysis) e.currentTarget.style.background = 'transparent' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={showAnalysis ? '#10b981' : 'rgba(47,47,47,0.45)'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <span style={{ color: showAnalysis ? '#10b981' : 'rgba(47,47,47,0.60)', fontSize: '13px', transition: 'color 0.15s' }}>
            Análisis
          </span>
        </button>
      </div>

      {/* Psicólogos cerca */}
      <div style={{ padding: '4px 8px 0' }}>
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
