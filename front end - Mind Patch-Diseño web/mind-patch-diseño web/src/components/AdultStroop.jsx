import React, { useCallback, useRef, useState } from 'react';

/** Tarea Stroop — módulo adulto (Mind Patch) */
const COLORS = { Rojo: '#DC2626', Verde: '#16A34A', Azul: '#2563EB', Amarillo: '#CA8A04' };
const CNAMES = Object.keys(COLORS);

const theme = {
  sage: '#3D7A5F',
  sageMid: '#7AAF97',
  ink: '#1C2420',
  inkMuted: '#4A5652',
  inkFaint: '#8A9690',
  border: '#E2E7E4',
  surface2: '#F2F4F1',
  white: '#FFFFFF',
  inkArena: '#1C2420',
  radiusMd: 12,
  radiusXl: 28,
  radiusSm: 6,
};

function buildStroopTrials() {
  const trials = [];
  for (let i = 0; i < 20; i++) {
    const wi = i % 4;
    const ci = (i + 1) % 4;
    trials.push({ word: CNAMES[wi], ink: COLORS[CNAMES[ci]], answer: CNAMES[ci] });
  }
  return trials.sort(() => Math.random() - 0.5);
}

const styles = {
  pageLabel: { fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: theme.inkFaint, marginBottom: '0.5rem' },
  pageTitle: { fontSize: '1.5rem', color: theme.ink, lineHeight: 1.2, marginBottom: '0.625rem', fontFamily: "'DM Serif Display', serif" },
  pageSub: { fontSize: '0.875rem', color: theme.inkMuted, lineHeight: 1.65, marginBottom: '1.75rem', maxWidth: 560 },
  arena: {
    background: theme.inkArena,
    borderRadius: theme.radiusXl,
    padding: '2.5rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 280,
    gap: '1.5rem',
    position: 'relative',
    overflow: 'hidden',
  },
  taskWord: { fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2rem, 8vw, 3.5rem)', letterSpacing: '0.02em', position: 'relative', zIndex: 1 },
  taskHint: { fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', position: 'relative', zIndex: 1, textAlign: 'center' },
  colorButtons: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1 },
  colorBtn: (c) => ({
    padding: '0.65rem 1.25rem',
    borderRadius: theme.radiusSm,
    border: `1.5px solid ${COLORS[c]}60`,
    fontSize: '0.875rem',
    fontWeight: 500,
    color: COLORS[c],
    background: 'rgba(255,255,255,0.05)',
    cursor: 'pointer',
  }),
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginTop: '1rem' },
  statCard: { background: theme.surface2, borderRadius: theme.radiusMd, padding: '1rem', textAlign: 'center' },
  statLabel: { fontSize: '0.72rem', color: theme.inkFaint, marginBottom: '0.25rem' },
  statValue: { fontSize: '1.4rem', fontWeight: 500, color: theme.ink },
  btnRow: { display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1.75rem', flexWrap: 'wrap' },
  btnPrimary: { padding: '0.7rem 1.5rem', borderRadius: theme.radiusMd, fontSize: '0.9rem', fontWeight: 500, background: theme.sage, color: theme.white, border: 'none', cursor: 'pointer' },
  btnGhost: { padding: '0.7rem 1.5rem', borderRadius: theme.radiusMd, fontSize: '0.9rem', fontWeight: 500, background: 'transparent', color: theme.inkMuted, border: `1.5px solid ${theme.border}`, cursor: 'pointer' },
};

/**
 * @param {{ onNext?: (metrics: { acc: number, mean: number, errs: number, events: Array<{ rt: number, correct: boolean }> }) => void, onBack?: () => void }} props
 */
export default function AdultStroop({ onNext, onBack }) {
  const [phase, setPhase] = useState('idle');
  const [trials, setTrials] = useState([]);
  const [idx, setIdx] = useState(0);
  const [events, setEvents] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const trialStart = useRef(0);
  const feedbackTimer = useRef(null);

  const start = useCallback(() => {
    setTrials(buildStroopTrials());
    setIdx(0);
    setEvents([]);
    setMetrics(null);
    setPhase('running');
  }, []);

  const finish = useCallback((finalEvents) => {
    const rts = finalEvents.map((e) => e.rt);
    const mean = Math.round(rts.reduce((a, b) => a + b, 0) / rts.length);
    const acc = Math.round((finalEvents.filter((e) => e.correct).length / finalEvents.length) * 100);
    const errs = finalEvents.filter((e) => !e.correct).length;
    const m = { acc, mean, errs, events: finalEvents };
    setMetrics(m);
    setPhase('done');
  }, []);

  const answer = useCallback(
    (color) => {
      if (phase !== 'running' || idx >= trials.length) return;
      const rt = performance.now() - trialStart.current;
      const correct = color === trials[idx].answer;
      const ev = { rt, correct, impulsive: rt < 200, condition: 'CW' };
      setFeedback({ ok: correct });
      const nextEvents = [...events, ev];
      setEvents(nextEvents);
      setPhase('feedback');
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
      const nextIdx = idx + 1;
      feedbackTimer.current = setTimeout(() => {
        setFeedback(null);
        if (nextIdx >= trials.length) {
          finish(nextEvents);
        } else {
          setIdx(nextIdx);
          setPhase('running');
        }
      }, 380);
    },
    [phase, idx, trials, events, finish]
  );

  React.useEffect(() => {
    if (phase === 'running' && trials.length && idx < trials.length) {
      trialStart.current = performance.now();
    }
    return () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, [phase, idx, trials.length]);

  const pct = trials.length ? Math.round((idx / trials.length) * 100) : 0;
  const t = trials[idx];

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={styles.pageLabel}>Tarea cognitiva · Funciones ejecutivas</div>
      <h1 style={styles.pageTitle}>Tarea Stroop</h1>
      <p style={styles.pageSub}>
        Verás una palabra de color escrita con tinta diferente. Responde el <strong>color de la tinta</strong>, no lo que dice la palabra.
      </p>

      <div style={styles.arena}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 30% 20%, rgba(61,122,95,.18) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(196,129,58,.12) 0%, transparent 55%)' }} />
        <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.12)', borderRadius: 2, position: 'absolute', top: 0, left: 0 }}>
          <div style={{ height: '100%', borderRadius: 2, background: theme.sageMid, width: `${phase === 'idle' ? 0 : pct}%`, transition: 'width 0.3s ease' }} />
        </div>

        {phase === 'idle' && (
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚡</div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
              Presiona &quot;Iniciar&quot; cuando estés listo.
              <br />
              20 trials · ~3 minutos
            </div>
          </div>
        )}

        {(phase === 'running' || phase === 'feedback') && t && (
          <>
            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', position: 'relative', zIndex: 1 }}>
              {idx + 1} / {trials.length}
            </div>
            <div style={{ ...styles.taskWord, color: t.ink }}>{t.word}</div>
            <div style={styles.taskHint}>Presiona el color de la tinta, no la palabra</div>
            <div style={styles.colorButtons}>
              {CNAMES.map((c) => (
                <button key={c} type="button" style={styles.colorBtn(c)} onClick={() => answer(c)} disabled={phase === 'feedback'}>
                  {c}
                </button>
              ))}
            </div>
            {feedback && (
              <div style={{ fontSize: '0.875rem', fontWeight: 500, color: feedback.ok ? '#6EE7B7' : '#FCA5A5', position: 'relative', zIndex: 1, minHeight: 22 }}>
                {feedback.ok ? '✓ Correcto' : '✗ Incorrecto'}
              </div>
            )}
          </>
        )}

        {phase === 'done' && (
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '2.5rem', color: '#6EE7B7', marginBottom: '0.5rem' }}>✓</div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Tarea completada</div>
          </div>
        )}
      </div>

      {metrics && (
        <div style={{ ...styles.statsGrid, display: 'grid' }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Precisión</div>
            <div style={styles.statValue}>{metrics.acc}%</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>RT medio</div>
            <div style={styles.statValue}>{metrics.mean}</div>
            <div style={{ fontSize: '0.72rem', color: theme.inkFaint, marginTop: '0.1rem' }}>ms</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Errores</div>
            <div style={styles.statValue}>{metrics.errs}</div>
          </div>
        </div>
      )}

      <div style={styles.btnRow}>
        {onBack && <button type="button" style={styles.btnGhost} onClick={onBack}>← Atrás</button>}
        {phase === 'idle' && (
          <button type="button" style={styles.btnPrimary} onClick={start}>
            Iniciar tarea
          </button>
        )}
        {phase === 'done' && (
          <button type="button" style={styles.btnPrimary} onClick={() => onNext?.(metrics)}>
            Siguiente prueba →
          </button>
        )}
      </div>
    </div>
  );
}
