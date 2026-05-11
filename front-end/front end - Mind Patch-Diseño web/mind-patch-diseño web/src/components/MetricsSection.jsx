import { motion } from 'framer-motion'

// ─── SVG: Radar / Spider chart ────────────────────────────────────────────────
function RadarChart() {
  const cx = 130, cy = 130, r = 90
  const axes = ['Memoria', 'Atencion', 'Reaccion', 'Emocional', 'Enfoque']
  const scores = [0.78, 0.62, 0.74, 0.53, 0.68]
  const n = axes.length

  const pt = (i, ratio) => {
    const angle = (i * 2 * Math.PI / n) - Math.PI / 2
    return { x: cx + ratio * r * Math.cos(angle), y: cy + ratio * r * Math.sin(angle) }
  }
  const poly = (ratio) => Array.from({ length: n }, (_, i) => { const p = pt(i, ratio); return `${p.x},${p.y}` }).join(' ')
  const scoreD = scores.map((s, i) => { const p = pt(i, s); return `${p.x},${p.y}` }).join(' ')

  return (
    <svg viewBox="0 0 260 260" style={{ width: '100%', maxWidth: '260px' }}>
      {[0.25, 0.5, 0.75, 1].map((l, i) => (
        <polygon key={i} points={poly(l)} fill="none" stroke="rgba(47,47,47,0.15)" strokeWidth="1" />
      ))}
      {axes.map((_, i) => {
        const p = pt(i, 1)
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(47,47,47,0.15)" strokeWidth="1" />
      })}
      <polygon points={scoreD} fill="rgba(190,125,87,0.15)" stroke="#BE7D57" strokeWidth="1.5" strokeLinejoin="round" />
      {scores.map((s, i) => {
        const p = pt(i, s)
        return <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#BE7D57" />
      })}
      {axes.map((label, i) => {
        const p = pt(i, 1.25)
        return (
          <text key={i} x={p.x} y={p.y} textAnchor="middle" dominantBaseline="middle"
            fill="rgba(47,47,47,0.45)" fontSize="10" fontFamily="inherit">
            {label}
          </text>
        )
      })}
    </svg>
  )
}

// ─── SVG: Line chart ──────────────────────────────────────────────────────────
function LineChart() {
  const data = [28, 41, 36, 53, 58, 55, 70, 76]
  const W = 300, H = 90, px = 8, py = 10
  const min = 20, max = 85

  const x = (i) => px + (i / (data.length - 1)) * (W - px * 2)
  const y = (v) => py + ((max - v) / (max - min)) * (H - py * 2)

  const linePath = data.map((v, i) => {
    if (i === 0) return `M ${x(i)} ${y(v)}`
    const cx1 = (x(i - 1) + x(i)) / 2
    return `C ${cx1} ${y(data[i - 1])} ${cx1} ${y(v)} ${x(i)} ${y(v)}`
  }).join(' ')

  const areaPath = linePath + ` L ${x(data.length - 1)} ${H} L ${px} ${H} Z`

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', overflow: 'visible' }}>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#BE7D57" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#BE7D57" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((l, i) => (
        <line key={i}
          x1={px} y1={py + l * (H - py * 2)}
          x2={W - px} y2={py + l * (H - py * 2)}
          stroke="rgba(47,47,47,0.10)" strokeWidth="1" strokeDasharray="4 4"
        />
      ))}
      <path d={areaPath} fill="url(#lg)" />
      <path d={linePath} fill="none" stroke="#BE7D57" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((v, i) => (
        <circle key={i} cx={x(i)} cy={y(v)} r={i === data.length - 1 ? 3.5 : 2}
          fill={i === data.length - 1 ? '#BE7D57' : 'rgba(190,125,87,0.5)'} />
      ))}
    </svg>
  )
}

// ─── Barras horizontales animadas ─────────────────────────────────────────────
const bars = [
  { label: 'Memoria de trabajo',    value: 78, color: '#BE7D57' },
  { label: 'Velocidad de reaccion', value: 74, color: '#9A9F82' },
  { label: 'Atencion sostenida',    value: 68, color: '#8b5cf6' },
  { label: 'Estado emocional',      value: 53, color: '#10b981' },
  { label: 'Control cognitivo',     value: 62, color: '#f59e0b' },
]

function BarRows() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>
      {bars.map((bar, i) => (
        <div key={bar.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: 'rgba(47,47,47,0.60)', fontSize: '12px' }}>{bar.label}</span>
            <span style={{ color: 'rgba(47,47,47,0.40)', fontSize: '12px' }}>{bar.value}%</span>
          </div>
          <div style={{ height: '3px', background: 'rgba(47,47,47,0.10)', borderRadius: '999px', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${bar.value}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1.1, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              style={{ height: '100%', background: bar.color, borderRadius: '999px' }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Cards de métricas ────────────────────────────────────────────────────────
const metricCards = [
  { label: '01', title: 'Velocidad cognitiva',  desc: 'Medimos el tiempo de respuesta ante estímulos visuales para evaluar la agilidad de procesamiento de tu mente.',         color: '#BE7D57' },
  { label: '02', title: 'Memoria de trabajo',   desc: 'Evaluamos cuánta información puedes retener y manipular activamente en un período corto de tiempo.',                    color: '#9A9F82' },
  { label: '03', title: 'Estado emocional',     desc: 'A través de cuestionarios clínicos validados detectamos tu nivel de ansiedad y bienestar emocional.',                   color: '#10b981' },
  { label: '04', title: 'Concentracion',        desc: 'Tareas de atención selectiva que miden tu capacidad para ignorar distractores y mantener el foco.',                    color: '#f59e0b' },
]

// ─── Componente principal ─────────────────────────────────────────────────────
export function MetricsSection() {
  return (
    <section
      id="como-funciona"
      style={{
        background: '#DADBC6',
        padding: '100px 0 120px',
        borderTop: '1px solid rgba(47,47,47,0.08)',
      }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ marginBottom: '64px' }}
        >
          <span style={{ fontSize: '12px', color: 'rgba(47,47,47,0.45)', letterSpacing: '3px', textTransform: 'uppercase' }}>
            Metodologia
          </span>
          <h2 style={{
            marginTop: '16px',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 700, color: '#2F2F2F',
            letterSpacing: '-0.02em', lineHeight: 1.2,
            margin: '16px 0 0',
          }}>
            Como medimos<br />
            <span style={{ color: 'rgba(47,47,47,0.45)' }}>tu rendimiento mental</span>
          </h2>
          <p style={{ marginTop: '16px', color: 'rgba(47,47,47,0.55)', fontSize: '17px', lineHeight: 1.7, maxWidth: '500px' }}>
            Cada sesion genera un perfil cognitivo unico basado en cuatro dimensiones clave, procesadas en tiempo real por nuestra IA.
          </p>
        </motion.div>

        {/* Cards de métricas */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '48px',
        }}>
          {metricCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              style={{
                background: 'rgba(47,47,47,0.04)',
                border: '1px solid rgba(47,47,47,0.12)',
                borderRadius: '16px',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: card.color, boxShadow: `0 0 10px ${card.color}80`,
                }} />
                <span style={{ color: 'rgba(47,47,47,0.25)', fontSize: '12px', fontWeight: 600, letterSpacing: '1px' }}>
                  {card.label}
                </span>
              </div>
              <h3 style={{ color: '#2F2F2F', fontSize: '15px', fontWeight: 600, margin: '0 0 10px' }}>
                {card.title}
              </h3>
              <p style={{ color: 'rgba(47,47,47,0.55)', fontSize: '13px', lineHeight: 1.7, margin: 0 }}>
                {card.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Gráficas */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}
        >

          {/* Panel: Perfil cognitivo (radar) */}
          <div style={{
            flex: '1', minWidth: '280px',
            background: 'rgba(47,47,47,0.04)',
            border: '1px solid rgba(47,47,47,0.12)',
            borderRadius: '20px',
            padding: '28px',
          }}>
            <span style={{ color: 'rgba(47,47,47,0.40)', fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
              Perfil cognitivo
            </span>
            <h3 style={{ color: '#2F2F2F', fontSize: '15px', fontWeight: 600, margin: '10px 0 24px' }}>
              Mapa de fortalezas
            </h3>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <RadarChart />
            </div>
            <p style={{ color: 'rgba(47,47,47,0.35)', fontSize: '11px', textAlign: 'center', margin: '16px 0 0' }}>
              Generado a partir de tus evaluaciones
            </p>
          </div>

          {/* Panel derecho: lineal + barras */}
          <div style={{ flex: '1.4', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Line chart */}
            <div style={{
              background: 'rgba(47,47,47,0.04)',
              border: '1px solid rgba(47,47,47,0.12)',
              borderRadius: '20px',
              padding: '28px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                <div>
                  <span style={{ color: 'rgba(47,47,47,0.40)', fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
                    Progreso
                  </span>
                  <h3 style={{ color: '#2F2F2F', fontSize: '15px', fontWeight: 600, margin: '8px 0 0' }}>
                    Rendimiento por sesion
                  </h3>
                </div>
                <span style={{
                  padding: '4px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 500,
                  background: 'rgba(16,185,129,0.12)', color: '#10b981',
                }}>
                  +48% este mes
                </span>
              </div>
              <LineChart />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                {['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'].map(s => (
                  <span key={s} style={{ color: 'rgba(47,47,47,0.35)', fontSize: '10px' }}>{s}</span>
                ))}
              </div>
            </div>

            {/* Barras de dimensiones */}
            <div style={{
              background: 'rgba(47,47,47,0.04)',
              border: '1px solid rgba(47,47,47,0.12)',
              borderRadius: '20px',
              padding: '28px',
            }}>
              <span style={{ color: 'rgba(47,47,47,0.40)', fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase' }}>
                Dimensiones
              </span>
              <h3 style={{ color: '#2F2F2F', fontSize: '15px', fontWeight: 600, margin: '10px 0 20px' }}>
                Puntuacion por area
              </h3>
              <BarRows />
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  )
}
