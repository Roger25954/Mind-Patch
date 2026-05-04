import { motion } from 'framer-motion'
import { useState } from 'react'

const games = [
  { id: 1, name: 'Test de Memoria',      emoji: '🧠', duration: '3 min',  difficulty: 'Fácil',   color: '#6366f1', desc: 'Mide tu capacidad de retención a corto plazo' },
  { id: 2, name: 'Velocidad de Reacción',emoji: '⚡', duration: '2 min',  difficulty: 'Media',   color: '#f59e0b', desc: 'Evalúa qué tan rápido responde tu mente' },
  { id: 3, name: 'Test de Ansiedad',     emoji: '📋', duration: '5 min',  difficulty: 'Fácil',   color: '#10b981', desc: 'Cuestionario clínico de estado emocional' },
  { id: 4, name: 'Enfoque y Atención',   emoji: '🎯', duration: '4 min',  difficulty: 'Difícil', color: '#ef4444', desc: 'Detecta tu nivel de concentración actual' },
  { id: 5, name: 'Respiración y Calma',  emoji: '🌬️', duration: '2 min',  difficulty: 'Fácil',   color: '#3b82f6', desc: 'Ejercicio guiado para reducir el estrés' },
  { id: 6, name: 'Asociación de Palabras',emoji: '💬', duration: '3 min', difficulty: 'Media',   color: '#8b5cf6', desc: 'Analiza patrones cognitivos y creatividad' },
]

const difficultyColor = {
  'Fácil':   'rgba(16,185,129,0.15)',
  'Media':   'rgba(245,158,11,0.15)',
  'Difícil': 'rgba(239,68,68,0.15)',
}
const difficultyText = {
  'Fácil':   '#10b981',
  'Media':   '#f59e0b',
  'Difícil': '#ef4444',
}

function GameCard({ game, index }) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: '14px 16px',
        borderRadius: '14px',
        background: hovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.05)'}`,
        cursor: 'pointer',
        transition: 'all 0.2s',
      }}
    >
      {/* Emoji icon */}
      <div style={{
        width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
        background: game.color + '20',
        border: `1px solid ${game.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px',
        transition: 'transform 0.2s',
        transform: hovered ? 'scale(1.1)' : 'scale(1)',
      }}>
        {game.emoji}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: 600, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {game.name}
          </p>
          <span style={{
            padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 500, flexShrink: 0,
            background: difficultyColor[game.difficulty],
            color: difficultyText[game.difficulty],
          }}>
            {game.difficulty}
          </span>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {game.desc}
        </p>
      </div>

      {/* Duración */}
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', margin: 0 }}>{game.duration}</p>
      </div>
    </motion.div>
  )
}

export function GamesSection() {
  return (
    <section id="evaluacion" style={{
      background: '#080808',
      padding: '100px 0 120px',
      overflow: 'hidden',
      borderTop: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '80px', flexWrap: 'wrap' }}>

          {/* Texto izquierda */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ flex: '1', minWidth: '280px' }}
          >
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', letterSpacing: '3px', textTransform: 'uppercase' }}>
              Evaluación
            </span>
            <h2 style={{
              marginTop: '16px',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 700, color: 'white',
              letterSpacing: '-0.02em', lineHeight: 1.2,
            }}>
              Conoce tu estado<br />
              <span style={{ color: 'rgb(107,114,128)' }}>antes de estudiar</span>
            </h2>
            <p style={{ marginTop: '20px', color: 'rgb(107,114,128)', fontSize: '17px', lineHeight: 1.7, maxWidth: '380px' }}>
              Completa juegos y pruebas rápidas. La IA analiza tus resultados y adapta tu sesión de estudio en tiempo real.
            </p>

            <div style={{ marginTop: '32px', display: 'flex', gap: '32px' }}>
              {[
                { number: '6', label: 'Evaluaciones' },
                { number: '~3', label: 'Minutos promedio' },
                { number: '100%', label: 'Adaptativo' },
              ].map((stat, i) => (
                <div key={i}>
                  <p style={{ color: 'white', fontSize: '24px', fontWeight: 700, margin: 0 }}>{stat.number}</p>
                  <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '12px', margin: '4px 0 0' }}>{stat.label}</p>
                </div>
              ))}
            </div>

            <motion.a
              href="#evaluacion"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'inline-block', marginTop: '36px',
                padding: '12px 28px', fontSize: '14px', fontWeight: 600,
                color: 'black', background: 'white',
                borderRadius: '999px', textDecoration: 'none',
              }}
            >
              Comenzar evaluación →
            </motion.a>
          </motion.div>

          {/* Mockup derecha inclinado */}
          <motion.div
            initial={{ opacity: 0, x: 40, rotate: 0 }}
            whileInView={{ opacity: 1, x: 0, rotate: 3 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.2 }}
            style={{ flex: '1', minWidth: '320px', maxWidth: '480px' }}
          >
            {/* Ventana de app */}
            <div style={{
              background: '#0f0f0f',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)',
            }}>

              {/* Titlebar */}
              <div style={{
                padding: '14px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'rgba(255,255,255,0.02)',
              }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['#ef4444', '#f59e0b', '#10b981'].map((c, i) => (
                    <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c, opacity: 0.7 }} />
                  ))}
                </div>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>Mind Patch — Evaluaciones</span>
                </div>
              </div>

              {/* Header de la lista */}
              <div style={{ padding: '16px 16px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Disponibles
                </span>
                <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px' }}>
                  {games.length} pruebas
                </span>
              </div>

              {/* Lista de juegos */}
              <div style={{ padding: '0 12px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {games.map((game, i) => (
                  <GameCard key={game.id} game={game} index={i} />
                ))}
              </div>

            </div>
          </motion.div>

        </div>
      </div>
    </section>
  )
}

