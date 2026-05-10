// components/onboarding/Step2UserType.jsx
// Paso 2 — ¿Para quién es esta evaluación?
// Adapta el flujo para adulto, adolescente o niño.
// Si es menor, muestra bloque de datos del tutor.

const USER_TYPES = [
  { id: 'adult',      icon: '🧑', name: 'Adulto',       desc: '18 años o más. Completa la evaluación directamente.' },
  { id: 'adolescent', icon: '🧒', name: 'Adolescente',  desc: '12–17 años. Flujo mixto: adolescente + tutor.' },
  { id: 'child',      icon: '👦', name: 'Niño / Niña',  desc: 'Hasta 11 años. El padre o tutor responde.' },
]

export default function Step2UserType({ onNext, onBack, data, setData }) {
  const needsTutor = data.userType === 'adolescent' || data.userType === 'child'
  const canContinue = data.userType && (!needsTutor || (data.tutorName.trim() && data.tutorRel))

  const set = (key) => (e) => setData(d => ({ ...d, [key]: e.target.value }))

  return (
    <div>
      <div style={{ marginBottom: '18px', marginTop: '12px' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.5rem', color: '#1C2420', margin: '0 0 6px', lineHeight: 1.2 }}>
          ¿Para quién es la evaluación?
        </h2>
        <p style={{ fontSize: '13px', color: '#4A5652', margin: 0, lineHeight: 1.6 }}>
          El flujo se adapta automáticamente según el perfil seleccionado.
        </p>
      </div>

      {/* Tarjetas de perfil */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
        {USER_TYPES.map(t => {
          const active = data.userType === t.id
          return (
            <button
              key={t.id}
              onClick={() => setData(d => ({ ...d, userType: t.id }))}
              style={{
                padding: '16px 10px',
                border: `2px solid ${active ? '#3D7A5F' : '#E2E7E4'}`,
                borderRadius: '14px',
                background: active ? 'rgba(61,122,95,0.06)' : '#fff',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all .2s',
                fontFamily: 'inherit',
              }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{t.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C2420', marginBottom: '4px' }}>{t.name}</div>
              <div style={{ fontSize: '11px', color: '#8A9690', lineHeight: 1.4 }}>{t.desc}</div>
            </button>
          )
        })}
      </div>

      {/* Bloque de tutor (solo para menores) */}
      {needsTutor && (
        <div style={{ background: '#F2F4F1', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', color: '#4A5652', margin: '0 0 12px', lineHeight: 1.6 }}>
            Para este perfil, un padre o tutor completará las secciones de cuestionario.
          </p>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', fontWeight: 500, color: '#4A5652', display: 'block', marginBottom: '5px' }}>
              Nombre del tutor
            </label>
            <input
              type="text"
              placeholder="Nombre completo"
              value={data.tutorName}
              onChange={set('tutorName')}
              style={{
                width: '100%', padding: '9px 12px',
                border: '1.5px solid #E2E7E4', borderRadius: '8px',
                fontSize: '13px', color: '#1C2420', background: '#fff',
                outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              }}
              onFocus={e => e.target.style.borderColor = '#7AAF97'}
              onBlur={e => e.target.style.borderColor = '#E2E7E4'}
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 500, color: '#4A5652', display: 'block', marginBottom: '5px' }}>
              Relación con el menor
            </label>
            <select
              value={data.tutorRel}
              onChange={set('tutorRel')}
              style={{
                width: '100%', padding: '9px 12px',
                border: '1.5px solid #E2E7E4', borderRadius: '8px',
                fontSize: '13px', color: '#1C2420', background: '#fff',
                outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                appearance: 'none',
              }}
            >
              <option value="">Selecciona...</option>
              <option>Madre</option>
              <option>Padre</option>
              <option>Tutora legal</option>
              <option>Tutor legal</option>
              <option>Otro familiar</option>
            </select>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onBack}
          style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1.5px solid #E2E7E4', background: 'none', color: '#4A5652', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          ← Atrás
        </button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          style={{
            flex: 2, padding: '11px', borderRadius: '10px', border: 'none',
            background: canContinue ? '#3D7A5F' : '#E2E7E4',
            color: canContinue ? '#fff' : '#8A9690',
            fontSize: '13px', fontWeight: 600,
            cursor: canContinue ? 'pointer' : 'not-allowed',
            transition: 'all .2s', fontFamily: 'inherit',
          }}
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}