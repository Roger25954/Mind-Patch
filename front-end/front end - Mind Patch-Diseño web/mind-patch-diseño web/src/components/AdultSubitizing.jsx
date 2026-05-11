import React, { useCallback, useEffect, useRef, useState } from 'react';

/** Prueba de subitización — módulo adulto (Mind Patch) */
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

function buildSubitTrials() {
  const t = [];
  for (let n = 1; n <= 8; n++) for (let r = 0; r < 6; r++) t.push(n);
  return t.sort(() => Math.random() - 0.5);
}

function dotPositions(n) {
  const pos = [];
  let att = 0;
  while (pos.length < n && att < 300) {
    const x = 12 + Math.random() * 76;
    const y = 12 + Math.random() * 76;
    if (!pos.some((p) => Math.hypot(p.x - x, p.y - y) < 16)) pos.push({ x, y });
    att++;
  }
  return pos;
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
  dotCanvas: { width: 220, height: 180, position: 'relative' },
  dot: { width: 18, height: 18, borderRadius: '50%', position: 'absolute', transform: 'translate(-50%, -50%)', background: theme.white },
  numGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.5rem', maxWidth: 280, margin: '0 auto' },
  numBtn: {
    padding: '0.7rem',
    borderRadius: theme.radiusSm,
    border: `1.5px solid ${theme.border}`,
    fontSize: '0.95rem',
    fontWeight: 500,
    color: theme.ink,
    background: theme.white,
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
 * @param {{ onNext?: (metrics: { acc: number, mean: number, risk: string, smallErrs: number, events: Array<any> }) => void, onBack?: () => void }} props
 */
export default function AdultSubitizing({ onNext, onBack }) {
  const [phase, setPhase] = useState('idle');
  const [trialIdx, setTrialIdx] = useState(0);
  const [trials, setTrials] = useState([]);
  const [dots, setDots] = useState([]);
  const [awaitingAnswer, setAwaitingAnswer] = useState(false);
  const [metrics, setMetrics] = useState(null);

  const eventsRef = useRef([]);
  const trialStartRef = useRef(0);
  const canAnswerRef = useRef(false);
  const flashTimerRef = useRef(null);
  const trialsRef = useRef([]);

  const clearFlashTimer = () => {
    if (flashTimerRef.current) {
      clearTimeout(flashTimerRef.current);
      flashTimerRef.current = null;
    }
  };

  const endSubit = useCallback((finalEvents) => {
    const rts = finalEvents.map((e) => e.rt);
    const acc = Math.round((finalEvents.filter((e) => e.correct).length / finalEvents.length) * 100);
    const mean = Math.round(rts.reduce((a, b) => a + b, 0) / rts.length);
    const smallErrs = finalEvents.filter((e) => e.n <= 4 && !e.correct).length;
    const risk = smallErrs > 2 ? 'Alto' : smallErrs > 0 ? 'Moderado' : 'Bajo';
    setMetrics({ acc, mean, risk, smallErrs, events: finalEvents });
    setAwaitingAnswer(false);
    setDots([]);
    setPhase('done');
  }, []);

  const showTrial = useCallback(
    (idx, list) => {
      clearFlashTimer();
      if (idx >= list.length) {
        endSubit(eventsRef.current);
        return;
      }
      const n = list[idx];
      const pos = dotPositions(n);
      setDots(pos);
      setAwaitingAnswer(false);
      canAnswerRef.current = false;
      flashTimerRef.current = setTimeout(() => {
        setDots([]);
        setAwaitingAnswer(true);
        trialStartRef.current = performance.now();
        canAnswerRef.current = true;
      }, 200);
    },
    [endSubit]
  );

  const start = useCallback(() => {
    clearFlashTimer();
    const list = buildSubitTrials();
    trialsRef.current = list;
    setTrials(list);
    setTrialIdx(0);
    eventsRef.current = [];
    setMetrics(null);
    setPhase('running');
    showTrial(0, list);
  }, [showTrial]);

  useEffect(
    () => () => {
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    },
    []
  );

  const answerSubit = useCallback(
    (ans) => {
      if (!canAnswerRef.current) return;
      canAnswerRef.current = false;
      const list = trialsRef.current;
      const idx = trialIdx;
      const n = list[idx];
      const rt = performance.now() - trialStartRef.current;
      const correct = ans === n;
      eventsRef.current = [...eventsRef.current, { rt, correct, n, ans }];
      setAwaitingAnswer(false);
      const nextIdx = idx + 1;
      setTrialIdx(nextIdx);
      clearFlashTimer();
      flashTimerRef.current = setTimeout(() => {
        showTrial(nextIdx, list);
      }, 350);
    },
    [trialIdx, showTrial]
  );

  const pct = trials.length ? Math.round((trialIdx / trials.length) * 100) : 0;

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', padding: '2rem 1.5rem' }}>
      <div style={styles.pageLabel}>Tarea cognitiva · Sentido numérico</div>
      <h1 style={styles.pageTitle}>Prueba de subitización</h1>
      <p style={styles.pageSub}>
        Verás un grupo de puntos por un instante muy breve (200ms). Indica cuántos puntos viste lo más rápido posible.
      </p>

      <div style={styles.arena}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse at 30% 20%, rgba(61,122,95,.18) 0%, transparent 60%), radial-gradient(ellipse at 70% 80%, rgba(196,129,58,.12) 0%, transparent 55%)' }} />
        <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.12)', borderRadius: 2, position: 'absolute', top: 0, left: 0 }}>
          <div style={{ height: '100%', borderRadius: 2, background: theme.sageMid, width: `${phase === 'idle' ? 0 : pct}%`, transition: 'width 0.3s ease' }} />
        </div>

        {phase === 'idle' && (
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>⚫</div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
              Presiona &quot;Iniciar&quot; cuando estés listo.
              <br />
              48 trials · ~5 minutos
            </div>
          </div>
        )}

        {phase === 'running' && (
          <div style={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            {dots.length > 0 ? (
              <div style={styles.dotCanvas}>
                {dots.map((p, i) => (
                  <div key={i} style={{ ...styles.dot, left: `${p.x}%`, top: `${p.y}%` }} />
                ))}
              </div>
            ) : (
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>¿Cuántos puntos?</div>
            )}
          </div>
        )}

        {phase === 'done' && (
          <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '2.5rem', color: '#6EE7B7', marginBottom: '0.5rem' }}>✓</div>
            <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>Prueba completada</div>
          </div>
        )}
      </div>

      {phase === 'running' && awaitingAnswer && (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: theme.inkFaint, marginBottom: '0.75rem' }}>¿Cuántos puntos viste?</p>
          <div style={styles.numGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <button key={n} type="button" style={styles.numBtn} onClick={() => answerSubit(n)}>
                {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {metrics && (
        <div style={styles.statsGrid}>
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
            <div style={styles.statLabel}>Riesgo 1–4</div>
            <div style={styles.statValue}>{metrics.risk}</div>
          </div>
        </div>
      )}

      <div style={styles.btnRow}>
        {onBack && <button type="button" style={styles.btnGhost} onClick={onBack}>← Atrás</button>}
        {phase === 'idle' && (
          <button type="button" style={styles.btnPrimary} onClick={start}>
            Iniciar prueba
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
