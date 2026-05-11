import React, { useState, useMemo, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

const API = "http://localhost:3000"

// ── Shader Material ───────────────────────────────────────────────────────────
const ShaderMat = ({ source, uniforms }) => {
  const { size } = useThree()
  const ref = useRef(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.material.uniforms.u_time.value = clock.getElapsedTime()
  })

  const getUniforms = () => {
    const prepared = {}
    for (const name in uniforms) {
      const u = uniforms[name]
      switch (u.type) {
        case "uniform1f":  prepared[name] = { value: u.value }; break
        case "uniform1i":  prepared[name] = { value: u.value }; break
        case "uniform1fv": prepared[name] = { value: u.value }; break
        case "uniform3fv": prepared[name] = { value: u.value.map(v => new THREE.Vector3().fromArray(v)) }; break
        default: break
      }
    }
    prepared["u_time"]       = { value: 0 }
    prepared["u_resolution"] = { value: new THREE.Vector2(size.width * 2, size.height * 2) }
    return prepared
  }

  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `
      precision mediump float;
      uniform vec2 u_resolution;
      out vec2 fragCoord;
      void main(){
        gl_Position = vec4(position.xy, 0.0, 1.0);
        fragCoord = (position.xy + vec2(1.0)) * 0.5 * u_resolution;
        fragCoord.y = u_resolution.y - fragCoord.y;
      }
    `,
    fragmentShader: source,
    uniforms: getUniforms(),
    glslVersion: THREE.GLSL3,
    blending: THREE.CustomBlending,
    blendSrc: THREE.SrcAlphaFactor,
    blendDst: THREE.OneFactor,
  }), [size.width, size.height, source])

  return (
    <mesh ref={ref}>
      <planeGeometry args={[2, 2]} />
      <primitive object={material} attach="material" />
    </mesh>
  )
}

// ── Dot Matrix ────────────────────────────────────────────────────────────────
const DotMatrix = ({ colors = [[218,219,198]], opacities = [0.04,0.04,0.04,0.04,0.04,0.08,0.08,0.08,0.08,0.14], totalSize = 20, dotSize = 2, reverse = false }) => {
  const colorsArray = useMemo(() => {
    let arr = [colors[0],colors[0],colors[0],colors[0],colors[0],colors[0]]
    if (colors.length === 2) arr = [colors[0],colors[0],colors[0],colors[1],colors[1],colors[1]]
    if (colors.length === 3) arr = [colors[0],colors[0],colors[1],colors[1],colors[2],colors[2]]
    return arr
  }, [colors])

  const uniforms = useMemo(() => ({
    u_colors:     { value: colorsArray.map(c => [c[0]/255, c[1]/255, c[2]/255]), type: "uniform3fv" },
    u_opacities:  { value: opacities,  type: "uniform1fv" },
    u_total_size: { value: totalSize,  type: "uniform1f"  },
    u_dot_size:   { value: dotSize,    type: "uniform1f"  },
    u_reverse:    { value: reverse ? 1 : 0, type: "uniform1i" },
  }), [colorsArray, opacities, totalSize, dotSize, reverse])

  const source = `
    precision mediump float;
    in vec2 fragCoord;
    uniform float u_time;
    uniform float u_opacities[10];
    uniform vec3 u_colors[6];
    uniform float u_total_size;
    uniform float u_dot_size;
    uniform vec2 u_resolution;
    uniform int u_reverse;
    out vec4 fragColor;
    float PHI = 1.61803398874989484820459;
    float random(vec2 xy){ return fract(tan(distance(xy*PHI,xy)*0.5)*xy.x); }
    void main(){
      vec2 st = fragCoord.xy;
      st.x -= abs(floor((mod(u_resolution.x,u_total_size)-u_dot_size)*0.5));
      st.y -= abs(floor((mod(u_resolution.y,u_total_size)-u_dot_size)*0.5));
      float opacity = step(0.0,st.x)*step(0.0,st.y);
      vec2 st2 = vec2(int(st.x/u_total_size),int(st.y/u_total_size));
      float show_offset = random(st2);
      float rand = random(st2*floor((u_time/5.0)+show_offset+5.0));
      opacity *= u_opacities[int(rand*10.0)];
      opacity *= 1.0-step(u_dot_size/u_total_size,fract(st.x/u_total_size));
      opacity *= 1.0-step(u_dot_size/u_total_size,fract(st.y/u_total_size));
      vec3 color = u_colors[int(show_offset*6.0)];
      vec2 center_grid = u_resolution/2.0/u_total_size;
      float dist = distance(center_grid,st2);
      float max_dist = distance(center_grid,vec2(0.0));
      float speed = 0.5;
      float offset_intro = dist*0.01+random(st2)*0.15;
      float offset_outro = (max_dist-dist)*0.02+random(st2+42.0)*0.2;
      if(u_reverse==1){
        opacity *= 1.0-step(offset_outro,u_time*speed);
        opacity *= clamp(step(offset_outro+0.1,u_time*speed)*1.25,1.0,1.25);
      } else {
        opacity *= step(offset_intro,u_time*speed);
        opacity *= clamp((1.0-step(offset_intro+0.1,u_time*speed))*1.25,1.0,1.25);
      }
      fragColor = vec4(color,opacity);
      fragColor.rgb *= fragColor.a;
    }
  `

  return (
    <Canvas style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
      <ShaderMat source={source} uniforms={uniforms} />
    </Canvas>
  )
}

const CanvasReveal = ({ colors = [[242,112,89]], dotSize = 3, reverse = false }) => (
  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
    <DotMatrix colors={colors} dotSize={dotSize} reverse={reverse} />
    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #1A1A10, transparent)' }} />
  </div>
)

// ── Campo de formulario ───────────────────────────────────────────────────────
function Field({ label, type = 'text', value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
      <label style={{ color: 'rgba(218,219,198,0.5)', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          background: focused ? 'rgba(218,219,198,0.08)' : 'rgba(218,219,198,0.04)',
          border: `1px solid ${focused ? 'rgba(218,219,198,0.28)' : 'rgba(218,219,198,0.12)'}`,
          borderRadius: '10px',
          padding: '11px 14px',
          color: '#DADBC6',
          fontSize: '14px',
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
          fontFamily: 'inherit',
          transition: 'border-color 0.2s, background 0.2s',
        }}
      />
    </div>
  )
}

// ── Sign In Page ──────────────────────────────────────────────────────────────
export function SignInPage({ onSuccess }) {
  const [mode, setMode]       = useState('login')    // 'login' | 'register'
  const [step, setStep]       = useState('form')     // 'form' | 'success'
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [showReverse, setShowReverse] = useState(false)
  const [showForward, setShowForward] = useState(true)
  const [pendingUser, setPendingUser] = useState(null)

  // Campos de formulario
  const [nombre,   setNombre]   = useState('')
  const [correo,   setCorreo]   = useState('')
  const [password, setPassword] = useState('')

  const resetError = () => setError('')

  const handleGoogleLogin = () => {
    const popup = window.open(
      `${API}/api/auth/google`,
      'google_auth',
      'width=500,height=600,left=400,top=100'
    )

    const onMessage = (e) => {
      if (e.data?.type !== 'GOOGLE_AUTH_SUCCESS') return
      window.removeEventListener('message', onMessage)
      if (popup && !popup.closed) popup.close()
      if (e.data.token) localStorage.setItem('mp_token', e.data.token)
      const tieneOnboarding = e.data.tiene_onboarding ?? false
      setPendingUser({
        nombre:           e.data.user?.nombre || e.data.user?.name || 'Usuario',
        foto:             e.data.user?.foto   || e.data.user?.picture || null,
        id:               e.data.user?.id     || e.data.user?._id   || e.data.user?.email,
        tiene_onboarding: tieneOnboarding,
        userType:         e.data.userType || null,
      })
      setShowReverse(true)
      setTimeout(() => setShowForward(false), 50)
      setTimeout(() => { setStep('success') }, 1200)
    }

    window.addEventListener('message', onMessage)
  }

  const switchMode = (m) => {
    setMode(m)
    setError('')
    setNombre('')
    setCorreo('')
    setPassword('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!correo || !password) { setError('Completa todos los campos.'); return }
    if (mode === 'register' && !nombre) { setError('Ingresa tu nombre.'); return }

    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body = mode === 'login'
        ? { correo, password }
        : { correo, password, nombre }

      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Ocurrió un error. Intenta de nuevo.')
        setLoading(false)
        return
      }

      if (data.token) localStorage.setItem('mp_token', data.token)

      const u = data.user || {}
      const tieneOnboarding = data.tiene_onboarding ?? false
      setPendingUser({
        nombre:           u.nombre || nombre || 'Usuario',
        foto:             u.foto || null,
        id:               u.id || u._id || correo,
        tiene_onboarding: tieneOnboarding,
        userType:         data.userType || null,
      })

      setShowReverse(true)
      setTimeout(() => setShowForward(false), 50)
      setTimeout(() => { setLoading(false); setStep('success') }, 1200)

    } catch {
      setError('No se pudo conectar al servidor.')
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '520px', background: '#1A1A10', overflow: 'hidden' }}>

      {/* Canvas de fondo animado */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        {showForward && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <CanvasReveal colors={[[242,112,89],[242,112,89]]} dotSize={6} reverse={false} />
          </div>
        )}
        {showReverse && (
          <div style={{ position: 'absolute', inset: 0 }}>
            <CanvasReveal colors={[[242,112,89],[242,112,89]]} dotSize={6} reverse={true} />
          </div>
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(20,20,10,0.92) 0%, rgba(20,20,10,0.6) 100%)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to bottom, #1A1A10, transparent)' }} />
      </div>

      {/* Contenido */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', minHeight: '520px', alignItems: 'center', justifyContent: 'center', padding: '40px 32px' }}>
        <div style={{ width: '100%', maxWidth: '340px' }}>
          <AnimatePresence mode="wait">

            {/* ── Formulario ── */}
            {step === 'form' && (
              <motion.div key={`form-${mode}`}
                initial={{ opacity: 0, x: mode === 'login' ? -30 : 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'login' ? -30 : 30 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                  {/* Título */}
                  <div style={{ textAlign: 'center', marginBottom: '4px' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#DADBC6', lineHeight: 1.1, letterSpacing: '-0.02em', margin: 0 }}>
                      {mode === 'login' ? 'Bienvenido' : 'Crear cuenta'}
                    </h1>
                    <p style={{ fontSize: '1rem', color: 'rgba(218,219,198,0.45)', fontWeight: 300, margin: '6px 0 0' }}>
                      {mode === 'login' ? 'Inicia sesion en Mind Patch' : 'Registro en Mind Patch'}
                    </p>
                  </div>

                  {/* Google */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', background: 'rgba(218,219,198,0.06)', border: '1px solid rgba(218,219,198,0.12)', color: '#DADBC6', borderRadius: '999px', padding: '11px 16px', cursor: 'pointer', fontSize: '14px', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(218,219,198,0.1)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(218,219,198,0.06)'}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                    Continuar con Google
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(218,219,198,0.12)' }} />
                    <span style={{ color: 'rgba(218,219,198,0.35)', fontSize: '12px' }}>o</span>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(218,219,198,0.12)' }} />
                  </div>

                  {/* Campos */}
                  {mode === 'register' && (
                    <Field label="Nombre" value={nombre} onChange={e => { setNombre(e.target.value); resetError() }} placeholder="Tu nombre" />
                  )}
                  <Field label="Correo" type="email" value={correo} onChange={e => { setCorreo(e.target.value); resetError() }} placeholder="tu@correo.com" />
                  <Field label="Contrasena" type="password" value={password} onChange={e => { setPassword(e.target.value); resetError() }} placeholder="••••••••" />

                  {/* Error */}
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{ color: '#ef4444', fontSize: '13px', margin: 0, textAlign: 'center', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '8px 12px' }}
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Botón submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%', borderRadius: '999px',
                      background: loading ? 'rgba(242,112,89,0.6)' : '#f27059',
                      color: 'white', fontWeight: 600,
                      padding: '12px', border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      fontSize: '14px', transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#d95e48' }}
                    onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#f27059' }}
                  >
                    {loading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesion' : 'Registrarse'}
                  </button>

                  {/* Toggle login/register */}
                  <p style={{ textAlign: 'center', fontSize: '13px', color: 'rgba(218,219,198,0.4)', margin: 0 }}>
                    {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
                    <span
                      onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
                      style={{ color: 'rgba(218,219,198,0.8)', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      {mode === 'login' ? 'Registrate' : 'Inicia sesion'}
                    </span>
                  </p>

                </form>
              </motion.div>
            )}

            {/* ── Exito ── */}
            {step === 'success' && (
              <motion.div key="success"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'center', alignItems: 'center' }}
              >
                <div>
                  <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: '#DADBC6', letterSpacing: '-0.02em', margin: 0 }}>
                    Estas dentro
                  </h1>
                  <p style={{ fontSize: '1rem', color: 'rgba(218,219,198,0.45)', margin: '6px 0 0' }}>
                    Bienvenido a Mind Patch
                  </p>
                </div>

                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4, type: 'spring' }}
                  style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#f27059', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <svg style={{ width: '32px', height: '32px' }} viewBox="0 0 20 20" fill="white">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  onClick={() => onSuccess(pendingUser)}
                  style={{ width: '100%', borderRadius: '999px', background: '#f27059', color: 'white', fontWeight: 600, padding: '13px', border: 'none', cursor: 'pointer', fontSize: '15px', transition: 'background 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#d95e48'}
                  onMouseLeave={e => e.currentTarget.style.background = '#f27059'}
                >
                  Ir a las evaluaciones
                </motion.button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
