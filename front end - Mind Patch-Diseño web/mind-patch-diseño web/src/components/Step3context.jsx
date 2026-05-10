// components/onboarding/Step3Context.jsx
import { useState } from 'react'
import { getAgeMismatchMessage } from '../utils/ageModuleValidation'

const inputStyle = {
  width: '100%', padding: '9px 12px',
  border: '1px solid rgba(218,219,198,0.18)', borderRadius: '10px',
  fontSize: '13px', color: '#DADBC6', background: 'rgba(218,219,198,0.05)',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <label style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(218,219,198,0.5)', display: 'block', marginBottom: '5px', letterSpacing: '1px', textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      style={{ ...inputStyle, ...props.style }}
      onFocus={e => e.target.style.borderColor = 'rgba(218,219,198,0.35)'}
      onBlur={e => e.target.style.borderColor = 'rgba(218,219,198,0.18)'}
    />
  )
}

function Select({ children, ...props }) {
  return (
    <select
      {...props}
      style={{ ...inputStyle, appearance: 'none' }}
      onFocus={e => e.target.style.borderColor = 'rgba(218,219,198,0.35)'}
      onBlur={e => e.target.style.borderColor = 'rgba(218,219,198,0.18)'}
    >
      {children}
    </select>
  )
}

function SliderRow({ label, minLabel, maxLabel, value, onChange }) {
  const pct = ((value - 1) / 4) * 100
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'rgba(218,219,198,0.6)', marginBottom: '5px' }}>
        <span>{label}</span>
        <span style={{ fontWeight: 600, color: '#f27059' }}>{value}/5</span>
      </div>
      <input
        type="range" min="1" max="5" value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          WebkitAppearance: 'none', width: '100%', height: '4px', borderRadius: '2px', outline: 'none', cursor: 'pointer',
          background: `linear-gradient(to right, #f27059 ${pct}%, rgba(218,219,198,0.15) ${pct}%)`,
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(218,219,198,0.3)', marginTop: '3px' }}>
        <span>{minLabel}</span><span>{maxLabel}</span>
      </div>
    </div>
  )
}

const REASONS_ADULT = [
  'Dificultades de atención o concentración',
  'Dificultades de lectura o escritura',
  'Dificultades con matemáticas o números',
  'Organización y planificación',
  'Memoria y olvidos frecuentes',
  'Curiosidad general / autoconocimiento',
  'Recomendación de un profesional',
  'Otro',
]

const REASONS_MINOR = [
  'Dificultades para seguir instrucciones en clase',
  'Problemas de lectura o escritura',
  'Dificultades con números o matemáticas',
  'Problemas de atención o hiperactividad',
  'Recomendación de un psicólogo o maestro',
  'Retraso en el desarrollo detectado',
  'Curiosidad / evaluación preventiva',
  'Otro',
]

export default function Step3Context({ onNext, onBack, data, setData }) {
  const isChild  = data.userType === 'child'
  const isAdult  = data.userType === 'adult'
  const reasons  = isAdult ? REASONS_ADULT : REASONS_MINOR

  const [ageError, setAgeError] = useState('')

  const ageFilled = data.age !== '' && data.age != null && !Number.isNaN(Number(String(data.age).trim()))
  const canContinue = Boolean(data.reason) && ageFilled

  const set      = (key) => (e) => setData(d => ({ ...d, [key]: e.target.value }))
  const setSlider = (key) => (v) => setData(d => ({ ...d, [key]: v }))

  const handleSubmit = () => {
    const err = getAgeMismatchMessage(data.userType, data.age)
    if (err) {
      setAgeError(err)
      return
    }
    setAgeError('')
    onNext()
  }

  return (
    <div>
      <div style={{ marginBottom: '16px', marginTop: '12px' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.5rem', color: '#DADBC6', margin: '0 0 6px', lineHeight: 1.2 }}>
          {isChild ? 'Cuéntanos sobre el menor' : 'Cuéntanos un poco sobre ti'}
        </h2>
        <p style={{ fontSize: '13px', color: 'rgba(218,219,198,0.5)', margin: 0, lineHeight: 1.6 }}>
          {isChild
            ? 'Esta información ayuda a adaptar la evaluación al perfil del niño o niña.'
            : 'Ayuda al sistema a adaptar la exploración y contextualizar los resultados.'}
        </p>
      </div>

      <div style={{ background: 'rgba(218,219,198,0.04)', borderRadius: '14px', padding: '14px', marginBottom: '4px', border: '1px solid rgba(218,219,198,0.1)' }}>

        {isChild ? (
          <Field label="Edad del niño o niña (4–11 años)">
            <Input
              type="number" min="4" max="11" placeholder="Ej. 8"
              value={data.age} onChange={(e) => { setAgeError(''); set('age')(e) }}
            />
          </Field>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Field label={isAdult ? 'Edad (18 o más)' : 'Edad (11–17 años)'}>
              <Input
                type="number" min={isAdult ? 18 : 11} max={isAdult ? 120 : 17}
                placeholder={isAdult ? 'Ej. 32' : 'Ej. 15'}
                value={data.age} onChange={(e) => { setAgeError(''); set('age')(e) }}
              />
            </Field>
            <Field label="Género (opcional)">
              <Select value={data.gender} onChange={set('gender')}>
                <option value="">Prefiero no decir</option>
                <option>Mujer</option>
                <option>Hombre</option>
                <option>No binario</option>
                <option>Otro</option>
              </Select>
            </Field>
          </div>
        )}

        {!isChild && (
          <Field label="Nivel de escolaridad">
            <Select value={data.education} onChange={set('education')}>
              <option value="">Selecciona...</option>
              {isAdult
                ? <>
                    <option>Primaria</option>
                    <option>Secundaria</option>
                    <option>Preparatoria</option>
                    <option>Universidad en curso</option>
                    <option>Licenciatura</option>
                    <option>Posgrado</option>
                    <option>Sin escolaridad formal</option>
                  </>
                : <>
                    <option>Primaria</option>
                    <option>Secundaria</option>
                    <option>Preparatoria</option>
                    <option>Sin escolaridad formal</option>
                  </>
              }
            </Select>
          </Field>
        )}

        {isAdult && (
          <Field label="Ocupación actual (opcional)">
            <Input
              type="text" placeholder="Ej. estudiante, docente, ingeniero..."
              value={data.job} onChange={set('job')}
            />
          </Field>
        )}

        <Field label={isChild ? 'Motivo de la evaluación (según el tutor)' : 'Motivo principal de esta exploración'}>
          <Select value={data.reason} onChange={set('reason')}>
            <option value="">Selecciona el que más se acerque...</option>
            {reasons.map(r => <option key={r}>{r}</option>)}
          </Select>
        </Field>

        <div style={{ marginTop: '4px' }}>
          <div style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(218,219,198,0.5)', marginBottom: '10px', letterSpacing: '1px', textTransform: 'uppercase' }}>
            {isChild ? 'Niveles observados por el tutor' : 'Niveles actuales'}
          </div>
          <SliderRow label="Calidad del sueño"      minLabel="Muy malo"  maxLabel="Excelente" value={data.sleep}     onChange={setSlider('sleep')} />
          <SliderRow label="Nivel de ansiedad"      minLabel="Ninguna"   maxLabel="Muy alta"  value={data.anxiety}   onChange={setSlider('anxiety')} />
          <SliderRow label="Dificultad de atención" minLabel="Ninguna"   maxLabel="Muy alta"  value={data.attention} onChange={setSlider('attention')} />
        </div>
      </div>

      {ageError && (
        <div
          role="alert"
          style={{
            marginTop: '12px',
            padding: '10px 12px',
            borderRadius: '10px',
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444',
            fontSize: '12px',
            lineHeight: 1.5,
          }}
        >
          {ageError}
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
        <button
          onClick={onBack}
          style={{
            flex: 1, padding: '11px', borderRadius: '999px',
            border: '1px solid rgba(218,219,198,0.18)', background: 'transparent',
            color: 'rgba(218,219,198,0.6)', fontSize: '13px', fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.2s',
          }}
        >
          Atras
        </button>
        <button
          onClick={handleSubmit}
          disabled={!canContinue}
          style={{
            flex: 2, padding: '11px', borderRadius: '999px', border: 'none',
            background: canContinue ? '#f27059' : 'rgba(218,219,198,0.08)',
            color: canContinue ? '#fff' : 'rgba(218,219,198,0.3)',
            fontSize: '13px', fontWeight: 600,
            cursor: canContinue ? 'pointer' : 'not-allowed',
            transition: 'all .2s', fontFamily: 'inherit',
          }}
        >
          Iniciar evaluación
        </button>
      </div>
    </div>
  )
}
