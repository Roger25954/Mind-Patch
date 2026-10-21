import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { formatSavedAt } from './utils'

const perfColor = pct => pct >= 80 ? '#10b981' : pct >= 55 ? '#f59e0b' : '#ef4444'

function CircleGauge({ pct, color, size = 82, stroke = 9, label }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(100, Math.max(0, pct)) / 100)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', display: 'block' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(47,47,47,0.08)" strokeWidth={stroke} />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
            strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.9s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '16px', fontWeight: 700, color: 'rgba(47,47,47,0.85)' }}>{Math.round(pct)}%</span>
        </div>
      </div>
      {label && <span style={{ fontSize: '10px', color: 'rgba(47,47,47,0.45)', textAlign: 'center', maxWidth: '84px', lineHeight: 1.3 }}>{label}</span>}
    </div>
  )
}

function Hbar({ label, value, max, unit = '', color = '#f27059' }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '9px' }}>
      <span style={{ fontSize: '12px', color: 'rgba(47,47,47,0.5)', minWidth: '160px', flexShrink: 0 }}>{label}</span>
      <div style={{ flex: 1, height: '5px', borderRadius: '3px', background: 'rgba(47,47,47,0.08)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.7s ease' }} />
      </div>
      <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(47,47,47,0.70)', minWidth: '52px', textAlign: 'right' }}>
        {value}{unit}
      </span>
    </div>
  )
}

function AnalysisCard({ color, title, subtitle, savedAt, children }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '18px',
      border: '1px solid rgba(47,47,47,0.09)',
      boxShadow: '0 2px 12px rgba(47,47,47,0.06)',
      marginBottom: '20px', overflow: 'hidden',
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 22px 14px',
        borderBottom: '1px solid rgba(47,47,47,0.07)',
        background: 'rgba(47,47,47,0.015)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color }} />
          <div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'rgba(47,47,47,0.85)' }}>{title}</p>
            <p style={{ margin: 0, fontSize: '11px', color: 'rgba(47,47,47,0.4)', marginTop: '1px' }}>{subtitle}</p>
          </div>
        </div>
        {savedAt && (
          <span style={{ fontSize: '10px', color: 'rgba(47,47,47,0.35)', background: 'rgba(47,47,47,0.05)', borderRadius: '999px', padding: '3px 8px' }}>
            {formatSavedAt(savedAt)}
          </span>
        )}
      </div>
      <div style={{ padding: '20px 22px 18px' }}>{children}</div>
    </div>
  )
}

function InterpretBox({ lines }) {
  return (
    <div style={{
      marginTop: '16px', padding: '12px 14px', borderRadius: '10px',
      background: 'rgba(47,47,47,0.03)', border: '1px solid rgba(47,47,47,0.07)',
    }}>
      <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 600, color: 'rgba(47,47,47,0.45)', letterSpacing: '1px', textTransform: 'uppercase' }}>
        Interpretación
      </p>
      {lines.map((l, i) => (
        <p key={i} style={{ margin: '3px 0', fontSize: '12px', color: 'rgba(47,47,47,0.6)', lineHeight: 1.5 }}>{l}</p>
      ))}
    </div>
  )
}

function NovaDriveChart({ metrics: m }) {
  const targets   = (m.hits ?? 0) + (m.misses ?? 0)
  const hitRate   = targets > 0 ? Math.round((m.hits / targets) * 100) : 0
  const distractors = (m.commissionErrors ?? 0) + (m.correctRejections ?? 0)
  const inhibRate = distractors > 0 ? Math.round((m.correctRejections / distractors) * 100) : 100
  const avgRT     = Math.round(m.averageRT_star ?? 0)
  const sdRT      = Math.round(m.rtVariability_star ?? 0)

  const radarData = [
    { metric: 'Detección',    valor: hitRate },
    { metric: 'Inhibición',   valor: inhibRate },
    { metric: 'Velocidad',    valor: Math.max(0, Math.min(100, Math.round(100 - ((avgRT - 200) / 8)))) },
    { metric: 'Consistencia', valor: Math.max(0, Math.min(100, Math.round(100 - sdRT / 5))) },
  ]

  const interp = []
  if (hitRate < 60)   interp.push(`· Tasa de detección baja (${hitRate}%): posibles dificultades de atención sostenida.`)
  if (hitRate >= 80)  interp.push(`· Excelente detección de estímulos (${hitRate}%): atención sostenida conservada.`)
  if (inhibRate < 70) interp.push(`· Control de impulsos reducido (${inhibRate}%): tendencia a responder ante distractores.`)
  if (avgRT > 600)    interp.push(`· Tiempo de reacción elevado (${avgRT} ms): posible lentitud de procesamiento.`)
  if (sdRT > 150)     interp.push(`· Alta variabilidad en la respuesta (SD ${sdRT} ms): atención inconsistente.`)
  if (interp.length === 0) interp.push('· Rendimiento dentro de los parámetros esperados.')

  return (
    <>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <CircleGauge pct={hitRate}   color={perfColor(hitRate)}   label="Detección" />
          <CircleGauge pct={inhibRate} color={perfColor(inhibRate)} label="Inhibición" />
        </div>
        <div style={{ flex: 1, minWidth: '240px' }}>
          <ResponsiveContainer width="100%" height={160}>
            <RadarChart data={radarData} outerRadius={55}>
              <PolarGrid stroke="rgba(47,47,47,0.08)" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: 'rgba(47,47,47,0.5)' }} />
              <PolarRadiusAxis domain={[0,100]} tick={false} axisLine={false} />
              <Radar dataKey="valor" stroke="#10b981" fill="#10b981" fillOpacity={0.18} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div style={{ marginTop: '14px' }}>
        <Hbar label="Tiempo de reacción (ms)" value={avgRT} max={1000} unit=" ms" color={avgRT < 400 ? '#10b981' : avgRT < 650 ? '#f59e0b' : '#ef4444'} />
        <Hbar label="Variabilidad SD (ms)"     value={sdRT}  max={400}  unit=" ms" color={sdRT < 100 ? '#10b981' : sdRT < 200 ? '#f59e0b' : '#ef4444'} />
        <Hbar label="Errores de comisión"       value={m.commissionErrors ?? 0} max={m.totalTrials ?? 100} color="#ef4444" />
        <Hbar label="Omisiones (inatención)"    value={m.misses ?? 0}           max={targets || 1}         color="#f59e0b" />
      </div>
      <InterpretBox lines={interp} />
    </>
  )
}

function AcademiaChart({ metrics: m }) {
  const salas = [
    { key: 'letras',    label: 'Letras',    color: '#7ec8e3' },
    { key: 'palabras',  label: 'Palabras',  color: '#88ffcc' },
    { key: 'oraciones', label: 'Oraciones', color: '#ffcc88' },
  ]

  const barData = salas
    .filter(s => m[s.key] && m[s.key].total > 0)
    .map(s => ({
      name: s.label,
      Precisión: parseInt(m[s.key].precision) || 0,
      fill: perfColor(parseInt(m[s.key].precision) || 0),
    }))

  const interp = []
  salas.forEach(({ key, label }) => {
    const d = m[key]
    if (!d || d.total === 0) { interp.push(`· ${label}: prueba no realizada.`); return }
    const p = parseInt(d.precision) || 0
    if (p < 55) interp.push(`· ${label}: precisión baja (${p}%) — posibles dificultades de reconocimiento.`)
    else if (p >= 80) interp.push(`· ${label}: precisión alta (${p}%) — habilidad bien desarrollada.`)
    else interp.push(`· ${label}: rendimiento moderado (${p}%).`)
  })

  const palabras = m.palabras
  if (palabras?.disociacion !== undefined && Math.abs(palabras.disociacion) >= 10) {
    interp.push(`· Disociación real/pseudopalabra: ${palabras.disociacion > 0 ? '+' : ''}${palabras.disociacion} pts — indicador de ruta léxica vs fonológica.`)
  }

  return (
    <>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {salas.filter(s => m[s.key] && m[s.key].total > 0).map(s => (
          <div key={s.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <CircleGauge pct={parseInt(m[s.key].precision) || 0} color={perfColor(parseInt(m[s.key].precision) || 0)} label={s.label} />
            <span style={{ fontSize: '10px', color: 'rgba(47,47,47,0.4)' }}>{m[s.key].velMedia} ms</span>
          </div>
        ))}
        {barData.length > 0 && (
          <div style={{ flex: 1, minWidth: '200px' }}>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={barData} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(47,47,47,0.06)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgba(47,47,47,0.5)' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0,100]} tick={{ fontSize: 10, fill: 'rgba(47,47,47,0.4)' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={v => [`${v}%`, 'Precisión']} contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid rgba(47,47,47,0.1)' }} />
                <Bar dataKey="Precisión" radius={[4,4,0,0]} fill="#f27059" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <InterpretBox lines={interp} />
    </>
  )
}

function AstridChart({ metrics: m }) {
  const total    = m.resumen?.total_items ?? m.resultados?.length ?? 0
  const aciertos = m.resumen?.aciertos   ?? m.resultados?.filter(r => r.acierto === 'Sí').length ?? 0
  const errores  = total - aciertos
  const precPct  = total > 0 ? Math.round((aciertos / total) * 100) : 0

  const byTipo = {}
  if (Array.isArray(m.resultados)) {
    m.resultados.forEach(r => {
      const t = r.tipo || 'General'
      if (!byTipo[t]) byTipo[t] = { total: 0, aciertos: 0 }
      byTipo[t].total++
      if (r.acierto === 'Sí') byTipo[t].aciertos++
    })
  }
  const tipoData = Object.entries(byTipo).map(([tipo, d]) => ({
    name: tipo.length > 18 ? tipo.slice(0,16) + '…' : tipo,
    Precisión: Math.round((d.aciertos / d.total) * 100),
  }))

  const interp = []
  if (precPct >= 80) interp.push(`· Precisión alta (${precPct}%): habilidades numéricas bien desarrolladas.`)
  else if (precPct >= 55) interp.push(`· Precisión moderada (${precPct}%): algunas dificultades en habilidades numéricas.`)
  else interp.push(`· Precisión baja (${precPct}%): posibles indicadores de dificultades en discalculia.`)

  const tiposMalos = Object.entries(byTipo).filter(([,d]) => d.aciertos/d.total < 0.5)
  if (tiposMalos.length > 0) interp.push(`· Tipos con más errores: ${tiposMalos.map(([t]) => t).join(', ')}.`)

  return (
    <>
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <CircleGauge pct={precPct} color={perfColor(precPct)} label="Precisión total" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', justifyContent: 'center', flex: 1 }}>
          <Hbar label="Aciertos" value={aciertos} max={total} color="#10b981" unit={` / ${total}`} />
          <Hbar label="Errores"  value={errores}  max={total} color="#ef4444" />
        </div>
        {tipoData.length > 1 && (
          <div style={{ flex: 1, minWidth: '200px' }}>
            <p style={{ margin: '0 0 8px', fontSize: '11px', color: 'rgba(47,47,47,0.45)', letterSpacing: '0.5px' }}>Precisión por tipo de ejercicio</p>
            <ResponsiveContainer width="100%" height={Math.min(tipoData.length * 34 + 10, 180)}>
              <BarChart data={tipoData} layout="vertical" barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(47,47,47,0.06)" horizontal={false} />
                <XAxis type="number" domain={[0,100]} tick={{ fontSize: 10, fill: 'rgba(47,47,47,0.4)' }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={90} tick={{ fontSize: 10, fill: 'rgba(47,47,47,0.5)' }} axisLine={false} tickLine={false} />
                <Tooltip formatter={v => [`${v}%`, 'Precisión']} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="Precisión" radius={[0,4,4,0]} fill="#BE7D57" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <InterpretBox lines={interp} />
    </>
  )
}

function AsrsChart({ metrics: m }) {
  const shaded = m.shadedCount ?? 0
  const total  = m.totalAnswered ?? Object.keys(m.answers ?? {}).length ?? 18
  const pct    = Math.round((shaded / 6) * 100)
  const interp = []
  if (shaded >= 4) interp.push(`· ${shaded}/6 indicadores clave marcados — sugiere exploración adicional para TDAH.`)
  else if (shaded >= 2) interp.push(`· ${shaded}/6 indicadores clave marcados — algunos síntomas presentes, seguimiento recomendado.`)
  else interp.push(`· ${shaded}/6 indicadores clave marcados — sin señales de alerta significativas en Parte A.`)
  if (total < 18) interp.push(`· Cuestionario parcial (${total}/18 preguntas respondidas).`)
  return (
    <>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
        <CircleGauge pct={pct} color={shaded >= 4 ? '#ef4444' : shaded >= 2 ? '#f59e0b' : '#10b981'} label={`${shaded}/6 indicadores`} />
        <div style={{ flex: 1 }}>
          <Hbar label="Indicadores clave (Parte A)" value={shaded} max={6} color={shaded >= 4 ? '#ef4444' : '#f59e0b'} unit={` / 6`} />
          <Hbar label="Preguntas respondidas"       value={total}  max={18} color="#10b981" unit={` / 18`} />
        </div>
      </div>
      <InterpretBox lines={interp} />
    </>
  )
}

function DyslexiaChart({ metrics: m }) {
  const count = m.count ?? 0
  const total = m.total ?? 20
  const pct   = Math.round((count / total) * 100)
  const interp = []
  if (count >= 10) interp.push(`· ${count}/${total} ítems presentes — perfil compatible con indicadores de dislexia. Se recomienda evaluación clínica.`)
  else if (count >= 5) interp.push(`· ${count}/${total} ítems presentes — algunos indicadores de dislexia. Monitoreo recomendado.`)
  else interp.push(`· ${count}/${total} ítems presentes — sin señales de alerta significativas.`)
  return (
    <>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
        <CircleGauge pct={pct} color={count >= 10 ? '#ef4444' : count >= 5 ? '#f59e0b' : '#10b981'} label={`${count}/${total} ítems`} />
        <div style={{ flex: 1 }}>
          <Hbar label="Indicadores presentes" value={count} max={total} color={count >= 10 ? '#ef4444' : '#f59e0b'} unit={` / ${total}`} />
        </div>
      </div>
      <InterpretBox lines={interp} />
    </>
  )
}

function StroopChart({ metrics: m }) {
  const accPct = m.acc ?? 0
  const mean   = Math.round(m.mean ?? 0)
  const errs   = m.errs ?? 0
  const interp = []
  if (accPct >= 85) interp.push(`· Precisión alta (${accPct}%): buen control inhibitorio.`)
  else if (accPct >= 65) interp.push(`· Precisión moderada (${accPct}%): interferencia Stroop presente.`)
  else interp.push(`· Precisión baja (${accPct}%): dificultades en control inhibitorio.`)
  if (mean > 700) interp.push(`· Tiempo de respuesta elevado (${mean} ms): posible lentitud en procesamiento cognitivo.`)
  return (
    <>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <CircleGauge pct={accPct} color={perfColor(accPct)} label="Precisión" />
        <div style={{ flex: 1 }}>
          <Hbar label="Tiempo de respuesta (ms)" value={mean} max={1200} unit=" ms" color={mean < 500 ? '#10b981' : mean < 800 ? '#f59e0b' : '#ef4444'} />
          <Hbar label="Errores" value={errs} max={20} color="#ef4444" />
        </div>
      </div>
      <InterpretBox lines={interp} />
    </>
  )
}

function SubitizingChart({ metrics: m }) {
  const accPct = m.acc ?? 0
  const mean   = Math.round(m.mean ?? 0)
  const risk   = m.risk ?? ''
  const smallE = m.smallErrs ?? 0
  const riskColor = risk === 'Alto' ? '#ef4444' : risk === 'Medio' ? '#f59e0b' : '#10b981'
  const interp = []
  if (risk) interp.push(`· Riesgo de discalculia: ${risk}.`)
  if (smallE > 2) interp.push(`· ${smallE} errores en cantidades pequeñas (1–3): posible dificultad de subitización.`)
  if (accPct >= 80) interp.push(`· Precisión general alta (${accPct}%).`)
  else interp.push(`· Precisión general: ${accPct}%.`)
  return (
    <>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <CircleGauge pct={accPct} color={perfColor(accPct)} label="Precisión" />
        <div style={{ flex: 1 }}>
          <Hbar label="Tiempo medio (ms)"      value={mean}   max={2000} unit=" ms" color={mean < 800 ? '#10b981' : mean < 1400 ? '#f59e0b' : '#ef4444'} />
          <Hbar label="Errores en 1–3 puntos"  value={smallE} max={18}   color="#ef4444" />
        </div>
        {risk && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: `${riskColor}18`, border: `2px solid ${riskColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: riskColor }}>{risk}</span>
            </div>
            <span style={{ fontSize: '10px', color: 'rgba(47,47,47,0.45)' }}>Riesgo</span>
          </div>
        )}
      </div>
      <InterpretBox lines={interp} />
    </>
  )
}

function LexicalChart({ metrics: m }) {
  const accPct = m.acc ?? 0
  const rtW    = Math.round(m.rtW ?? 0)
  const rtP    = Math.round(m.rtP ?? 0)
  const fp     = m.fp ?? 0
  const interp = []
  if (accPct >= 85) interp.push(`· Precisión alta (${accPct}%): reconocimiento léxico adecuado.`)
  else if (accPct >= 65) interp.push(`· Precisión moderada (${accPct}%): algunas dificultades en decisión léxica.`)
  else interp.push(`· Precisión baja (${accPct}%): posibles dificultades de reconocimiento de palabras.`)
  if (rtP > rtW + 200) interp.push(`· Mayor latencia en pseudopalabras (${rtP} ms vs ${rtW} ms): uso de ruta léxica adecuado.`)
  if (fp > 5) interp.push(`· ${fp} falsos positivos en pseudopalabras — tendencia a aceptar palabras no reales.`)
  return (
    <>
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <CircleGauge pct={accPct} color={perfColor(accPct)} label="Precisión" />
        <div style={{ flex: 1 }}>
          <Hbar label="TR palabras reales (ms)"   value={rtW} max={1500} unit=" ms" color={rtW < 600 ? '#10b981' : rtW < 900 ? '#f59e0b' : '#ef4444'} />
          <Hbar label="TR pseudopalabras (ms)"    value={rtP} max={1500} unit=" ms" color={rtP < 800 ? '#10b981' : rtP < 1100 ? '#f59e0b' : '#ef4444'} />
          <Hbar label="Falsos positivos"          value={fp}  max={20}   color="#ef4444" />
        </div>
      </div>
      <InterpretBox lines={interp} />
    </>
  )
}

const MINOR_GAME_IDS = ['nova-drive', 'academia-magia', 'juego-astrid']
const ADULT_TASK_IDS = ['asrs', 'dyslexia', 'stroop', 'subit', 'lexical']

export default function AnalysisPanel({ savedMetrics, isAdultModule }) {
  const allGames = [
    { id: 'nova-drive',     label: 'Nova Drive',               sub: 'Atención sostenida e impulsividad',    color: '#10b981', Chart: NovaDriveChart  },
    { id: 'academia-magia', label: 'Academia de la Magia',     sub: 'Lectura — PROLEC-R',                   color: '#3b82f6', Chart: AcademiaChart   },
    { id: 'juego-astrid',   label: 'Mercadito de monstruos',   sub: 'Habilidades numéricas — Discalculia',  color: '#BE7D57', Chart: AstridChart     },
    { id: 'asrs',           label: 'ASRS v1.1',                sub: 'Tamizaje TDAH — Autoinforme',          color: '#10b981', Chart: AsrsChart       },
    { id: 'dyslexia',       label: 'Lista de Dislexia',        sub: 'Indicadores de dislexia',              color: '#3b82f6', Chart: DyslexiaChart   },
    { id: 'stroop',         label: 'Tarea Stroop',             sub: 'Control inhibitorio — Atención',       color: '#f59e0b', Chart: StroopChart     },
    { id: 'subit',          label: 'Subitización',             sub: 'Habilidades numéricas básicas',        color: '#BE7D57', Chart: SubitizingChart },
    { id: 'lexical',        label: 'Decisión Léxica',          sub: 'Reconocimiento de palabras',           color: '#ef4444', Chart: LexicalChart    },
  ]

  const allowedIds = isAdultModule ? ADULT_TASK_IDS : MINOR_GAME_IDS
  const games      = allGames.filter(g => allowedIds.includes(g.id))
  const available  = games.filter(g => savedMetrics[g.id])

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: '#DADBC6' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 24px 40px' }}>

        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ margin: '0 0 6px', fontSize: '1.6rem', fontWeight: 700, color: '#2F2F2F', letterSpacing: '-0.02em' }}>
            Análisis de rendimiento
          </h2>
          <p style={{ margin: 0, fontSize: '14px', color: 'rgba(47,47,47,0.5)', lineHeight: 1.6 }}>
            Resultados acumulados de tus evaluaciones. Los datos se guardan localmente tras completar cada juego.
          </p>
        </div>

        {available.length === 0 && (
          <div style={{ textAlign: 'center', paddingTop: '60px', color: 'rgba(47,47,47,0.4)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📊</div>
            <p style={{ fontWeight: 600, fontSize: '15px', margin: '0 0 8px', color: 'rgba(47,47,47,0.55)' }}>
              Aún no hay datos para analizar
            </p>
            <p style={{ fontSize: '13px', margin: 0, lineHeight: 1.6 }}>
              Completa al menos una evaluación o juego para ver tu análisis aquí.
            </p>
          </div>
        )}

        {available.map(({ id, label, sub, color, Chart }) => {
          const { metrics, savedAt } = savedMetrics[id]
          return (
            <AnalysisCard key={id} title={label} subtitle={sub} color={color} savedAt={savedAt}>
              <Chart metrics={metrics} />
            </AnalysisCard>
          )
        })}

        {available.length > 0 && (
          <p style={{ fontSize: '11px', color: 'rgba(47,47,47,0.3)', textAlign: 'center', marginTop: '4px', lineHeight: 1.7 }}>
            Este análisis es orientativo y no sustituye una evaluación clínica profesional.
          </p>
        )}
      </div>
    </div>
  )
}
