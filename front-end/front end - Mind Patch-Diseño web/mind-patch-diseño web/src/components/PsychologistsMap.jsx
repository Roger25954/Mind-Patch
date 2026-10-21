import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { motion } from 'framer-motion'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const API = 'http://localhost:3000'

// Fix Leaflet default icon (Vite asset issue)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Icono personalizado morado para los psicólogos
const purpleIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-violet.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

// Icono azul para la posición del usuario
const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
})

// Centra el mapa cuando cambian las coords
function MapCenter({ lat, lng }) {
  const map = useMap()
  useEffect(() => { map.setView([lat, lng], 14) }, [lat, lng, map])
  return null
}

// ── Tarjeta de psicólogo ──────────────────────────────────────────────────────
function PsychCard({ p, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      style={{
        padding: '14px 16px',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '12px',
        display: 'flex', flexDirection: 'column', gap: '6px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px', fontWeight: 600, margin: 0, lineHeight: 1.3 }}>
          {p.name}
        </p>
        {p.openNow !== null && (
          <span style={{
            fontSize: '10px', fontWeight: 600, flexShrink: 0,
            padding: '2px 8px', borderRadius: '999px',
            background: p.openNow ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)',
            color: p.openNow ? '#34d399' : '#f87171',
            border: `1px solid ${p.openNow ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}>
            {p.openNow ? 'Abierto' : 'Cerrado'}
          </span>
        )}
      </div>

      <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', margin: 0, lineHeight: 1.4 }}>
        {p.address}
      </p>

      {p.rating !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#fbbf24', fontSize: '11px' }}>{'★'.repeat(Math.round(p.rating))}{'☆'.repeat(5 - Math.round(p.rating))}</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px' }}>{p.rating} ({p.totalRatings})</span>
        </div>
      )}
    </motion.div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export function PsychologistsMap() {
  const [status,   setStatus]   = useState('idle')   // idle | loading | ready | error
  const [userPos,  setUserPos]  = useState(null)
  const [places,   setPlaces]   = useState([])
  const [errorMsg, setErrorMsg] = useState('')

  const fetchNearby = (lat, lng) => {
    setStatus('loading')
    fetch(`${API}/api/maps/psychologists?lat=${lat}&lng=${lng}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setPlaces(data.data || [])
        setStatus('ready')
      })
      .catch(e => {
        setErrorMsg(e.message || 'Error al obtener resultados')
        setStatus('error')
      })
  }

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Tu navegador no soporta geolocalización')
      setStatus('error')
      return
    }
    setStatus('loading')
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserPos({ lat: coords.latitude, lng: coords.longitude })
        fetchNearby(coords.latitude, coords.longitude)
      },
      () => {
        setErrorMsg('No se pudo obtener tu ubicación. Permite el acceso en el navegador.')
        setStatus('error')
      }
    )
  }

  // Estado inicial: solicitar ubicación
  if (status === 'idle') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ paddingTop: '80px', textAlign: 'center', maxWidth: '420px', margin: '0 auto' }}
      >
        <div style={{
          width: '52px', height: '52px', borderRadius: '14px',
          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 700, color: 'white', letterSpacing: '-0.02em', margin: '0 0 10px' }}>
          Psicologos cerca de ti
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', margin: '0 0 32px', lineHeight: 1.6 }}>
          Encuentra profesionales de salud mental en tu area. Necesitamos acceder a tu ubicacion.
        </p>
        <button
          onClick={requestLocation}
          style={{
            padding: '12px 28px', background: 'white', color: 'black',
            border: 'none', borderRadius: '999px', fontSize: '14px',
            fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#e5e5e5'}
          onMouseLeave={e => e.currentTarget.style.background = 'white'}
        >
          Permitir ubicacion
        </button>
      </motion.div>
    )
  }

  // Cargando
  if (status === 'loading') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ paddingTop: '80px', textAlign: 'center' }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.1)',
            borderTop: '2px solid rgba(99,102,241,0.8)',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', margin: 0 }}>
            Buscando psicologos cerca...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </motion.div>
    )
  }

  // Error
  if (status === 'error') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ paddingTop: '80px', textAlign: 'center', maxWidth: '380px', margin: '0 auto' }}
      >
        <p style={{ color: '#f87171', fontSize: '14px', marginBottom: '20px' }}>{errorMsg}</p>
        <button
          onClick={() => setStatus('idle')}
          style={{
            padding: '10px 24px', background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)',
            borderRadius: '999px', fontSize: '13px', cursor: 'pointer',
          }}
        >
          Intentar de nuevo
        </button>
      </motion.div>
    )
  }

  // Mapa listo
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      style={{ display: 'flex', gap: '16px', height: 'calc(100vh - 32px)', paddingTop: '24px' }}
    >
      {/* ── Mapa ── */}
      <div style={{
        flex: '1 1 0', borderRadius: '16px', overflow: 'hidden',
        border: '1px solid rgba(255,255,255,0.08)',
        minHeight: '400px',
      }}>
        <MapContainer
          center={[userPos.lat, userPos.lng]}
          zoom={14}
          style={{ width: '100%', height: '100%', minHeight: '400px', background: '#080808' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <MapCenter lat={userPos.lat} lng={userPos.lng} />

          {/* Posicion del usuario */}
          <Marker position={[userPos.lat, userPos.lng]} icon={blueIcon}>
            <Popup>Tu ubicacion</Popup>
          </Marker>

          {/* Psicologos */}
          {places.map((p, i) => (
            p.lat && p.lng ? (
              <Marker key={i} position={[p.lat, p.lng]} icon={purpleIcon}>
                <Popup>
                  <div style={{ minWidth: '160px' }}>
                    <strong>{p.name}</strong><br />
                    <span style={{ fontSize: '12px', color: '#555' }}>{p.address}</span>
                    {p.rating && <><br /><span style={{ fontSize: '12px' }}>{'★'.repeat(Math.round(p.rating))} {p.rating}</span></>}
                  </div>
                </Popup>
              </Marker>
            ) : null
          ))}
        </MapContainer>
      </div>

      {/* ── Lista ── */}
      <div style={{
        width: '280px', flexShrink: 0,
        display: 'flex', flexDirection: 'column', gap: '8px',
        overflowY: 'auto', maxHeight: 'calc(100vh - 180px)',
        paddingRight: '4px',
      }}>
        <div style={{ marginBottom: '4px' }}>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', margin: '0 0 4px' }}>
            Resultados
          </p>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '12px', margin: 0 }}>
            {places.length} psicologos encontrados
          </p>
        </div>

        {places.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>
            No se encontraron resultados en tu area.
          </p>
        ) : (
          places.map((p, i) => <PsychCard key={i} p={p} index={i} />)
        )}
      </div>
    </motion.div>
  )
}
