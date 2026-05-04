import { Brain, FileText, Sparkles, TrendingUp } from 'lucide-react'

const CardDecorator = ({ children }) => (
  <div aria-hidden className="relative mx-auto size-36"
    style={{ maskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 70%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 50% 50% at 50% 50%, #000 70%, transparent 100%)' }}>
    <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
    }} />
    <div style={{
      position: 'absolute', inset: 0,
      margin: 'auto',
      width: '48px', height: '48px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a0a0a',
      borderTop: '1px solid rgba(255,255,255,0.15)',
      borderLeft: '1px solid rgba(255,255,255,0.15)',
    }}>
      {children}
    </div>
  </div>
)

const cards = [
  {
    icon: <Brain size={24} color="white" />,
    title: 'Evaluación mental',
    description: 'Juegos y pruebas interactivas que miden tu estado emocional y cognitivo antes de cada sesión de estudio.',
  },
  {
    icon: <Sparkles size={24} color="white" />,
    title: 'IA adaptativa',
    description: 'Nuestra inteligencia artificial ajusta el ritmo, tono y profundidad del estudio según cómo te sientes hoy.',
  },
  {
    icon: <FileText size={24} color="white" />,
    title: 'Sube tus documentos',
    description: 'Carga tus PDFs o archivos Word y la IA los analiza para crear sesiones de estudio personalizadas.',
  },
  {
    icon: <TrendingUp size={24} color="white" />,
    title: 'Progreso personal',
    description: 'Monitorea tu bienestar mental a lo largo del tiempo y observa cómo mejora tu rendimiento académico.',
  },
]

export function Features() {
  return (
    <section id="features" style={{
      background: '#080808',
      padding: '96px 0',
      borderTop: '1px solid rgba(255,255,255,0.06)',
    }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{
            fontSize: '12px',
            color: 'rgba(255,255,255,0.3)',
            letterSpacing: '3px',
            textTransform: 'uppercase',
          }}>
            Lo que hace Mind Patch
          </span>
          <h2 style={{
            marginTop: '16px',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 700,
            color: 'white',
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}>
            Diseñado para cuidarte<br />
            <span style={{ color: 'rgb(107,114,128)' }}>mientras aprendes</span>
          </h2>
          <p style={{
            marginTop: '16px',
            color: 'rgb(107,114,128)',
            fontSize: '17px',
            maxWidth: '480px',
            margin: '16px auto 0',
            lineHeight: 1.6,
          }}>
            Cada función fue pensada para que tu bienestar y tu aprendizaje vayan de la mano.
          </p>
        </div>

        {/* Grid de cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
        }}>
          {cards.map((card, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '16px',
              padding: '32px 24px',
              textAlign: 'center',
              transition: 'border-color 0.3s, background 0.3s',
              cursor: 'default',
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
                e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
              }}
            >
              <CardDecorator>{card.icon}</CardDecorator>
              <h3 style={{
                marginTop: '24px',
                fontSize: '16px',
                fontWeight: 600,
                color: 'white',
              }}>
                {card.title}
              </h3>
              <p style={{
                marginTop: '10px',
                fontSize: '14px',
                color: 'rgb(107,114,128)',
                lineHeight: 1.7,
              }}>
                {card.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}