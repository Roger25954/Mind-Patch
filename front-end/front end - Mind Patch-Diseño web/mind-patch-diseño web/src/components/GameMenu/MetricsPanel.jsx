import { motion } from 'framer-motion'
import { GAME_LABELS } from './constants'
import { formatSavedAt } from './utils'

function MetricRow({ label, value, highlight, muted }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '7px 0', borderBottom: '1px solid rgba(218,219,198,0.07)',
    }}>
      <span style={{ fontSize: '13px', color: muted ? 'rgba(218,219,198,0.3)' : 'rgba(218,219,198,0.6)' }}>
        {label}
      </span>
      <span style={{ fontSize: '13px', fontWeight: 600, color: highlight ? '#f27059' : '#DADBC6' }}>
        {value}
      </span>
    </div>
  )
}

function AstridMetrics({ metrics }) {
  const { resumen, resultados = [] } = metrics
  const total = resumen?.total_items ?? resultados.length
  const aciertos = resumen?.aciertos ?? resultados.filter(r => r.acierto === 'Sí').length
  const precision = total > 0 ? Math.round((aciertos / total) * 100) : 0

  const byTipo = resultados.reduce((acc, r) => {
    const t = r.tipo || 'Otro'
    if (!acc[t]) acc[t] = { total: 0, aciertos: 0 }
    acc[t].total++
    if (r.acierto === 'Sí') acc[t].aciertos++
    return acc
  }, {})

  return (
    <div>
      <MetricRow label="Precisión global" value={`${precision}%`} highlight />
      <MetricRow label="Aciertos" value={`${aciertos} / ${total}`} />
      {Object.entries(byTipo).length > 0 && (
        <div style={{ marginTop: '10px' }}>
          <p style={{ fontSize: '11px', color: 'rgba(218,219,198,0.35)', margin: '0 0 4px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Por tipo
          </p>
          {Object.entries(byTipo).map(([tipo, d]) => (
            <MetricRow key={tipo} label={tipo} value={`${d.aciertos}/${d.total} (${Math.round(d.aciertos / d.total * 100)}%)`} />
          ))}
        </div>
      )}
    </div>
  )
}

function AcademiaMetrics({ metrics }) {
  const secciones = [
    { key: 'letras',    label: 'Letras' },
    { key: 'palabras',  label: 'Palabras' },
    { key: 'oraciones', label: 'Oraciones' },
  ]
  return (
    <div>
      {secciones.map(s => {
        const m = metrics[s.key]
        if (!m || m.total === 0)
          return <MetricRow key={s.key} label={s.label} value="No completado" muted />
        return (
          <MetricRow
            key={s.key}
            label={s.label}
            value={`${m.precision}%  (${m.correctos}/${m.total})`}
            highlight={m === secciones[0]}
          />
        )
      })}
      {metrics.palabras?.disociacion !== undefined && (
        <MetricRow
          label="Disociación Real / Pseudo"
          value={`${metrics.palabras.disociacion > 0 ? '+' : ''}${metrics.palabras.disociacion} pts`}
        />
      )}
      {metrics.letras?.par_sistematico && (
        <MetricRow label="Par de confusión sistemático" value={metrics.letras.par_sistematico} />
      )}
    </div>
  )
}

function NovaDriveMetrics({ metrics }) {
  const total = metrics.totalTrials ?? 0
  const hits  = metrics.hits ?? 0
  const hitRate = total > 0 ? Math.round((hits / total) * 100) : 0
  return (
    <div>
      <MetricRow label="Tasa de aciertos" value={`${hitRate}%`} highlight />
      <MetricRow label="Estrellas capturadas" value={`${hits} / ${total}`} />
      <MetricRow label="Omisiones (inatención)" value={String(metrics.omissionErrors ?? 0)} />
      <MetricRow label="Errores de impulsividad" value={String(metrics.commissionErrors ?? 0)} />
      <MetricRow label="Tiempo de reacción medio" value={`${Math.round(metrics.averageRT_star ?? 0)} ms`} />
      <MetricRow label="Variabilidad (SD)" value={`${Math.round(metrics.rtVariability_star ?? 0)} ms`} />
    </div>
  )
}

export default function MetricsPanel({ gameId, metrics, onClose, onReplay, fromStorage, savedAt }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: 'absolute', inset: 0, zIndex: 30,
        background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        style={{
          background: '#1A1A10', border: '1px solid rgba(218,219,198,0.14)',
          borderRadius: '20px', padding: '28px 32px',
          maxWidth: '460px', width: '90%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.9)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
          <h2 style={{ color: '#DADBC6', fontSize: '1.2rem', fontFamily: "'DM Serif Display', serif", margin: 0, lineHeight: 1.2 }}>
            {fromStorage ? 'Última sesión guardada' : 'Sesión completada'}
          </h2>
          {fromStorage && (
            <span style={{
              fontSize: '10px', padding: '3px 8px', borderRadius: '999px',
              background: 'rgba(242,112,89,0.12)', border: '1px solid rgba(242,112,89,0.25)',
              color: '#f27059', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: '10px',
            }}>
              guardado
            </span>
          )}
        </div>
        <p style={{ color: 'rgba(218,219,198,0.4)', fontSize: '12px', margin: '0 0 4px' }}>
          {GAME_LABELS[gameId] || gameId}
        </p>
        {savedAt && (
          <p style={{ color: 'rgba(218,219,198,0.28)', fontSize: '11px', margin: '0 0 18px' }}>
            {formatSavedAt(savedAt)}
          </p>
        )}
        {!savedAt && <div style={{ marginBottom: '18px' }} />}

        {gameId === 'juego-astrid'   && <AstridMetrics   metrics={metrics} />}
        {gameId === 'academia-magia' && <AcademiaMetrics metrics={metrics} />}
        {gameId === 'nova-drive'     && <NovaDriveMetrics metrics={metrics} />}

        <div style={{ display: 'flex', gap: '10px', marginTop: '22px' }}>
          <button
            onClick={onReplay}
            style={{
              flex: 1, padding: '10px', borderRadius: '999px',
              border: '1px solid rgba(218,219,198,0.2)', background: 'transparent',
              color: 'rgba(218,219,198,0.65)', fontSize: '13px', fontWeight: 500,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Jugar de nuevo
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '10px', borderRadius: '999px',
              border: 'none', background: '#f27059',
              color: '#fff', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Volver al menú
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
