import React, { useCallback, useEffect, useRef, useState } from 'react';

/** Decisión léxica — módulo adulto (Mind Patch) */
const REAL = ['árbol', 'cielo', 'libro', 'calle', 'noche', 'puerta', 'ventana', 'tiempo', 'camino', 'ciudad', 'sueño', 'tierra', 'fuego', 'agua', 'viento', 'mundo', 'manos', 'ojos', 'boca', 'alma'];
const PSEUDO = ['fruble', 'ciengo', 'libto', 'callén', 'nochi', 'puorta', 'ventina', 'tiemgo', 'camíno', 'ciudaz', 'suenho', 'tiarra', 'fuojo', 'agupa', 'vienco', 'munde', 'manoz', 'ojez', 'bocra', 'almuz'];

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
};

function buildLexTrials() {
  return [
    ...REAL.map((w) => ({ w, real: true })),
    ...PSEUDO.map((w) => ({ w, real: false })),
  ].sort(() => Math.random() - 0.5);
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
  lexWord: { fontFamily: "'DM Serif Display', serif", fontSize: 'clamp(2rem, 8vw, 3rem)', color: theme.white, letterSpacing: '0.04em', position: 'relative', zIndex: 1 },
  lexButtons: { display: 'flex', gap: '0.875rem', position: 'relative', zIndex: 1, flexWrap: 'wrap', justifyContent: 'center' },
  lexBtnReal: {
    padding: '0.75rem 2rem',
    borderRadius: theme.radiusMd,
    border: '1.5px solid rgba(110,231,183,0.4)',
    background: 'rgba(110,231,183,0.08)',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#6EE7B7',
    cursor: 'pointer',
  },
  lexBtnFake: {
    padding: '0.75rem 2rem',
    borderRadius: theme.radiusMd,
    border: '1.5px solid rgba(252,165,165,0.4)',
    background: 'rgba(252,165,165,0.08)',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#FCA5A5',
    cursor: 'pointer',
  },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginTop: '1rem' },
  statCard: { background: theme.surface2, borderRadius: theme.radiusMd, padding: '1rem', textAlign: 'center' },
  statLabel: { fontSize: '0.72rem', color: theme.inkFaint, marginBottom: '0.25rem' },
  statValue: { fontSize: '1.4rem', fontWeight: 500, color: theme.ink },
  btnRow: { display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '1.75rem', flexWrap: 'wrap' },
  btnPrimary: { padding: '0.7rem 1.5rem', borderRadius: theme.radiusMd, fontSize: '0.9rem', fontWeight: 500, background: theme.sage, color: theme.white, border: 'none', cursor: 'pointer' },
  btnGhost: { padding: '0.7rem 1.5rem', borderRadius: theme.radiusMd, fontSize: '0.9rem', fontWeight: 500, background: 'transparent', color: theme.inkMuted, border: `1.5px solid ${theme.border}`, cursor: 'pointer' },
};

/**
 * @param {{ onComplete?: (metrics: { acc: number, rtW: number, rtP: number, fp: number, events: Array<any> }) => void, onBack?: () => void }} props
 */
export default function AdultLexicalDecision({ onComplete, onBack }) {
  const [phase, setPhase] = useState('idle');
  const [trials, setTrials] = useState([]);
  const [idx, setIdx] = useState(0);
  const [events, setEvents] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const trialStart = useRef(0);
  const timer = useRef(null);

  const start = useCallback(() => {
    setTrials(buildLexTrials());
    setIdx(0);
    setEvents([]);
    setMetrics(null);
    setPhase('running');
  }, []);

  const finish = useCallback((finalEvents) => {
    const words = finalEvents.filter((e) => e.type === 'real');
    const pseudo = finalEvents.filter((e) => e.type === 'pseudo');
    const rtW = Math.round(words.reduce((a, e) => a + e.rt, 0) / (words.length || 1));
    const rtP = Math.round(pseudo.reduce((a, e) => a + e.rt, 0) / (pseudo.length || 1));
    const acc = Math.round((finalEvents.filter((e) => e.correct).length / finalEvents.length) * 100);
    const fp = finalEvents.filter((e) => e.fp).length;
    setMetrics({ acc, rtW, rtP, fp, events: finalEvents });
    setPhase('done');
  }, []);

  useEffect(() => {
    if (phase === 'running' && trials.length && idx < trials.length) {
      trialStart.current = performance.now();
    }
  }, [phase, idx, trials.length]);

  const answerLex = useCallback(
    (isReal) => {
      if (phase !== 'running' || idx >= trials.length) return;
      const rt = performance.now() - trialStart.current;
      const t = trials[idx];
      const correct = isReal === t.real;
      const fp = isReal && !t.real;
      const ev = { rt, correct, fp, type: t.real ? 'real' : 'pseudo' };
      setFeedback({ ok: correct });
      const nextEvents = [...events, ev];
      setEvents(nextEvents);
      setPhase('feedback');
      if (timer.current) clearTimeout(timer.current);
      const nextIdx = idx + 1;
      timer.current = setTimeout(() => {
        setFeedback(null);
        if (nextIdx >= trials.length) {
          finish(nextEvents);
        } else {
          setIdx(nextIdx);
          setPhase('running');
        }
      }, 300);
    },
    [phase, idx, trials, events, finish]
  );

  useEffect(() => () => timer.current && clearTimeout(timer.current), []);

  const pct = trials.length ? Math.round((idx / trials.length) * 100) : 0;
  const t = trials[idx];

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={styles.pageLabel}>Tarea cognitiva · Procesamiento léxico</div>
      <h1 style={styles.pageTitle}>Decisión léxica</h1>
      <p style={styles.pageSub}>
        Indica si el estímulo es una <strong>palabra real</strong> del español o una <strong>pseudopalabra</strong>. Responde tan rápido como puedas.
      </p>

      <div style={styles.arena}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 30% 20%, rgba(61,122,95,.18) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(196,129,58,.12) 0%, transparent 55%)' }} />
        <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.12)', borderRadius: 2, position: 'absolute', top: 0, left: 0 }}>
          <div style={{ height: '100%', borderRadius: 2, background: theme.sageMid, width: `${phase === 'idle' ? 0 : pct}%`, transition: 'width 0.3s ease' }} />
        </div>

        {phase === 'idle' && (
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📖</div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
              Presiona &quot;Iniciar&quot; cuando estés listo.
              <br />
              40 palabras · ~4 minutos
            </div>
          </div>
        )}

        {(phase === 'running' || phase === 'feedback') && t && (
          <>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', position: 'relative', zIndex: 1 }}>
              {idx + 1} / {trials.length}
            </div>
            <div style={styles.lexWord}>{t.w}</div>
            <div style={styles.lexButtons}>
              <button type="button" style={styles.lexBtnReal} onClick={() => answerLex(true)} disabled={phase === 'feedback'}>
                ✓ Palabra real
              </button>
              <button type="button" style={styles.lexBtnFake} onClick={() => answerLex(false)} disabled={phase === 'feedback'}>
                ✗ Pseudopalabra
              </button>
            </div>
            {feedback && (
              <div style={{ fontSize: '0.875rem', fontWeight: 500, color: feedback.ok ? '#6EE7B7' : '#FCA5A5', minHeight: 22 }}>
                {feedback.ok ? '✓' : '✗'}
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
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Precisión</div>
            <div style={styles.statValue}>{metrics.acc}%</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>RT palabras</div>
            <div style={styles.statValue}>{metrics.rtW}</div>
            <div style={{ fontSize: '0.72rem', color: theme.inkFaint, marginTop: '0.1rem' }}>ms</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>RT pseudo</div>
            <div style={styles.statValue}>{metrics.rtP}</div>
            <div style={{ fontSize: '0.72rem', color: theme.inkFaint, marginTop: '0.1rem' }}>ms</div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Falsos +</div>
            <div style={styles.statValue}>{metrics.fp}</div>
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
          <button type="button" style={styles.btnPrimary} onClick={() => onComplete?.(metrics)}>
            Ver procesamiento →
          </button>
        )}
      </div>
    </div>
  );
}
