import React, { useRef, useEffect, Suspense } from 'react'
import * as THREE from 'three'
import { ArrowRight, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const menuItems = [
  { name: 'Qué es',        href: '#features' },
  { name: 'Cómo funciona', href: '#como-funciona' },
  { name: 'Evaluación',    href: '#evaluacion' },
  { name: 'Contacto',      href: '#contacto' },
]

function GenerativeArtScene() {
  const mountRef = useRef(null)
  const lightRef = useRef(null)

  useEffect(() => {
    const currentMount = mountRef.current
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, currentMount.clientWidth / currentMount.clientHeight, 0.1, 1000)
    camera.position.z = 3
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    currentMount.appendChild(renderer.domElement)

    const geometry = new THREE.IcosahedronGeometry(1.2, 5)
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pointLightPos: { value: new THREE.Vector3(0, 0, 5) },
        color: { value: new THREE.Color('#ffffff') },
      },
      vertexShader: `
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        float snoise(vec3 v) {
          const vec2 C = vec2(1.0/6.0, 1.0/3.0);
          const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
          vec3 i = floor(v + dot(v, C.yyy));
          vec3 x0 = v - i + dot(i, C.xxx);
          vec3 g = step(x0.yzx, x0.xyz);
          vec3 l = 1.0 - g;
          vec3 i1 = min(g.xyz, l.zxy);
          vec3 i2 = max(g.xyz, l.zxy);
          vec3 x1 = x0 - i1 + C.xxx;
          vec3 x2 = x0 - i2 + C.yyy;
          vec3 x3 = x0 - D.yyy;
          i = mod289(i);
          vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0));
          float n_ = 0.142857142857;
          vec3 ns = n_ * D.wyz - D.xzx;
          vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
          vec4 x_ = floor(j * ns.z);
          vec4 y_ = floor(j - 7.0 * x_);
          vec4 x = x_ * ns.x + ns.yyyy;
          vec4 y = y_ * ns.x + ns.yyyy;
          vec4 h = 1.0 - abs(x) - abs(y);
          vec4 b0 = vec4(x.xy, y.xy);
          vec4 b1 = vec4(x.zw, y.zw);
          vec4 s0 = floor(b0) * 2.0 + 1.0;
          vec4 s1 = floor(b1) * 2.0 + 1.0;
          vec4 sh = -step(h, vec4(0.0));
          vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
          vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
          vec3 p0 = vec3(a0.xy, h.x);
          vec3 p1 = vec3(a0.zw, h.y);
          vec3 p2 = vec3(a1.xy, h.z);
          vec3 p3 = vec3(a1.zw, h.w);
          vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
          p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
          vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
          m = m * m;
          return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
        }
        void main() {
          vNormal = normal; vPosition = position;
          float displacement = snoise(position * 2.0 + time * 0.5) * 0.2;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position + normal * displacement, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color; uniform vec3 pointLightPos;
        varying vec3 vNormal; varying vec3 vPosition;
        void main() {
          vec3 n = normalize(vNormal);
          vec3 l = normalize(pointLightPos - vPosition);
          float diffuse = max(dot(n, l), 0.0);
          float fresnel = pow(1.0 - dot(n, vec3(0.0, 0.0, 1.0)), 2.0);
          gl_FragColor = vec4(color * diffuse + color * fresnel * 0.5, 1.0);
        }
      `,
      wireframe: true,
    })

    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)
    const pointLight = new THREE.PointLight(0xffffff, 1, 100)
    pointLight.position.set(0, 0, 5)
    lightRef.current = pointLight
    scene.add(pointLight)

    // Reusar vectores para evitar garbage collection en cada mousemove
    const _mouseVec = new THREE.Vector3()
    const _mouseDir = new THREE.Vector3()
    const _mousePos = new THREE.Vector3()

    let frameId
    let isVisible = true

    const animate = (t) => {
      if (!isVisible) return
      material.uniforms.time.value = t * 0.0003
      mesh.rotation.y += 0.0005
      mesh.rotation.x += 0.0002
      renderer.render(scene, camera)
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)

    // Pausar render cuando la sección no está en pantalla
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting
        if (isVisible) frameId = requestAnimationFrame(animate)
      },
      { threshold: 0 }
    )
    observer.observe(currentMount)

    // Pausar render cuando la pestaña no está activa
    const handleVisibility = () => {
      isVisible = document.visibilityState === 'visible'
      if (isVisible) frameId = requestAnimationFrame(animate)
    }

    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / currentMount.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight)
    }
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1
      const y = -(e.clientY / window.innerHeight) * 2 + 1
      _mouseVec.set(x, y, 0.5).unproject(camera)
      _mouseDir.copy(_mouseVec).sub(camera.position).normalize()
      const dist = -camera.position.z / _mouseDir.z
      _mousePos.copy(camera.position).addScaledVector(_mouseDir, dist)
      lightRef.current.position.copy(_mousePos)
      material.uniforms.pointLightPos.value.copy(_mousePos)
    }

    window.addEventListener('resize', handleResize, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      cancelAnimationFrame(frameId)
      observer.disconnect()
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('visibilitychange', handleVisibility)
      currentMount.removeChild(renderer.domElement)
      geometry.dispose()
      material.dispose()
      renderer.dispose()
    }
  }, [])

  return <div ref={mountRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }} />
}

function HeroHeader({ onAuthRequired }) {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50 }}>
      <div style={{
        margin: '16px auto',
        maxWidth: isScrolled ? '720px' : '1152px',
        padding: '0 32px',
        transition: 'all 0.3s ease',
        ...(isScrolled ? {
          background: 'rgba(0,0,0,0.6)',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)',
        } : {})
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>

          {/* Logo */}
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ position: 'relative', width: '20px', height: '20px' }}>
              {[
                { top: 0, left: '50%', transform: 'translateX(-50%)' },
                { top: '50%', left: 0, transform: 'translateY(-50%)' },
                { top: '50%', right: 0, transform: 'translateY(-50%)' },
                { bottom: 0, left: '50%', transform: 'translateX(-50%)' },
              ].map((s, i) => (
                <span key={i} style={{ position: 'absolute', width: '6px', height: '6px', borderRadius: '50%', background: 'white', ...s }} />
              ))}
            </div>
            <span style={{ color: 'white', fontWeight: 700, fontSize: '13px', letterSpacing: '3px', textTransform: 'uppercase' }}>
              Mind Patch
            </span>
          </a>

          {/* Links centro desktop */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '32px', position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}
            className="hidden lg:flex">
            {menuItems.map((item) => (
              <a key={item.name} href={item.href}
                style={{ color: 'rgb(156,163,175)', fontSize: '14px', textDecoration: 'none', whiteSpace: 'nowrap' }}
                onMouseEnter={e => e.target.style.color = 'white'}
                onMouseLeave={e => e.target.style.color = 'rgb(156,163,175)'}>
                {item.name}
              </a>
            ))}
          </nav>

          {/* Botones desktop */}
          <div className="hidden lg:flex" style={{ alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {!isScrolled && (
              <a href="#"
                onClick={e => { e.preventDefault(); onAuthRequired() }}
                style={{ padding: '6px 16px', fontSize: '13px', border: '1px solid rgba(255,255,255,0.2)', color: 'rgb(156,163,175)', borderRadius: '999px', textDecoration: 'none', cursor: 'pointer' }}
                onMouseEnter={e => { e.target.style.borderColor = 'white'; e.target.style.color = 'white' }}
                onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.2)'; e.target.style.color = 'rgb(156,163,175)' }}>
                Iniciar sesión
              </a>
            )}
            <a href="#"
              onClick={e => { e.preventDefault(); onAuthRequired() }}
              style={{ padding: '6px 16px', fontSize: '13px', fontWeight: 600, background: 'white', color: 'black', borderRadius: '999px', textDecoration: 'none', cursor: 'pointer' }}
              onMouseEnter={e => e.target.style.background = '#e5e5e5'}
              onMouseLeave={e => e.target.style.background = 'white'}>
              {isScrolled ? 'Comenzar →' : 'Comenzar'}
            </a>
          </div>

          {/* Hamburguesa */}
          <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden"
            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Menú mobile */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{ background: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '24px' }}>
                {menuItems.map((item) => (
                  <a key={item.name} href={item.href} onClick={() => setMenuOpen(false)}
                    style={{ color: 'rgb(156,163,175)', textDecoration: 'none', fontSize: '15px' }}>
                    {item.name}
                  </a>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <a href="#"
                  onClick={e => { e.preventDefault(); setMenuOpen(false); onAuthRequired() }}
                  style={{ textAlign: 'center', padding: '10px', border: '1px solid rgba(255,255,255,0.2)', color: 'rgb(156,163,175)', borderRadius: '999px', textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>
                  Iniciar sesión
                </a>
                <a href="#"
                  onClick={e => { e.preventDefault(); setMenuOpen(false); onAuthRequired() }}
                  style={{ textAlign: 'center', padding: '10px', background: 'white', color: 'black', borderRadius: '999px', textDecoration: 'none', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                  Comenzar
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}

export function HeroSection({ onAuthRequired }) {
  return (
    <>
      <HeroHeader onAuthRequired={onAuthRequired} />
      <section style={{ position: 'relative', width: '100%', height: '100vh', background: '#080808', overflow: 'hidden' }}>

        <Suspense fallback={null}>
          <GenerativeArtScene />
        </Suspense>

        <div style={{
          position: 'absolute', inset: 0, zIndex: 10,
          background: 'linear-gradient(to top, #080808 0%, rgba(8,8,8,0.7) 50%, transparent 100%)',
        }} />

        <div style={{
          position: 'relative', zIndex: 20,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'flex-end',
          height: '100%', textAlign: 'center',
          padding: '0 24px 100px',
        }}>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{ marginBottom: '24px' }}
          >
            <a href="#como-funciona" style={{
              display: 'inline-flex', alignItems: 'center', gap: '12px',
              borderRadius: '999px', border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              padding: '4px 4px 4px 16px', textDecoration: 'none',
            }}>
              <span style={{ fontSize: '13px', color: 'rgb(156,163,175)' }}>Evaluación mental + IA adaptativa</span>
              <span style={{ width: '1px', height: '16px', background: 'rgba(255,255,255,0.2)' }} />
              <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowRight size={12} color="white" />
              </span>
            </a>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3 }}
            style={{ fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: 700, color: 'white', lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: '800px', margin: '0 auto' }}
          >
            Tu mente primero,<br />
            <span style={{ color: 'rgb(107,114,128)' }}>luego el aprendizaje</span>
          </motion.h1>

          {/* Subtítulo */}
          <motion.p
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5 }}
            style={{ maxWidth: '500px', margin: '24px auto 0', fontSize: '17px', color: 'rgb(107,114,128)', lineHeight: 1.7 }}
          >
            Evalúa tu estado mental con juegos y pruebas interactivas.
            Sube tus apuntes y nuestra IA adapta tu sesión de estudio según cómo te sientes hoy.
          </motion.p>

          {/* Botones */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.7 }}
            style={{ marginTop: '32px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
          >
            <button
              onClick={() => onAuthRequired()}
              style={{ padding: '12px 28px', fontSize: '15px', fontWeight: 600, color: 'black', background: 'white', borderRadius: '999px', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => e.target.style.background = '#e5e5e5'}
              onMouseLeave={e => e.target.style.background = 'white'}>
              Comenzar evaluación
            </button>
            <a href="#como-funciona"
              style={{ padding: '12px 28px', fontSize: '15px', color: 'rgb(156,163,175)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '999px', textDecoration: 'none' }}>
              Ver cómo funciona
            </a>
          </motion.div>

        </div>
      </section>
    </>
  )
}