import { motion } from 'framer-motion'
import { useState } from 'react'

export function GamesSection({ onAuthRequired }) {
  const [hovered, setHovered] = useState(false)

  return (
    <section
      id="evaluacion"
      style={{
        background: '#080808',
        padding: '100px 0 120px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ textAlign: 'center', marginBottom: '56px' }}
        >
          <span style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '3px',
            textTransform: 'uppercase',
          }}>
            Evaluacion
          </span>
          <h2 style={{
            marginTop: '16px',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 700,
            color: 'white',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            margin: '16px 0 0',
          }}>
            Conoce tu estado<br />
            <span style={{ color: 'rgb(107,114,128)' }}>antes de estudiar</span>
          </h2>
          <p style={{
            marginTop: '16px',
            color: 'rgb(107,114,128)',
            fontSize: '17px',
            lineHeight: 1.7,
            maxWidth: '460px',
            margin: '16px auto 0',
          }}>
            Completa juegos y pruebas rapidas. La IA analiza tus resultados
            y adapta tu sesion de estudio en tiempo real.
          </p>
        </motion.div>

        {/* Game frame */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, delay: 0.15 }}
        >
          {/* Outer glow wrapper */}
          <div style={{
            position: 'relative',
            borderRadius: '20px',
            padding: '1px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.08) 100%)',
            boxShadow: '0 0 80px rgba(255,255,255,0.03), 0 40px 100px rgba(0,0,0,0.6)',
          }}>
            {/* Inner frame */}
            <div
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={() => setHovered(false)}
              style={{
                position: 'relative',
                width: '100%',
                paddingBottom: '62%',
                borderRadius: '19px',
                overflow: 'hidden',
                background: '#050505',
              }}
            >
              {/* Background grid */}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),' +
                  'linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
                pointerEvents: 'none',
              }} />

              {/* Subtle radial center glow */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,255,255,0.03) 0%, transparent 100%)',
                pointerEvents: 'none',
                opacity: hovered ? 1 : 0.5,
                transition: 'opacity 0.4s ease',
              }} />

              {/* Corner accents */}
              {[
                { top: 0, left: 0, borderTop: '1px solid rgba(255,255,255,0.2)', borderLeft: '1px solid rgba(255,255,255,0.2)', borderRadius: '19px 0 0 0' },
                { top: 0, right: 0, borderTop: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)', borderRadius: '0 19px 0 0' },
                { bottom: 0, left: 0, borderBottom: '1px solid rgba(255,255,255,0.2)', borderLeft: '1px solid rgba(255,255,255,0.2)', borderRadius: '0 0 0 19px' },
                { bottom: 0, right: 0, borderBottom: '1px solid rgba(255,255,255,0.2)', borderRight: '1px solid rgba(255,255,255,0.2)', borderRadius: '0 0 19px 0' },
              ].map((s, i) => (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    width: '28px',
                    height: '28px',
                    ...s,
                    opacity: hovered ? 1 : 0.4,
                    transition: 'opacity 0.4s ease',
                  }}
                />
              ))}

              {/* Center content */}
              <div style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '28px',
              }}>

                {/* Button */}
                <motion.button
                  onClick={onAuthRequired}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  style={{
                    position: 'relative',
                    padding: '16px 48px',
                    background: 'white',
                    color: 'black',
                    border: 'none',
                    borderRadius: '999px',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    letterSpacing: '0.3px',
                    boxShadow: '0 0 40px rgba(255,255,255,0.15), 0 8px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  Comenzar
                </motion.button>

                {/* Subtle hint */}
                <p style={{
                  color: 'rgba(255,255,255,0.2)',
                  fontSize: '12px',
                  margin: 0,
                  letterSpacing: '0.5px',
                  opacity: hovered ? 1 : 0,
                  transform: hovered ? 'translateY(0)' : 'translateY(6px)',
                  transition: 'opacity 0.35s ease, transform 0.35s ease',
                }}>
                  Inicia sesion para acceder a la evaluacion
                </p>
              </div>
            </div>
          </div>

          {/* Stats debajo del frame */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '48px',
              marginTop: '40px',
              flexWrap: 'wrap',
            }}
          >
            {[
              { number: '6',    label: 'Evaluaciones disponibles' },
              { number: '~3',   label: 'Minutos promedio' },
              { number: '100%', label: 'Adaptativo con IA' },
            ].map((stat, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{ color: 'white', fontSize: '22px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
                  {stat.number}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', margin: '5px 0 0', letterSpacing: '0.3px' }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>

      </div>
    </section>
  )
}
