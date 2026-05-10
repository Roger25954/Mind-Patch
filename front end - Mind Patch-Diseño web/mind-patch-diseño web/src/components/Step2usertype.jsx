// components/onboarding/Step2UserType.jsx
const USER_TYPES = [
  { id: 'adult',      name: 'Adulto',       desc: '18 años o más. Completa la evaluación directamente.' },
  { id: 'adolescent', name: 'Adolescente',  desc: '12–17 años. Flujo mixto: adolescente + tutor.' },
  { id: 'child',      name: 'Niño / Niña',  desc: 'Hasta 11 años. El padre o tutor responde.' },
]

const inputStyle = {
  width: '100%', padding: '9px 12px',
  border: '1px solid rgba(218,219,198,0.18)', borderRadius: '10px',
  fontSize: '13px', color: '#DADBC6', background: 'rgba(218,219,198,0.05)',
  outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  transition: 'border-color 0.2s',
}

export default function Step2UserType({ onNext, onBack, data, setData }) {
  const needsTutor = data.userType === 'adolescent' || data.userType === 'child'
  const canContinue = data.userType && (!needsTutor || (data.tutorName.trim() && data.tutorRel))

  const set = (key) => (e) => setData(d => ({ ...d, [key]: e.target.value }))

  return (
    <div>
      <div style={{ marginBottom: '18px', marginTop: '12px' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.5rem', color: '#DADBC6', margin: '0 0 6px', lineHeight: 1.2 }}>
          ¿Para quién es la evaluación?
        </h2>
        <p style={{ fontSize: '13px', color: 'rgba(218,219,198,0.5)', margin: 0, lineHeight: 1.6 }}>
          El flujo se adapta automáticamente según el perfil seleccionado.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '16px' }}>
        {USER_TYPES.map(t => {
          const active = data.userType === t.id
          return (
            <button
              key={t.id}
              onClick={() => setData(d => ({ ...d, userType: t.id }))}
              style={{
                padding: '16px 10px',
                border: `1.5px solid ${active ? 'rgba(242,112,89,0.6)' : 'rgba(218,219,198,0.12)'}`,
                borderRadius: '14px',
                background: active ? 'rgba(242,112,89,0.08)' : 'rgba(218,219,198,0.03)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all .2s',
                fontFamily: 'inherit',
              }}
            >
              <div style={{ fontSize: '13px', fontWeight: 600, color: active ? '#f27059' : '#DADBC6', marginBottom: '4px' }}>{t.name}</div>
              <div style={{ fontSize: '11px', color: 'rgba(218,219,198,0.45)', lineHeight: 1.4 }}>{t.desc}</div>
            </button>
          )
        })}
      </div>

      {needsTutor && (
        <div style={{ background: 'rgba(218,219,198,0.04)', borderRadius: '12px', padding: '14px', marginBottom: '16px', border: '1px solid rgba(218,219,198,0.1)' }}>
          <p style={{ fontSize: '12px', color: 'rgba(218,219,198,0.5)', margin: '0 0 12px', lineHeight: 1.6 }}>
            Para este perfil, un padre o tutor completará las secciones de cuestionario.
          </p>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(218,219,198,0.5)', display: 'block', marginBottom: '5px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Nombre del tutor
            </label>
            <input
              type="text"
              placeholder="Nombre completo"
              value={data.tutorName}
              onChange={set('tutorName')}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = 'rgba(218,219,198,0.35)'}
              onBlur={e => e.target.style.borderColor = 'rgba(218,219,198,0.18)'}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(218,219,198,0.5)', display: 'block', marginBottom: '5px', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Relación con el menor
            </label>
            <select
              value={data.tutorRel}
              onChange={set('tutorRel')}
              style={{ ...inputStyle, appearance: 'none' }}
              onFocus={e => e.target.style.borderColor = 'rgba(218,219,198,0.35)'}
              onBlur={e => e.target.style.borderColor = 'rgba(218,219,198,0.18)'}
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
          onClick={onNext}
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
          Continuar
        </button>
      </div>
    </div>
  )
}
