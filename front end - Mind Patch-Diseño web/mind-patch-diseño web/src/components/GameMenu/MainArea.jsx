import { useRef, useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { PromptBox }        from '../PromptBox'
import { PsychologistsMap } from '../PsychologistsMap'
import { DAILY_LIMIT, suggestions } from './constants'

function LoadingDots() {
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '4px 0' }}>
      {[0, 1, 2].map(i => (
        <motion.div
          key={i}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
          style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'rgba(47,47,47,0.45)' }}
        />
      ))}
    </div>
  )
}

function FlipCard({ pregunta, respuesta, index }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
      onClick={() => setFlipped(f => !f)}
      style={{
        cursor: 'pointer', borderRadius: '12px', minHeight: '120px',
        background: flipped ? '#2F2F2F' : '#fff',
        border: `1px solid ${flipped ? 'rgba(47,47,47,0.4)' : 'rgba(47,47,47,0.12)'}`,
        padding: '16px', transition: 'background 0.25s, border 0.25s',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '8px',
        boxShadow: '0 1px 4px rgba(47,47,47,0.06)',
      }}
    >
      <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: flipped ? 'rgba(218,219,198,0.5)' : 'rgba(47,47,47,0.35)' }}>
        {flipped ? 'Respuesta' : `Pregunta ${index + 1}`}
      </div>
      <p style={{ margin: 0, fontSize: '14px', lineHeight: 1.6, color: flipped ? '#DADBC6' : 'rgba(47,47,47,0.85)', fontWeight: flipped ? 400 : 500 }}>
        {flipped ? respuesta : pregunta}
      </p>
      <div style={{ fontSize: '10px', color: flipped ? 'rgba(218,219,198,0.3)' : 'rgba(47,47,47,0.25)', textAlign: 'right' }}>
        {flipped ? 'Clic para ver pregunta' : 'Clic para ver respuesta'}
      </div>
    </motion.div>
  )
}

function TarjetasView({ tarjetas }) {
  return (
    <div>
      <p style={{ margin: '0 0 14px', fontSize: '13px', color: 'rgba(47,47,47,0.45)' }}>
        {tarjetas.length} tarjetas · Haz clic en cada una para revelar la respuesta
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
        {tarjetas.map((t, i) => <FlipCard key={i} index={i} pregunta={t.pregunta} respuesta={t.respuesta} />)}
      </div>
    </div>
  )
}

function QuizView({ preguntas }) {
  const [answers, setAnswers] = useState({})
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <p style={{ margin: '0 0 4px', fontSize: '13px', color: 'rgba(47,47,47,0.45)' }}>
        {preguntas.length} preguntas · Selecciona una opción para responder
      </p>
      {preguntas.map((q, qi) => {
        const chosen = answers[qi]
        const answered = chosen !== undefined
        return (
          <div key={qi} style={{ background: '#fff', borderRadius: '12px', border: '1px solid rgba(47,47,47,0.10)', padding: '16px', boxShadow: '0 1px 4px rgba(47,47,47,0.05)' }}>
            <p style={{ margin: '0 0 12px', fontSize: '14px', fontWeight: 600, color: '#2F2F2F', lineHeight: 1.5 }}>
              {qi + 1}. {q.pregunta}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {q.opciones.map((op, oi) => {
                const isCorrect  = oi === q.correcta
                const isChosen   = chosen === oi
                let bg = 'rgba(47,47,47,0.04)', border = 'rgba(47,47,47,0.12)', color = 'rgba(47,47,47,0.75)'
                if (answered) {
                  if (isCorrect)       { bg = 'rgba(16,185,129,0.10)'; border = 'rgba(16,185,129,0.35)'; color = '#065f46' }
                  else if (isChosen)   { bg = 'rgba(239,68,68,0.08)';  border = 'rgba(239,68,68,0.30)';  color = '#991b1b' }
                }
                return (
                  <button
                    key={oi}
                    disabled={answered}
                    onClick={() => setAnswers(a => ({ ...a, [qi]: oi }))}
                    style={{
                      textAlign: 'left', padding: '9px 12px', borderRadius: '8px',
                      background: bg, border: `1px solid ${border}`, color,
                      fontSize: '13px', cursor: answered ? 'default' : 'pointer',
                      transition: 'all 0.2s', lineHeight: 1.4,
                    }}
                  >
                    {String.fromCharCode(65 + oi)}. {op}
                    {answered && isCorrect && ' ✓'}
                    {answered && isChosen && !isCorrect && ' ✗'}
                  </button>
                )
              })}
            </div>
            {answered && q.explicacion && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ margin: '12px 0 0', fontSize: '13px', color: 'rgba(47,47,47,0.55)', lineHeight: 1.5, borderTop: '1px solid rgba(47,47,47,0.08)', paddingTop: '10px' }}>
                💡 {q.explicacion}
              </motion.p>
            )}
          </div>
        )
      })}
    </div>
  )
}

function MsgHeader({ isUser }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
      <div style={{
        width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0,
        background: isUser ? 'rgba(47,47,47,0.08)' : 'rgba(242,112,89,0.12)',
        border: `1px solid ${isUser ? 'rgba(47,47,47,0.14)' : 'rgba(242,112,89,0.25)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '10px', color: isUser ? 'rgba(47,47,47,0.6)' : '#f27059', fontWeight: 700,
      }}>
        {isUser ? 'Tu' : 'MP'}
      </div>
      <span style={{ color: 'rgba(47,47,47,0.40)', fontSize: '12px', fontWeight: 500 }}>
        {isUser ? 'Tú' : 'Mind Patch IA'}
      </span>
    </div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '20px 0', borderBottom: '1px solid rgba(47,47,47,0.08)' }}
    >
      <MsgHeader isUser={isUser} />
      <div style={{ paddingLeft: '30px' }}>
        {isUser ? (
          <div style={{ color: 'rgba(47,47,47,0.85)', fontSize: '15px', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
            {msg.content}
          </div>
        ) : msg.tipo === 'tarjetas' ? (
          <TarjetasView tarjetas={msg.tarjetas} />
        ) : msg.tipo === 'quiz' ? (
          <QuizView preguntas={msg.preguntas} />
        ) : (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              p:      ({ children }) => <p style={{ color: 'rgba(47,47,47,0.80)', fontSize: '15px', lineHeight: 1.8, margin: '0 0 12px' }}>{children}</p>,
              strong: ({ children }) => <strong style={{ color: '#2F2F2F', fontWeight: 600 }}>{children}</strong>,
              ul:     ({ children }) => <ul style={{ color: 'rgba(47,47,47,0.75)', fontSize: '15px', lineHeight: 1.8, margin: '0 0 12px', paddingLeft: '20px' }}>{children}</ul>,
              li:     ({ children }) => <li style={{ marginBottom: '4px' }}>{children}</li>,
            }}
          >
            {msg.content}
          </ReactMarkdown>
        )}
      </div>
    </motion.div>
  )
}

export default function MainArea({ selected, messages, loading, onSend, showMap, usosHoy, limitAlcanzado, isAdultModule }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const hasMessages   = messages.length > 0
  const TaskComponent = selected?.component

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden', background: '#DADBC6' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px' }}>
        <div style={{ maxWidth: showMap ? '100%' : '680px', margin: '0 auto', height: showMap ? 'calc(100% - 24px)' : 'auto' }}>
          <AnimatePresence mode="wait">

            {showMap && (
              <motion.div key="map" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} style={{ height: '100%' }}>
                <PsychologistsMap />
              </motion.div>
            )}

            {!showMap && !hasMessages && !selected && (
              <motion.div key="welcome" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} style={{ paddingTop: '80px', textAlign: 'center' }}>
                <h1 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 700, color: '#2F2F2F', letterSpacing: '-0.02em', lineHeight: 1.2, margin: '0 0 12px' }}>
                  Hola, ¿cómo te sientes hoy?
                </h1>
                <p style={{ color: 'rgba(47,47,47,0.55)', fontSize: '16px', margin: '0 0 40px', lineHeight: 1.6 }}>
                  {isAdultModule
                    ? 'Selecciona una tarea cognitiva o pregúntale algo a tu IA de estudio.'
                    : 'Selecciona un juego del panel lateral o usa la IA para comenzar.'}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '40px' }}>
                  {suggestions.map(s => (
                    <button key={s} onClick={() => onSend({ text: s, file: null, tool: null })}
                      style={{ padding: '8px 14px', background: 'rgba(47,47,47,0.04)', border: '1px solid rgba(47,47,47,0.10)', borderRadius: '999px', color: 'rgba(47,47,47,0.55)', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(47,47,47,0.08)'; e.currentTarget.style.color = '#2F2F2F' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(47,47,47,0.04)'; e.currentTarget.style.color = 'rgba(47,47,47,0.55)' }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {!showMap && !hasMessages && selected && TaskComponent && (
              <motion.div key={`task-${selected.id}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }} style={{ paddingTop: '40px' }}>
                <TaskComponent task={selected} />
              </motion.div>
            )}

            {!showMap && hasMessages && (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ paddingTop: '32px' }}>
                {messages.map((msg, i) => <Message key={i} msg={msg} />)}
                {loading && (
                  <div style={{ padding: '20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '22px', height: '22px', borderRadius: '6px', flexShrink: 0, background: 'rgba(242,112,89,0.12)', border: '1px solid rgba(242,112,89,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#f27059', fontWeight: 700 }}>MP</div>
                    <LoadingDots />
                  </div>
                )}
                <div ref={bottomRef} />
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <div style={{ padding: '12px 24px 20px', width: '100%', maxWidth: '760px', margin: '0 auto', boxSizing: 'border-box' }}>
        {limitAlcanzado ? (
          <div style={{ padding: '14px 18px', borderRadius: '16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', textAlign: 'center' }}>
            <p style={{ color: '#dc2626', fontSize: '14px', fontWeight: 600, margin: '0 0 4px' }}>Límite diario alcanzado</p>
            <p style={{ color: 'rgba(47,47,47,0.55)', fontSize: '12px', margin: 0 }}>Has usado los {DAILY_LIMIT} mensajes de hoy. Vuelve mañana para continuar.</p>
          </div>
        ) : (
          <>
            <PromptBox onSend={onSend} disabled={loading} />
            <p style={{ color: 'rgba(47,47,47,0.35)', fontSize: '11px', textAlign: 'center', margin: '8px 0 0' }}>
              {usosHoy}/{DAILY_LIMIT} mensajes usados hoy · Mind Patch IA puede cometer errores.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
