import { BackIcon } from './icons'
import { formatSavedAt } from './utils'

const TASK_ICONS = {
  asrs:          '🧠',
  dyslexia:      '📖',
  stroop:        '🎨',
  subit:         '🔢',
  lexical:       '💬',
  'juego-astrid':   '🍎',
  'academia-magia': '🪄',
  'nova-drive':     '🚀',
}

const PROFILE_META = {
  adult:      { label: 'Adulto',      color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  adolescent: { label: 'Adolescente', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  child:      { label: 'Niño / Niña', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
}

function NavBtn({ onClick, active, activeColor = '#10b981', activeBg, icon, label }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 12px', borderRadius: '10px', border: 'none',
        background: active ? (activeBg || 'rgba(16,185,129,0.14)') : 'transparent',
        cursor: 'pointer', transition: 'background 0.15s', textAlign: 'left',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(218,219,198,0.07)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
    >
      <span style={{
        width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? `${activeColor}22` : 'rgba(218,219,198,0.07)',
        border: `1px solid ${active ? `${activeColor}40` : 'rgba(218,219,198,0.10)'}`,
        transition: 'all 0.15s',
      }}>
        {icon}
      </span>
      <span style={{
        color: active ? activeColor : 'rgba(218,219,198,0.55)',
        fontSize: '13px', fontWeight: active ? 600 : 400, transition: 'color 0.15s',
      }}>
        {label}
      </span>
    </button>
  )
}

export default function Sidebar({
  tasks, activeId, onSelect, onBack,
  showMap, onToggleMap,
  showAnalysis, onToggleAnalysis,
  userType, esMenor, moduleLabel, savedMetrics,
}) {
  const profile = PROFILE_META[userType] || PROFILE_META.adult

  return (
    <aside style={{
      width: '252px', flexShrink: 0, height: '100vh', position: 'sticky', top: 0,
      background: '#1C1E18',
      borderRight: '1px solid rgba(218,219,198,0.08)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
    }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ padding: '20px 16px 16px' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
          <div style={{ position: 'relative', width: '20px', height: '20px', flexShrink: 0 }}>
            {[
              { top: 0, left: '50%', transform: 'translateX(-50%)' },
              { top: '50%', left: 0, transform: 'translateY(-50%)' },
              { top: '50%', right: 0, transform: 'translateY(-50%)' },
              { bottom: 0, left: '50%', transform: 'translateX(-50%)' },
            ].map((s, i) => (
              <span key={i} style={{
                position: 'absolute', width: '6px', height: '6px', borderRadius: '50%',
                background: '#f27059', ...s,
              }} />
            ))}
          </div>
          <span style={{
            color: '#DADBC6', fontWeight: 700, fontSize: '12px',
            letterSpacing: '3px', textTransform: 'uppercase',
          }}>
            Mind Patch
          </span>
        </div>

        {/* Profile badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', borderRadius: '10px',
          background: 'rgba(218,219,198,0.05)',
          border: '1px solid rgba(218,219,198,0.08)',
          marginBottom: '12px',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${profile.color}33, ${profile.color}11)`,
            border: `1px solid ${profile.color}44`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px',
          }}>
            {userType === 'child' ? '🧒' : userType === 'adolescent' ? '🧑' : '👤'}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, color: '#DADBC6', fontSize: '12px', fontWeight: 600, lineHeight: 1.3 }}>
              {moduleLabel}
            </p>
            <span style={{
              display: 'inline-block', fontSize: '10px', fontWeight: 700,
              padding: '1px 7px', borderRadius: '999px',
              background: profile.bg, color: profile.color,
              border: `1px solid ${profile.color}33`,
              marginTop: '3px',
            }}>
              {profile.label}
            </span>
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={onBack}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
            background: 'transparent', border: '1px solid rgba(218,219,198,0.12)',
            borderRadius: '8px', color: 'rgba(218,219,198,0.40)', fontSize: '12px',
            padding: '7px 12px', cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#DADBC6'
            e.currentTarget.style.borderColor = 'rgba(218,219,198,0.25)'
            e.currentTarget.style.background = 'rgba(218,219,198,0.05)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'rgba(218,219,198,0.40)'
            e.currentTarget.style.borderColor = 'rgba(218,219,198,0.12)'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <BackIcon /> Volver al inicio
        </button>
      </div>

      {/* ── Divider ─────────────────────────────────────────────── */}
      <div style={{ height: '1px', background: 'rgba(218,219,198,0.07)', margin: '0 16px' }} />

      {/* ── Task list ───────────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        <p style={{
          color: 'rgba(218,219,198,0.28)', fontSize: '10px', letterSpacing: '2px',
          textTransform: 'uppercase', padding: '4px 6px 10px', margin: 0, fontWeight: 600,
        }}>
          Módulos
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {tasks.map(task => {
            const active = activeId === task.id
            const hasData = !!savedMetrics?.[task.id]
            const icon = TASK_ICONS[task.id] || '📋'
            return (
              <button
                type="button"
                key={task.id}
                onClick={() => onSelect(task)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '9px 10px', borderRadius: '10px', border: 'none',
                  background: active ? 'rgba(242,112,89,0.13)' : 'transparent',
                  cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s',
                  outline: active ? '1px solid rgba(242,112,89,0.22)' : '1px solid transparent',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(218,219,198,0.06)' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
              >
                {/* Icon box */}
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: active ? `${task.color}22` : 'rgba(218,219,198,0.07)',
                  border: `1px solid ${active ? task.color + '44' : 'rgba(218,219,198,0.09)'}`,
                  fontSize: '15px', transition: 'all 0.15s',
                }}>
                  {icon}
                </div>

                {/* Text */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{
                    color: active ? '#DADBC6' : 'rgba(218,219,198,0.60)',
                    fontSize: '13px', fontWeight: active ? 600 : 400,
                    display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    transition: 'color 0.15s',
                  }}>
                    {task.name}
                  </span>
                  <span style={{
                    color: 'rgba(218,219,198,0.30)', fontSize: '10px',
                    display: 'block', marginTop: '1px',
                  }}>
                    {task.duration}
                  </span>
                </div>

                {/* Saved dot */}
                {hasData && (
                  <span title={`Última sesión: ${formatSavedAt(savedMetrics[task.id].savedAt)}`} style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: '#f27059', flexShrink: 0,
                    boxShadow: '0 0 6px rgba(242,112,89,0.6)',
                  }} />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Divider ─────────────────────────────────────────────── */}
      <div style={{ height: '1px', background: 'rgba(218,219,198,0.07)', margin: '0 16px' }} />

      {/* ── Bottom actions ──────────────────────────────────────── */}
      <div style={{ padding: '10px 10px 6px' }}>
        <p style={{
          color: 'rgba(218,219,198,0.28)', fontSize: '10px', letterSpacing: '2px',
          textTransform: 'uppercase', padding: '4px 6px 8px', margin: 0, fontWeight: 600,
        }}>
          Herramientas
        </p>

        <NavBtn
          onClick={onToggleAnalysis}
          active={showAnalysis}
          activeColor="#10b981"
          activeBg="rgba(16,185,129,0.10)"
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke={showAnalysis ? '#10b981' : 'rgba(218,219,198,0.45)'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          }
          label="Análisis"
        />

        <NavBtn
          onClick={onToggleMap}
          active={showMap}
          activeColor="#BE7D57"
          activeBg="rgba(190,125,87,0.10)"
          icon={
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke={showMap ? '#BE7D57' : 'rgba(218,219,198,0.45)'}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          }
          label="Psicólogos cerca"
        />
      </div>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <div style={{
        padding: '10px 16px 16px',
        borderTop: '1px solid rgba(218,219,198,0.07)',
        marginTop: '4px',
      }}>
        {esMenor ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 10px', borderRadius: '8px',
            background: 'rgba(245,158,11,0.08)',
            border: '1px solid rgba(245,158,11,0.18)',
          }}>
            <span style={{ fontSize: '12px' }}>⚠️</span>
            <span style={{ color: 'rgba(245,158,11,0.85)', fontSize: '11px', fontWeight: 600 }}>
              Cuenta de menor
            </span>
          </div>
        ) : (
          <p style={{ color: 'rgba(218,219,198,0.25)', fontSize: '11px', margin: 0, lineHeight: 1.5 }}>
            Selecciona una tarea o usa la IA para comenzar.
          </p>
        )}
      </div>
    </aside>
  )
}
