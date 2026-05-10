// components/onboarding/Step1Consent.jsx
import { useState } from 'react'

function ConsentBlock({ title, checked, onToggle, children }) {
  return (
    <div
      style={{
        border: `1.5px solid ${checked ? 'rgba(242,112,89,0.5)' : 'rgba(218,219,198,0.12)'}`,
        borderRadius: '12px',
        padding: '14px',
        marginBottom: '10px',
        transition: 'border-color .2s',
        background: checked ? 'rgba(242,112,89,0.05)' : 'rgba(218,219,198,0.03)',
      }}
    >
      <div
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', userSelect: 'none' }}
      >
        <div style={{
          width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0,
          border: `2px solid ${checked ? '#f27059' : 'rgba(218,219,198,0.25)'}`,
          background: checked ? '#f27059' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .2s', marginTop: '1px',
          color: '#fff', fontSize: '11px', fontWeight: 700,
        }}>
          {checked && '✓'}
        </div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: '#DADBC6' }}>
          {title}
        </div>
      </div>
      <div style={{ fontSize: '12px', color: 'rgba(218,219,198,0.55)', lineHeight: 1.65, marginTop: '10px', paddingLeft: '30px' }}>
        {children}
      </div>
    </div>
  )
}

export default function Step1Consent({ onNext, onBack }) {
  const [dataOk, setDataOk] = useState(false)
  const [aiOk,   setAiOk]   = useState(false)

  return (
    <div>
      <div style={{ marginBottom: '18px', marginTop: '12px' }}>
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.5rem', color: '#DADBC6', margin: '0 0 6px', lineHeight: 1.2 }}>
          Consentimiento informado
        </h2>
        <p style={{ fontSize: '13px', color: 'rgba(218,219,198,0.5)', margin: 0, lineHeight: 1.6 }}>
          Necesitamos tu consentimiento en dos areas antes de continuar.
        </p>
      </div>

      <ConsentBlock
        title="Datos personales"
        checked={dataOk} onToggle={() => setDataOk(v => !v)}
      >
        <p style={{ margin: '0 0 6px' }}>
          Acepto que Mind Patch recopile y procese la información que proporciono durante esta sesión.
        </p>
        <ul style={{ margin: 0, paddingLeft: '16px', lineHeight: 1.8 }}>
          <li>Tus datos se almacenan de forma <strong>anónima y cifrada</strong>.</li>
          <li>No se comparten con terceros sin tu consentimiento explícito.</li>
          <li>Puedes solicitar la eliminación en cualquier momento.</li>
        </ul>
      </ConsentBlock>

      <ConsentBlock
        title="Orientación por IA"
        checked={aiOk} onToggle={() => setAiOk(v => !v)}
      >
        <p style={{ margin: '0 0 6px' }}>
          Acepto que un sistema de IA analice mis métricas para generar un perfil orientativo.
        </p>
        <ul style={{ margin: 0, paddingLeft: '16px', lineHeight: 1.8 }}>
          <li>La IA <strong>no emite diagnósticos clínicos</strong>.</li>
          <li>Los resultados describen patrones observados, no condiciones confirmadas.</li>
          <li>Un filtro de seguridad revisa todas las salidas antes de mostrártelas.</li>
        </ul>
      </ConsentBlock>

      <div style={{
        background: 'rgba(218,219,198,0.05)', borderRadius: '10px',
        padding: '10px 14px', fontSize: '11px', color: 'rgba(218,219,198,0.45)',
        lineHeight: 1.6, borderLeft: '3px solid rgba(242,112,89,0.4)', margin: '14px 0 20px',
      }}>
        Al aceptar confirmas que eres mayor de 18 años, o actúas como tutor legal.
        Esta plataforma no reemplaza la evaluación profesional.
      </div>

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
          disabled={!dataOk || !aiOk}
          style={{
            flex: 2, padding: '11px', borderRadius: '999px', border: 'none',
            background: dataOk && aiOk ? '#f27059' : 'rgba(218,219,198,0.08)',
            color: dataOk && aiOk ? '#fff' : 'rgba(218,219,198,0.3)',
            fontSize: '13px', fontWeight: 600,
            cursor: dataOk && aiOk ? 'pointer' : 'not-allowed',
            transition: 'all .2s', fontFamily: 'inherit',
          }}
        >
          Continuar
        </button>
      </div>
    </div>
  )
}
