// components/onboarding/Step1Consent.jsx
// Paso 1 — Consentimiento informado.
// Versión modal: sin wrapper propio ni StepPills (la barra va en App.jsx).

import { useState } from 'react'

function ConsentBlock({ id, icon, title, checked, onToggle, children }) {
  return (
    <div
      style={{
        border: `1.5px solid ${checked ? '#3D7A5F' : '#E2E7E4'}`,
        borderRadius: '12px',
        padding: '14px',
        marginBottom: '10px',
        transition: 'border-color .2s',
        background: checked ? 'rgba(61,122,95,0.03)' : '#fff',
      }}
    >
      <div
        onClick={onToggle}
        style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', userSelect: 'none' }}
      >
        {/* Checkbox */}
        <div style={{
          width: '20px', height: '20px', borderRadius: '5px', flexShrink: 0,
          border: `2px solid ${checked ? '#3D7A5F' : '#E2E7E4'}`,
          background: checked ? '#3D7A5F' : '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .2s', marginTop: '1px',
          color: '#fff', fontSize: '11px', fontWeight: 700,
        }}>
          {checked && '✓'}
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1C2420' }}>
            {icon} {title}
          </div>
        </div>
      </div>
      <div style={{ fontSize: '12px', color: '#4A5652', lineHeight: 1.65, marginTop: '10px', paddingLeft: '30px' }}>
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
        <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '1.5rem', color: '#1C2420', margin: '0 0 6px', lineHeight: 1.2 }}>
          Consentimiento informado
        </h2>
        <p style={{ fontSize: '13px', color: '#4A5652', margin: 0, lineHeight: 1.6 }}>
          Necesitamos tu consentimiento en dos áreas antes de continuar.
        </p>
      </div>

      <ConsentBlock
        icon="🔒" title="Datos personales"
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
        icon="🤖" title="Orientación por IA"
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
        background: '#F2F4F1', borderRadius: '10px',
        padding: '10px 14px', fontSize: '11px', color: '#4A5652',
        lineHeight: 1.6, borderLeft: '3px solid #7AAF97', margin: '14px 0 20px',
      }}>
        Al aceptar confirmas que eres mayor de 18 años, o actúas como tutor legal.
        Esta plataforma no reemplaza la evaluación profesional.
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        <button
          onClick={onBack}
          style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1.5px solid #E2E7E4', background: 'none', color: '#4A5652', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          ← Atrás
        </button>
        <button
          onClick={onNext}
          disabled={!dataOk || !aiOk}
          style={{
            flex: 2, padding: '11px', borderRadius: '10px', border: 'none',
            background: dataOk && aiOk ? '#3D7A5F' : '#E2E7E4',
            color: dataOk && aiOk ? '#fff' : '#8A9690',
            fontSize: '13px', fontWeight: 600, cursor: dataOk && aiOk ? 'pointer' : 'not-allowed',
            transition: 'all .2s', fontFamily: 'inherit',
          }}
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}
