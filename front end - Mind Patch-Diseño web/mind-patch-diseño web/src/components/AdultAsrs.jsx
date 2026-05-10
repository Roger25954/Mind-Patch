import React, { useCallback, useMemo, useState } from 'react';

/** Tamizaje ASRS v1.1 — módulo adulto (Mind Patch) */
const OPTS = ['Nunca', 'Rara vez', 'A veces', 'A menudo', 'Muy a menudo'];

const ASRS_QUESTIONS = [
  { id: 'a1', text: '¿Con qué frecuencia tiene dificultad para acabar los detalles finales de un proyecto?', shaded: [3, 4], part: 'A' },
  { id: 'a2', text: '¿Con qué frecuencia tiene dificultad para ordenar las cosas cuando la tarea requiere organización?', shaded: [3, 4], part: 'A' },
  { id: 'a3', text: '¿Con qué frecuencia tiene problemas para recordar citas u obligaciones?', shaded: [3, 4], part: 'A' },
  { id: 'a4', text: 'Cuando tiene que realizar una tarea que requiere pensar mucho, ¿con qué frecuencia evita o retrasa empezarla?', shaded: [3, 4], part: 'A' },
  { id: 'a5', text: '¿Con qué frecuencia mueve continuamente manos o pies cuando tiene que permanecer sentado mucho tiempo?', shaded: [3, 4], part: 'A' },
  { id: 'a6', text: '¿Con qué frecuencia se siente demasiado activo e impulsado a hacer cosas, como si lo empujara un motor?', shaded: [3, 4], part: 'A' },
  { id: 'a7', text: '¿Con qué frecuencia comete errores por descuido en proyectos aburridos o difíciles?', shaded: [], part: 'B' },
  { id: 'a8', text: '¿Con qué frecuencia tiene dificultad para mantener la atención en tareas aburridas o repetitivas?', shaded: [], part: 'B' },
  { id: 'a9', text: '¿Con qué frecuencia tiene dificultad para concentrarse en lo que le dicen, incluso directamente?', shaded: [], part: 'B' },
  { id: 'a10', text: '¿Con qué frecuencia deja proyectos a medias una vez que las partes difíciles están hechas?', shaded: [], part: 'B' },
  { id: 'a11', text: '¿Con qué frecuencia tiene dificultad para hacer cosas que requieren atención sostenida?', shaded: [], part: 'B' },
  { id: 'a12', text: '¿Con qué frecuencia pierde cosas o no puede encontrarlas en casa o en el trabajo?', shaded: [], part: 'B' },
  { id: 'a13', text: '¿Con qué frecuencia se distrae con actividad o ruido a su alrededor?', shaded: [], part: 'B' },
  { id: 'a14', text: '¿Con qué frecuencia le resulta difícil descansar o relajarse cuando tiene tiempo libre?', shaded: [], part: 'B' },
  { id: 'a15', text: '¿Con qué frecuencia se siente incómodo cuando tiene que esperar su turno?', shaded: [], part: 'B' },
  { id: 'a16', text: '¿Con qué frecuencia interrumpe a los demás cuando están ocupados?', shaded: [], part: 'B' },
  { id: 'a17', text: '¿Con qué frecuencia termina las frases de las personas antes de que puedan terminarlas?', shaded: [], part: 'B' },
  { id: 'a18', text: '¿Con qué frecuencia elige hacer otra cosa mientras espera en una fila?', shaded: [], part: 'B' },
];

const theme = {
  sage: '#3D7A5F',
  sageDark: '#2A5A45',
  sageLight: '#EEF5F1',
  ink: '#1C2420',
  inkMuted: '#4A5652',
  inkFaint: '#8A9690',
  border: '#E2E7E4',
  surface2: '#F2F4F1',
  coral: '#C0533A',
  white: '#FFFFFF',
  radiusSm: 6,
  radiusMd: 12,
};

const styles = {
  pageLabel: { fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: theme.inkFaint, marginBottom: '0.5rem' },
  pageTitle: { fontSize: '1.5rem', color: theme.ink, lineHeight: 1.2, marginBottom: '0.625rem', fontFamily: "'DM Serif Display', serif" },
  pageSub: { fontSize: '0.875rem', color: theme.inkMuted, lineHeight: 1.65, marginBottom: '1.75rem', maxWidth: 560 },
  surface: { background: theme.surface2, borderRadius: theme.radiusMd, padding: '1.25rem', marginBottom: '1.25rem', fontSize: '0.8rem', color: theme.inkMuted },
  likertQuestion: { marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: `1px solid ${theme.border}` },
  likertText: { fontSize: '0.9rem', color: theme.ink, marginBottom: '0.875rem', lineHeight: 1.5 },
  likertOptions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  likertBtn: (selected, shaded) => ({
    flex: 1,
    minWidth: 72,
    padding: '0.55rem 0.5rem',
    border: `1.5px solid ${theme.border}`,
    borderStyle: shaded ? 'dashed' : 'solid',
    borderRadius: theme.radiusSm,
    fontSize: '0.78rem',
    color: selected ? theme.white : theme.inkMuted,
    background: selected ? (shaded ? theme.coral : theme.sage) : theme.white,
    borderColor: selected ? (shaded ? theme.coral : theme.sage) : theme.border,
    cursor: 'pointer',
    lineHeight: 1.3,
  }),
  partHeader: (i) => ({
    fontSize: '0.75rem',
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: theme.inkFaint,
    padding: '0.75rem 0 0.5rem',
    marginTop: i > 0 ? '0.5rem' : 0,
    borderTop: i > 0 ? `1px solid ${theme.border}` : 'none',
  }),
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
  scoreDisplay: (warn) => ({ fontSize: '0.85rem', color: warn ? theme.coral : theme.inkFaint }),
};

/**
 * @param {{ onNext?: (payload: { answers: Record<string, number>, shadedCount: number }) => void, onBack?: () => void }} props
 */
export default function AdultAsrs({ onNext, onBack }) {
  const [answers, setAnswers] = useState({});

  const pick = useCallback((qid, oi) => {
    setAnswers((prev) => ({ ...prev, [qid]: oi }));
  }, []);

  const shadedCount = useMemo(
    () => ASRS_QUESTIONS.filter((q) => q.shaded.includes(answers[q.id])).length,
    [answers]
  );
  const total = Object.keys(answers).length;
  const complete = total === ASRS_QUESTIONS.length;

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={styles.pageLabel}>Tamizaje · TDAH</div>
      <h1 style={styles.pageTitle}>ASRS v1.1 — Autoinforme</h1>
      <p style={styles.pageSub}>
        Indica con qué frecuencia experimentas cada situación en los últimos 6 meses. Las opciones con borde discontinuo tienen peso especial en el análisis.
      </p>

      <div style={styles.surface}>
        <strong>Parte A</strong> — Preguntas de mayor peso clínico. 4 o más respuestas en zona marcada sugieren exploración adicional.
      </div>

      <div>
        {ASRS_QUESTIONS.map((q, i) => {
          const sep = i === 0 || q.part !== ASRS_QUESTIONS[i - 1].part;
          return (
            <React.Fragment key={q.id}>
              {sep && <div style={styles.partHeader(i)}>Parte {q.part}</div>}
              <div style={{ ...styles.likertQuestion, borderBottom: i === ASRS_QUESTIONS.length - 1 ? 'none' : styles.likertQuestion.borderBottom }}>
                <div style={styles.likertText}>
                  <span style={{ color: theme.inkFaint, fontSize: '0.8rem', marginRight: '0.4rem' }}>{i + 1}.</span>
                  {q.text}
                </div>
                <div style={styles.likertOptions}>
                  {OPTS.map((o, oi) => {
                    const shaded = q.shaded.includes(oi);
                    const selected = answers[q.id] === oi;
                    return (
                      <button
                        key={oi}
                        type="button"
                        style={styles.likertBtn(selected, shaded)}
                        onClick={() => pick(q.id, oi)}
                      >
                        {o}
                      </button>
                    );
                  })}
                </div>
                {q.shaded.length > 0 && (
                  <div style={{ fontSize: '0.72rem', color: theme.inkFaint, marginTop: '0.5rem', fontStyle: 'italic' }}>
                    ↑ Opciones con borde discontinuo tienen mayor peso
                  </div>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={styles.scoreDisplay(shadedCount >= 4)}>
          {total === 0
            ? 'Completa todas las preguntas para continuar'
            : `${total}/18 respondidas · Indicadores marcados: ${shadedCount}/6`}
        </div>
        <div style={{ ...styles.btnRow, marginTop: 0 }}>
          {onBack && (
            <button type="button" style={{ ...styles.btnPrimary, background: 'transparent', color: theme.inkMuted, border: `1.5px solid ${theme.border}` }} onClick={onBack}>
              ← Atrás
            </button>
          )}
          <button
            type="button"
            style={{ ...styles.btnPrimary, opacity: complete ? 1 : 0.45, pointerEvents: complete ? 'auto' : 'none' }}
            disabled={!complete}
            onClick={() => onNext?.({ answers, shadedCount })}
          >
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  );
}
