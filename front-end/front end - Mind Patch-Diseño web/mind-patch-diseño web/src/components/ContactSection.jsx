import { motion } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

const SQUARES = Array.from({ length: 88 }, () => ({
  delay:    +(Math.random() * 6).toFixed(2),
  duration: +(2.5 + Math.random() * 4).toFixed(2),
}))

function SquaresAnimation() {
  const ref = useRef(null)
  const [paused, setPaused] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setPaused(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)
    const onVisibility = () => setPaused(document.visibilityState !== 'visible')
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return (
    <>
      <style>{`@keyframes sqPulse { 0%,100%{opacity:0} 50%{opacity:1} }`}</style>
      <div
        ref={ref}
        aria-hidden="true"
        style={{
          position: 'absolute', bottom: 0, right: 0,
          width: '260px', height: '160px',
          display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)',
          gap: '5px', padding: '10px',
          maskImage: 'linear-gradient(135deg, transparent 35%, rgba(0,0,0,0.55) 100%)',
          WebkitMaskImage: 'linear-gradient(135deg, transparent 35%, rgba(0,0,0,0.55) 100%)',
          pointerEvents: 'none',
        }}
      >
        {SQUARES.map((sq, i) => (
          <div
            key={i}
            style={{
              borderRadius: '2px',
              background: 'rgba(47,47,47,0.12)',
              animation: `sqPulse ${sq.duration}s ${sq.delay}s ease-in-out infinite`,
              animationPlayState: paused ? 'paused' : 'running',
            }}
          />
        ))}
      </div>
    </>
  )
}

const MailIcon  = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><polyline points="2,4 12,13 22,4" /></svg>)
const PhoneIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.18 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.92 16z" /></svg>)
const MapIcon   = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>)
const ClockIcon = () => (<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>)

const contactInfo = [
  { icon: <MailIcon />,  label: 'Email',     value: 'hola@mindpatch.io' },
  { icon: <PhoneIcon />, label: 'Telefono',  value: '+52 81 4320 9175' },
  { icon: <MapIcon />,   label: 'Ubicacion', value: 'Monterrey, Nuevo Leon, Mexico' },
  { icon: <ClockIcon />, label: 'Horario',   value: 'Lun–Vie, 9:00 – 18:00 CST' },
]

function Field({ label, type = 'text', as = 'input', value, onChange }) {
  const [focused, setFocused] = useState(false)
  const commonStyle = {
    width: '100%',
    background: focused ? 'rgba(47,47,47,0.07)' : 'rgba(47,47,47,0.04)',
    border: `1px solid ${focused ? 'rgba(47,47,47,0.28)' : 'rgba(47,47,47,0.14)'}`,
    borderRadius: '10px',
    padding: as === 'textarea' ? '12px 14px' : '0 14px',
    height: as === 'textarea' ? '110px' : '44px',
    color: '#2F2F2F',
    fontSize: '14px',
    outline: 'none',
    resize: 'none',
    fontFamily: 'inherit',
    transition: 'border-color 0.2s, background 0.2s',
    boxSizing: 'border-box',
    display: 'block',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
      <label style={{ color: 'rgba(47,47,47,0.50)', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
        {label}
      </label>
      {as === 'textarea' ? (
        <textarea value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={commonStyle} />
      ) : (
        <input type={type} value={value} onChange={onChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} style={commonStyle} />
      )}
    </div>
  )
}

export function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => { e.preventDefault(); setSent(true) }
  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <section
      id="contacto"
      style={{
        position: 'relative',
        background: '#DADBC6',
        padding: '100px 0 120px',
        borderTop: '1px solid rgba(47,47,47,0.08)',
        overflow: 'hidden',
      }}
    >
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ marginBottom: '64px' }}
        >
          <span style={{ fontSize: '12px', color: 'rgba(47,47,47,0.45)', letterSpacing: '3px', textTransform: 'uppercase' }}>
            Contacto
          </span>
          <h2 style={{
            marginTop: '16px',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 700, color: '#2F2F2F',
            letterSpacing: '-0.02em', lineHeight: 1.2,
            margin: '16px 0 0',
          }}>
            Hablemos sobre<br />
            <span style={{ color: 'rgba(47,47,47,0.45)' }}>tu bienestar mental</span>
          </h2>
          <p style={{ marginTop: '16px', color: 'rgba(47,47,47,0.55)', fontSize: '17px', lineHeight: 1.7, maxWidth: '440px' }}>
            Tienes dudas, sugerencias o quieres saber mas sobre Mind Patch. Estamos para escucharte.
          </p>
        </motion.div>

        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

          {/* Columna izquierda — info */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75 }}
            style={{ flex: '1', minWidth: '260px' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {contactInfo.map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '14px',
                    padding: '16px 18px',
                    background: 'rgba(47,47,47,0.04)',
                    border: '1px solid rgba(47,47,47,0.12)',
                    borderRadius: '12px',
                  }}
                >
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '8px',
                    background: 'rgba(47,47,47,0.08)',
                    border: '1px solid rgba(47,47,47,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(47,47,47,0.55)', flexShrink: 0,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <p style={{ color: 'rgba(47,47,47,0.45)', fontSize: '10px', letterSpacing: '1.5px', textTransform: 'uppercase', margin: '0 0 4px' }}>
                      {item.label}
                    </p>
                    <p style={{ color: 'rgba(47,47,47,0.80)', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
                      {item.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Columna derecha — formulario */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.75, delay: 0.1 }}
            style={{ flex: '1.2', minWidth: '280px' }}
          >
            <div style={{
              background: 'rgba(47,47,47,0.05)',
              border: '1px solid rgba(47,47,47,0.12)',
              borderRadius: '20px',
              padding: '32px',
            }}>
              {sent ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  style={{ textAlign: 'center', padding: '24px 0' }}
                >
                  <div style={{
                    width: '52px', height: '52px', borderRadius: '50%',
                    background: 'rgba(16,185,129,0.12)',
                    border: '1px solid rgba(16,185,129,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 20px',
                  }}>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <p style={{ color: '#2F2F2F', fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>
                    Mensaje enviado
                  </p>
                  <p style={{ color: 'rgba(47,47,47,0.55)', fontSize: '14px', margin: 0 }}>
                    Te responderemos en menos de 24 horas.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <Field label="Nombre" value={form.name} onChange={set('name')} />
                  <Field label="Correo electronico" type="email" value={form.email} onChange={set('email')} />
                  <Field label="Mensaje" as="textarea" value={form.message} onChange={set('message')} />
                  <button
                    type="submit"
                    style={{
                      marginTop: '4px', padding: '13px',
                      background: '#f27059', color: 'white',
                      border: 'none', borderRadius: '10px',
                      fontSize: '14px', fontWeight: 600,
                      cursor: 'pointer', transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#d95e48'}
                    onMouseLeave={e => e.currentTarget.style.background = '#f27059'}
                  >
                    Enviar mensaje
                  </button>
                </form>
              )}
            </div>
          </motion.div>

        </div>
      </div>

      <SquaresAnimation />
    </section>
  )
}
