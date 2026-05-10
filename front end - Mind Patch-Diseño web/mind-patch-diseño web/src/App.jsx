// App.jsx
// Flujo completo:
//   landing → auth (SignInPage) → onboarding (pasos 1-3) → GameMenu
//
// El onboarding recopila consentimiento, tipo de usuario y contexto.
// formData.userType ('adult' | 'adolescent' | 'child') se pasa a GameMenu:
//   adult      → tareas cognitivas (ASRS, Stroop, etc.)
//   adolescent / child → juegos (menores)
// El paso 3 valida que la edad coincida: niño 4–11, adolescente 11–17, adulto 18+.

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HeroSection }     from './components/HeroSection'
import { Features }        from './components/Features'
import { MetricsSection }  from './components/MetricsSection'
import { ContactSection }  from './components/ContactSection'
import { SignInPage }      from './components/SignInPage'
import { GameMenu }        from './components/GameMenu'

// Onboarding steps
import Step1Consent  from './components/Step1Consent'
import Step2UserType from './components/Step2UserType'
import Step3Context  from './components/Step3Context'

// ── Estado inicial del formulario de onboarding ───────────────────────────────
const INITIAL_FORM = {
  userType:  '',   // 'adult' | 'adolescent' | 'child'
  tutorName: '',
  tutorRel:  '',
  age:       '',
  gender:    '',
  education: '',
  job:       '',
  reason:    '',
  sleep:     3,
  anxiety:   3,
  attention: 3,
}

// ── Paso pequeño de progreso visible en el modal ──────────────────────────────
function OnboardingProgress({ step }) {
  const steps = ['Consentimiento', 'Perfil', 'Contexto']
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      padding: '16px 24px 0',
    }}>
      {steps.map((label, i) => {
        const num   = i + 1
        const done  = step > num
        const active = step === num
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: i < steps.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '11px', fontWeight: 700,
                background: done ? '#f27059' : active ? 'rgba(242,112,89,0.12)' : 'rgba(218,219,198,0.06)',
                border: `1.5px solid ${done ? '#f27059' : active ? 'rgba(242,112,89,0.5)' : 'rgba(218,219,198,0.12)'}`,
                color: done ? '#fff' : active ? '#f27059' : 'rgba(218,219,198,0.3)',
                transition: 'all .3s',
              }}>
                {done ? '✓' : num}
              </div>
              <span style={{
                fontSize: '11px', fontWeight: active ? 600 : 400,
                color: done ? '#f27059' : active ? 'rgba(218,219,198,0.9)' : 'rgba(218,219,198,0.3)',
                transition: 'color .3s',
              }}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                flex: 1, height: '1px',
                background: done ? 'rgba(242,112,89,0.5)' : 'rgba(218,219,198,0.1)',
                transition: 'background .3s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  // Vistas principales
  const [view, setView] = useState('landing') // 'landing' | 'games'

  // Auth
  const [showAuth,   setShowAuth]   = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user,       setUser]       = useState(null)

  // Onboarding
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardStep,    setOnboardStep]    = useState(1)  // 1 | 2 | 3
  const [formData,       setFormData]       = useState(INITIAL_FORM)

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleAuthRequired = () => {
    if (isLoggedIn) {
      setView('games')
    } else {
      setShowAuth(true)
    }
  }

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setIsLoggedIn(true)
    setShowAuth(false)
    if (userData?.tiene_onboarding) {
      // Onboarding ya completado → ir directo a juegos
      setFormData(prev => ({ ...prev, userType: userData.userType || '' }))
      setView('games')
    } else {
      setOnboardStep(1)
      setFormData(INITIAL_FORM)
      setShowOnboarding(true)
    }
  }

  const handleOnboardNext = async () => {
    if (onboardStep < 3) {
      setOnboardStep(s => s + 1)
    } else {
      // Guardar onboarding en BD
      try {
        const token = localStorage.getItem('mp_token')
        await fetch('http://localhost:3000/api/auth/profile/onboarding', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': token },
          body: JSON.stringify(formData),
        })
      } catch (_) {}
      setShowOnboarding(false)
      setView('games')
    }
  }

  const handleOnboardBack = () => {
    if (onboardStep === 1) {
      // Volver al login
      setShowOnboarding(false)
      setShowAuth(true)
    } else {
      setOnboardStep(s => s - 1)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('mp_token')
    setIsLoggedIn(false)
    setUser(null)
    setView('landing')
  }

  // ── Vista de juegos ───────────────────────────────────────────────────────────
  if (view === 'games') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <GameMenu
          onBack={() => setView('landing')}
          user={user}
          userType={formData.userType}   // ← pasa el perfil al GameMenu
          contextData={formData}         // ← pasa todo el contexto por si se necesita
        />
      </motion.div>
    )
  }

  // ── Landing ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: '#DADBC6' }}>

      {/* ── Modal de Auth ── */}
      <AnimatePresence>
        {showAuth && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAuth(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', cursor: 'pointer' }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '460px', margin: '0 24px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)' }}
            >
              <button
                onClick={() => setShowAuth(false)}
                style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 200, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: '16px' }}
              >✕</button>
              <SignInPage onSuccess={handleLoginSuccess} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Modal de Onboarding (pasos 1-3) ── */}
      <AnimatePresence>
        {showOnboarding && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
            />

            {/* Panel */}
            <motion.div
              key={onboardStep}
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1,    y: 0 }}
              exit={{   opacity: 0, scale: 0.96,   y: -8 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              style={{
                position: 'relative', zIndex: 1,
                width: '100%', maxWidth: '560px', margin: '0 24px',
                borderRadius: '24px', overflow: 'hidden',
                background: '#1A1A10',
                boxShadow: '0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)',
                maxHeight: '90vh', overflowY: 'auto',
              }}
            >
              {/* Barra de progreso */}
              <OnboardingProgress step={onboardStep} />

              {/* Contenido del paso */}
              <div style={{ padding: '20px 24px 28px' }}>
                <AnimatePresence mode="wait">
                  {onboardStep === 1 && (
                    <motion.div key="s1" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}>
                      <Step1Consent onNext={handleOnboardNext} onBack={handleOnboardBack} />
                    </motion.div>
                  )}
                  {onboardStep === 2 && (
                    <motion.div key="s2" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}>
                      <Step2UserType onNext={handleOnboardNext} onBack={handleOnboardBack} data={formData} setData={setFormData} />
                    </motion.div>
                  )}
                  {onboardStep === 3 && (
                    <motion.div key="s3" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.22 }}>
                      <Step3Context onNext={handleOnboardNext} onBack={handleOnboardBack} data={formData} setData={setFormData} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Landing ── */}
      <HeroSection onAuthRequired={handleAuthRequired} isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />
      <Features />
      <MetricsSection />
      <ContactSection />
    </div>
  )
}

export default App