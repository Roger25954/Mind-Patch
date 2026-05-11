import React, { useCallback, useState } from 'react';

/** Lista de verificación dislexia — módulo adulto (Mind Patch) */
const DYS_ITEMS = [
  'Confundo letras similares (b/d, p/q) al leer o escribir',
  'Me cuesta leer en voz alta sin perder el hilo o cambiar palabras',
  'Leo lentamente y tengo que releer varias veces para entender',
  'Tengo dificultades para deletrear palabras de uso común',
  'Me resulta difícil copiar texto con precisión de una pantalla o pizarra',
  'Confundo la izquierda y la derecha con frecuencia',
  'Me cuesta recordar secuencias como meses del año o días de la semana',
  'Tengo dificultad para seguir instrucciones orales de más de dos pasos',
  'Mi escritura a mano es difícil de leer incluso para mí',
  'Frecuentemente omito palabras o líneas cuando leo',
  'Tengo dificultad para encontrar la palabra precisa que quiero decir',
  'Me cuesta organizar mis pensamientos por escrito aunque conozca el tema',
  'Necesito más tiempo que los demás para completar exámenes o reportes',
  'Me frustro fácilmente con tareas prolongadas de lectura o escritura',
  'Cometo errores ortográficos frecuentes a pesar de releer',
  'Confundo homófonos como haya/halla, vaya/baya al escribir',
  'Tengo dificultades con relojes analógicos o mapas',
  'Tiendo a posponer tareas que requieren mucha lectura',
  'Aprendo mejor escuchando o viendo que leyendo textos',
  'Las personas comentan que cometo errores ortográficos con frecuencia',
];

const theme = {
  sage: '#3D7A5F',
  ink: '#1C2420',
  inkMuted: '#4A5652',
  inkFaint: '#8A9690',
  border: '#E2E7E4',
  white: '#FFFFFF',
  radiusSm: 6,
  radiusMd: 12,
};

const styles = {
  pageLabel: { fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: theme.inkFaint, marginBottom: '0.5rem' },
  pageTitle: { fontSize: '1.5rem', color: theme.ink, lineHeight: 1.2, marginBottom: '0.625rem', fontFamily: "'DM Serif Display', serif" },
  pageSub: { fontSize: '0.875rem', color: theme.inkMuted, lineHeight: 1.65, marginBottom: '1.75rem', maxWidth: 560 },
  yesnoItem: { display: 'flex', alignItems: 'flex-start', gap: '0.875rem', padding: '0.875rem 0', borderBottom: `1px solid ${theme.border}`, cursor: 'pointer' },
  yesnoCheck: (checked) => ({
    width: 22,
    height: 22,
    borderRadius: 5,
    border: `1.5px solid ${theme.border}`,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    background: checked ? theme.sage : 'transparent',
    borderColor: checked ? theme.sage : theme.border,
    color: theme.white,
    fontSize: '0.85rem',
    fontWeight: 500,
  }),
  yesnoLabel: { fontSize: '0.875rem', color: theme.ink, lineHeight: 1.5 },
  btnRow: { display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' },
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.7rem 1.5rem',
    borderRadius: theme.radiusMd,
    fontSize: '0.9rem',
    fontWeight: 500,
    background: theme.sage,
    color: theme.white,
    border: 'none',
    cursor: 'pointer',
  },
  btnGhost: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.7rem 1.5rem',
    borderRadius: theme.radiusMd,
    fontSize: '0.9rem',
    fontWeight: 500,
    background: 'transparent',
    color: theme.inkMuted,
    border: `1.5px solid ${theme.border}`,
    cursor: 'pointer',
  },
};

/**
 * @param {{ onNext?: (payload: { selected: boolean[], count: number }) => void, onBack?: () => void }} props
 */
export default function AdultDyslexiaChecklist({ onNext, onBack }) {
  const [selected, setSelected] = useState(() => DYS_ITEMS.map(() => false));

  const toggle = useCallback((i) => {
    setSelected((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  }, []);

  const count = selected.filter(Boolean).length;

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={styles.pageLabel}>Tamizaje · Dislexia</div>
      <h1 style={styles.pageTitle}>Lista de verificación</h1>
      <p style={styles.pageSub}>Marca las situaciones con las que te identificas en tu vida cotidiana. No hay respuestas buenas o malas.</p>

      <div>
        {DYS_ITEMS.map((item, i) => (
          <div
            key={i}
            role="button"
            tabIndex={0}
            style={{ ...styles.yesnoItem, borderBottom: i === DYS_ITEMS.length - 1 ? 'none' : styles.yesnoItem.borderBottom }}
            onClick={() => toggle(i)}
            onKeyDown={(e) => e.key === 'Enter' && toggle(i)}
          >
            <div style={styles.yesnoCheck(selected[i])}>{selected[i] ? '✓' : ''}</div>
            <div style={styles.yesnoLabel}>{item}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ fontSize: '0.85rem', color: theme.inkFaint }}>Seleccionados: {count} / {DYS_ITEMS.length}</div>
        <div style={{ ...styles.btnRow, marginTop: 0 }}>
          {onBack && (
            <button type="button" style={styles.btnGhost} onClick={onBack}>
              ← Atrás
            </button>
          )}
          <button type="button" style={styles.btnPrimary} onClick={() => onNext?.({ selected, count })}>
            Continuar a tareas →
          </button>
        </div>
      </div>
    </div>
  );
}
