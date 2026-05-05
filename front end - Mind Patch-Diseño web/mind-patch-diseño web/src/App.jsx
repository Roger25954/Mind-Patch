import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HeroSection } from './components/HeroSection'
import { Features } from './components/Features'
import { GamesSection } from './components/GamesSection'
import { PromptBox } from './components/PromptBox'
import { SignInPage } from './components/SignInPage'
import { ContactSection } from './components/ContactSection'

function App() {
  const [showAuth, setShowAuth] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleAuthRequired = () => {
    if (!isLoggedIn) setShowAuth(true)
  }

  return (
    <div style={{ background: '#080808' }}>

      {/* Modal de login */}
      <AnimatePresence>
        {showAuth && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowAuth(false)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', cursor: 'pointer' }}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '460px', margin: '0 24px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 40px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.08)' }}
            >
              {/* Botón cerrar */}
              <button
                onClick={() => setShowAuth(false)}
                style={{
                  position: 'absolute', top: '16px', right: '16px', zIndex: 200,
                  background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
                  width: '32px', height: '32px', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', color: 'white', fontSize: '16px',
                  lineHeight: 1,
                }}>
                ✕
              </button>

              <SignInPage onSuccess={() => { setIsLoggedIn(true); setShowAuth(false) }} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <HeroSection onAuthRequired={handleAuthRequired} />
      <Features />
      <GamesSection onAuthRequired={handleAuthRequired} />
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '60px 24px' }}>
        <PromptBox />
      </div>
      <ContactSection />

    </div>
  )
}

export default App