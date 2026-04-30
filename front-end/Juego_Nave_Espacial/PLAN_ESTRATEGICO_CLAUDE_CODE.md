# 🧠 Plan Estratégico: Rediseño de "El Guardián Espacial"
### Como Herramienta de Evaluación Cognitiva Go/No-Go para Niños
> **Documento dirigido a Claude Code** — Instrucciones completas para rediseñar el videojuego desde la base funcional existente.

---

## 🎯 Objetivo Central

Transformar el juego actual de disparos espaciales en una **prueba conductual estandarizada Go/No-Go** con narrativa espacial para niños (6–12 años), capaz de medir:
- Atención sostenida
- Control inhibitorio (impulsividad)
- Tiempo de reacción
- Variación del rendimiento en el tiempo (4 sectores)

El juego debe ser **clínicamente útil** (estructura Go/No-Go validada) y **visualmente atractivo para niños** sin sacrificar la estandarización de los estímulos.

---

## 🔴 Qué ELIMINAR del juego actual

| Elemento actual | Razón para eliminar |
|---|---|
| Sistema de disparos con balas (`bullet.ts`) | Introduce puntería como variable; contamina la medición |
| `ShootHandler` con raycasting de ratón | No es una prueba de precisión motora |
| Colisión bala → obstáculo | Reemplazar por detección de respuesta de teclado/touch |
| Obstáculo tipo `Dog` (alienigena) | Introduce ambigüedad; solo deben existir Go y No-Go |
| Movimiento lateral de la nave (izquierda/derecha) | Distrae de la tarea central |
| Fin de juego por colisión con obstáculo | La nave no puede "morir"; es una prueba, no un juego de supervivencia |
| Debug panel visible en producción | Modo debug solo para desarrollador |

---

## 🟢 Qué CONSERVAR del juego actual

| Elemento actual | Razón para conservar |
|---|---|
| Stack Three.js + TypeScript + Vite | Base técnica sólida y probada |
| Arquitectura modular (`core/`) | Facilita reemplazo de módulos individualmente |
| Nave avanzando automáticamente | Crea sensación de viaje/avance sin input de dirección |
| Skybox + campo de estrellas | Atmósfera visual inmersiva para niños |
| Bloom post-processing | Estética visual atractiva |
| Sistema de métricas en `score.ts` | Expandir para incluir tiempo de reacción por sector |
| Pantalla de resultados final | Rediseñar para mostrar métricas cognitivas |
| `obstacle.ts` base | Refactorizar tipos: solo Star (Go) y Trash (No-Go) |

---

## 🏗️ Nueva Arquitectura Propuesta

```
Juego_Nave_Espacial/
├─ Index.html
├─ package.json
├─ tsconfig.json
├─ src/
│  ├─ main.ts
│  ├─ style.css
│  └─ core/
│     ├─ app.ts                    ← Rediseñar: orquestación + gestión de sectores
│     ├─ spaceship.ts              ← Simplificar: solo avance automático, sin disparos
│     ├─ stimulus.ts               ← NUEVO: reemplaza obstacle.ts (estímulos Go/No-Go)
│     ├─ stimulus_scheduler.ts     ← NUEVO: reemplaza obstacle_spawner.ts
│     ├─ response_detector.ts      ← NUEVO: reemplaza collision_manager.ts + shoot_handler.ts
│     ├─ metrics_tracker.ts        ← NUEVO: reemplaza score.ts (métricas clínicas)
│     ├─ sector_manager.ts         ← NUEVO: gestiona los 4 sectores galácticos
│     ├─ hud.ts                    ← NUEVO: interfaz HUD simplificada para niños
│     ├─ results_screen.ts         ← Rediseñar: game_over_screen.ts con métricas
│     ├─ camera.controller.ts      ← Conservar tal cual
│     ├─ input_controller.ts       ← Extender: agregar soporte touch para móvil
│     ├─ particle_system.ts        ← Conservar: feedback visual de respuestas
│     ├─ skybox.ts                 ← Conservar tal cual
│     ├─ starfield.ts              ← Conservar tal cual
│     └─ index.ts                  ← Actualizar exports
└─ public/
   ├─ skybox/
   ├─ spaceship.glb
   ├─ star.glb                     ← Modelo Go (estrella fugaz, brillante)
   └─ trash.glb                    ← Modelo No-Go (basura espacial, opaca)
```

---

## 📐 Diseño de la Prueba Go/No-Go

### Parámetros de Estímulos (basados en literatura de TDAH)

```typescript
// stimulus_scheduler.ts — Configuración clínica
const PRUEBA_CONFIG = {
  // Proporción Go/No-Go recomendada: 75% Go, 25% No-Go
  goRatio: 0.75,
  noGoRatio: 0.25,

  // Tiempo de presentación del estímulo en pantalla
  stimulusDurationMs: 1200,       // 1.2 segundos visible

  // Intervalo entre estímulos (inter-stimulus interval)
  minISI_ms: 1500,                // mínimo 1.5s entre estímulos
  maxISI_ms: 3000,                // máximo 3.0s entre estímulos

  // Total de estímulos por sector
  stimuliPerSector: 25,           // 25 por sector × 4 sectores = 100 total

  // Ventana de respuesta válida
  responseWindowMs: 1200,         // Solo cuentan respuestas dentro de este tiempo

  // Número de sectores
  numSectors: 4,

  // Duración de pantalla de transición entre sectores
  sectorBreakMs: 5000             // 5 segundos de descanso
}
```

### Tipos de Estímulo

```typescript
// stimulus.ts
enum StimulusType {
  Go = 'star',      // ⭐ Estrella fugaz → el niño DEBE presionar espacio
  NoGo = 'trash'    // 🗑️ Basura espacial → el niño NO debe hacer nada
}

interface StimulusPresentation {
  type: StimulusType
  appearedAt: number     // timestamp DOMHighResTimeStamp
  respondedAt: number | null
  response: 'hit' | 'miss' | 'false_alarm' | 'correct_rejection'
  reactionTimeMs: number | null
  sector: number         // 1, 2, 3 o 4
}
```

---

## 📊 Módulo: `metrics_tracker.ts` (Nuevo)

Este es el módulo más crítico. Debe registrar con precisión nanosegundos usando `performance.now()`.

```typescript
interface SectorMetrics {
  sectorNumber: number
  hits: number                   // Respuestas correctas a Go
  misses: number                 // Omisiones (no respondió a Go)
  falseAlarms: number            // Errores impulsivos (respondió a No-Go)
  correctRejections: number      // No respondió a No-Go (correcto)
  reactionTimes: number[]        // Array de RT en ms (solo hits)
  avgReactionTimeMs: number      // Promedio de RT
  medianReactionTimeMs: number   // Mediana de RT
  sdReactionTimeMs: number       // Desviación estándar RT
  accuracyPercent: number        // (hits / totalGo) * 100
  commissionErrorRate: number    // (falseAlarms / totalNoGo) * 100
}

interface SessionMetrics {
  totalStimuli: number
  totalGo: number
  totalNoGo: number
  globalHits: number
  globalMisses: number
  globalFalseAlarms: number
  globalCorrectRejections: number
  globalAvgRT: number
  globalAccuracy: number
  sectors: SectorMetrics[]       // Métricas por sector [1,2,3,4]
  sessionDurationMs: number
  rawTrials: StimulusPresentation[]  // Datos crudos para exportar
}
```

**Indicadores de alerta TDAH** (umbrales orientativos, no diagnósticos):
- RT promedio > 600ms → posible lentitud atencional
- SD del RT alta (> 200ms) → variabilidad atencional (señal clave de TDAH)
- Tasa de omisiones > 25% → inatención
- Tasa de errores por comisión > 30% → impulsividad
- Degradación entre Sector 1 y Sector 4 → dificultad con atención sostenida

---

## 🕹️ Módulo: `response_detector.ts` (Nuevo)

Reemplaza `collision_manager.ts` y `shoot_handler.ts`. Es el árbitro de cada intento.

```typescript
class ResponseDetector {
  private currentStimulus: StimulusPresentation | null = null
  private responseWindowTimer: number | null = null

  // Llamado por stimulus_scheduler cuando aparece un estímulo
  onStimulusAppeared(stimulus: StimulusPresentation): void {
    this.currentStimulus = stimulus
    // Iniciar ventana de respuesta
    this.responseWindowTimer = setTimeout(
      () => this.onResponseWindowExpired(),
      PRUEBA_CONFIG.responseWindowMs
    )
  }

  // Llamado por input_controller cuando el niño presiona espacio/toca pantalla
  onPlayerResponse(): void {
    if (!this.currentStimulus) {
      // Respuesta sin estímulo activo → ignorar (no penalizar)
      return
    }

    const rt = performance.now() - this.currentStimulus.appearedAt
    this.currentStimulus.respondedAt = performance.now()
    this.currentStimulus.reactionTimeMs = rt

    if (this.currentStimulus.type === StimulusType.Go) {
      this.currentStimulus.response = 'hit'
      // Feedback visual positivo: partículas verdes/doradas
      this.triggerHitFeedback()
    } else {
      this.currentStimulus.response = 'false_alarm'
      // Feedback visual suave: leve destello rojo (no aterrador para niños)
      this.triggerFalseAlarmFeedback()
    }

    this.metricsTracker.recordTrial(this.currentStimulus)
    this.clearCurrentStimulus()
  }

  // Se cumplió el tiempo sin respuesta
  private onResponseWindowExpired(): void {
    if (!this.currentStimulus) return

    if (this.currentStimulus.type === StimulusType.Go) {
      this.currentStimulus.response = 'miss'
      // Feedback sutil: el estímulo se desvanece sin recompensa
    } else {
      this.currentStimulus.response = 'correct_rejection'
      // No hay feedback especial (la ausencia es la respuesta correcta)
    }

    this.metricsTracker.recordTrial(this.currentStimulus)
    this.clearCurrentStimulus()
  }
}
```

---

## 🌌 Módulo: `sector_manager.ts` (Nuevo)

Gestiona la estructura de 4 sectores galácticos y las transiciones.

```typescript
const SECTOR_NAMES = [
  'Nebulosa Polar',      // Sector 1
  'Cinturón de Asteria', // Sector 2
  'Cuadrante Lyra',      // Sector 3
  'Fosa Abismal'         // Sector 4
]

class SectorManager {
  private currentSector = 1
  private onSectorComplete: (sector: number) => void
  private onAllSectorsComplete: () => void

  // Muestra pantalla de transición entre sectores
  showSectorTransition(sectorNumber: number): void {
    // HUD muestra: "¡Sector completado! Descansando..."
    // Cuenta regresiva de 5 segundos visible para el niño
    // Cambio visual en el skybox o color del campo estelar
  }

  // Nombre del sector actual para el HUD
  getCurrentSectorName(): string {
    return SECTOR_NAMES[this.currentSector - 1]
  }
}
```

---

## 🎨 Módulo: `hud.ts` (Nuevo)

HUD minimalista diseñado para niños. **NO mostrar métricas en tiempo real** (distrae de la tarea). Solo información de navegación/contexto.

```
┌─────────────────────────────────────────────┐
│  🌌 NEBULOSA POLAR    [■■■□□] Sector 1/4   │
│                                              │
│         [ESPACIO DE JUEGO 3D]               │
│                                              │
│  ⭐ Presiona ESPACIO cuando veas estrellas  │
│     (Mensaje solo durante los primeros 10s)  │
└─────────────────────────────────────────────┘
```

**Elementos del HUD:**
- Nombre del sector actual (arriba izquierda)
- Barra de progreso del sector (arriba derecha) — no puntaje numérico
- Recordatorio de instrucción (solo al inicio de cada sector, desaparece en 10s)
- Indicador de descanso durante transición de sector

**NO mostrar:** puntuación en vivo, conteo de errores, tiempo de reacción durante la prueba.

---

## 🖥️ Módulo: `results_screen.ts` (Rediseñar)

Dos versiones de la pantalla de resultados:

### Vista para el Niño (mostrar primero)
```
┌──────────────────────────────────┐
│   🚀 ¡Misión Completada!         │
│                                  │
│   Exploraste 4 sectores          │
│   galácticos. ¡Bien hecho!       │
│                                  │
│   [Imagen de nave en galaxia]    │
│                                  │
│   [Botón: VER RESULTADOS →]      │
└──────────────────────────────────┘
```

### Vista para el Evaluador (adulto)
```
┌────────────────────────────────────────────────────┐
│  RESULTADOS DE EVALUACIÓN — El Guardián Espacial   │
├──────────────────────────────────────────────────  ┤
│  RESUMEN GLOBAL                                     │
│  Precisión: 82%  │  RT Promedio: 387ms  │  SD: 143ms│
│  Omisiones: 12   │  Errores Impuls.: 4              │
├────────────────────────────────────────────────────┤
│  RENDIMIENTO POR SECTOR                             │
│  Sector    Prec.    RT(ms)   SD    Omis.  Imp.     │
│  1 (Polar)  90%      342     98      2     1       │
│  2 (Asteria)88%      361    112      3     1       │
│  3 (Lyra)   78%      401    157      4     1       │
│  4 (Abismal)72%      431    198      3     1       │
├────────────────────────────────────────────────────┤
│  OBSERVACIONES                                      │
│  ⚠ Aumento en RT y SD hacia el Sector 4            │
│    (posible fatiga atencional)                      │
│  ⚠ Tasa de omisiones 12% (umbral: >25%)            │
│                                                     │
│  [📊 Exportar CSV]   [🔄 Nueva sesión]             │
└────────────────────────────────────────────────────┘
```

---

## ✏️ Rediseño de Módulos Existentes

### `spaceship.ts` — Simplificar

**Eliminar:** método `shoot()`, array de balas, cooldown de disparo, rotación lateral.
**Conservar:** modelo 3D, movimiento automático hacia adelante, carga del GLB.
**Agregar:** animación sutil de "impulso" cuando el niño da una respuesta correcta (leve shake o brillo).

### `stimulus.ts` — Reemplaza `obstacle.ts`

**Eliminar:** tipo `Dog`, velocidad aleatoria agresiva, colisión con la nave.
**Nueva lógica de aparición:**
- El estímulo aparece frontalmente a la nave, bien centrado en pantalla
- Viaja hacia la nave a velocidad CONSTANTE y estandarizada (no aleatoria)
- El modelo 3D rota suavemente para ser reconocible
- Al expirar la ventana de respuesta, desaparece suavemente (fade out)
- **La nave NUNCA colisiona con estímulos** — pasan a través de ella

### `stimulus_scheduler.ts` — Reemplaza `obstacle_spawner.ts`

**Eliminar:** intervalo fijo de 200 frames, selección aleatoria pura de tipos.
**Nueva lógica:**
```
Por sector (25 estímulos):
1. Generar lista de 25 estímulos: ~19 Go + ~6 No-Go (ratio 75/25)
2. Ordenar aleatoriamente pero evitar más de 3 Go consecutivos
3. Inter-stimulus interval (ISI) aleatorio entre min y max configurado
4. Presentar uno por uno, esperar respuesta o expiración
5. Solo presentar el siguiente cuando el actual fue resuelto
```

### `input_controller.ts` — Extender

**Agregar soporte touch** para tablets (uso frecuente en evaluaciones infantiles):
```typescript
// Toque en cualquier parte de la pantalla = respuesta (como barra espaciadora)
document.addEventListener('touchstart', (e) => {
  e.preventDefault()
  this.spacePressed = true
}, { passive: false })
```

**Agregar timestamp preciso:**
```typescript
onSpacePressed(): { pressed: boolean; timestamp: number } {
  return {
    pressed: this.consumeSpace(),
    timestamp: performance.now()
  }
}
```

---

## 🎬 Flujo Completo del Juego Rediseñado

```
1. PANTALLA DE BIENVENIDA
   "¡Hola, piloto espacial!"
   Instrucciones animadas:
   - ⭐ "Presiona ESPACIO cuando veas una ESTRELLA"
   - 🗑️ "No hagas nada cuando veas BASURA"
   [Botón: ¡COMENZAR MISIÓN!]

2. PRÁCTICA (opcional, 10 estímulos)
   - 5 Go + 5 No-Go
   - Feedback inmediato y explícito ("¡Bien!" / "Recuerda, eso era basura")
   - No se registran métricas

3. SECTOR 1: Nebulosa Polar (25 estímulos)
   - Presentación estandarizada
   - Sin feedback verbal (solo visual sutil)
   - Registro preciso de todas las respuestas

4. TRANSICIÓN → "¡Llegaste a Asteria! Descansa 5 segundos..."

5. SECTOR 2: Cinturón de Asteria (25 estímulos)

6. TRANSICIÓN → "¡Entrando a Lyra! Descansa 5 segundos..."

7. SECTOR 3: Cuadrante Lyra (25 estímulos)

8. TRANSICIÓN → "¡Último sector! Fosa Abismal..."

9. SECTOR 4: Fosa Abismal (25 estímulos)

10. RESULTADOS
    → Vista niño (felicitación)
    → Vista evaluador (métricas detalladas + exportar CSV)
```

---

## 📁 Archivos a Crear Desde Cero

| Archivo | Descripción |
|---|---|
| `stimulus.ts` | Clase Stimulus con tipo Go/No-Go, aparición estandarizada, fade out |
| `stimulus_scheduler.ts` | Generador de secuencias estandarizadas, ISI aleatorio |
| `response_detector.ts` | Árbitro de respuestas: hit, miss, false_alarm, correct_rejection |
| `metrics_tracker.ts` | Registro de métricas clínicas con performance.now() |
| `sector_manager.ts` | Gestión de 4 sectores, transiciones, nombres galácticos |
| `hud.ts` | HUD minimalista para niños, sin métricas en tiempo real |

## 📁 Archivos a Modificar

| Archivo | Cambios |
|---|---|
| `app.ts` | Remover disparos; integrar sector_manager, response_detector, metrics_tracker |
| `spaceship.ts` | Eliminar shoot(), balas, rotación lateral; agregar feedback de hit |
| `input_controller.ts` | Agregar soporte touch, timestamp preciso |
| `results_screen.ts` | Dos vistas: niño + evaluador; exportar CSV |
| `style.css` | Fuentes amigables para niños; paleta cálida pero espacial |
| `index.ts` | Actualizar exports |

## 📁 Archivos a Eliminar

| Archivo | Razón |
|---|---|
| `bullet.ts` | Ya no hay disparos |
| `shoot_handler.ts` | Ya no hay mecánica de disparo |
| `collision_manager.ts` | Reemplazado por response_detector.ts |
| `obstacle.ts` | Reemplazado por stimulus.ts |
| `obstacle_spawner.ts` | Reemplazado por stimulus_scheduler.ts |
| `score.ts` | Reemplazado por metrics_tracker.ts |
| `game_over_screen.ts` | Reemplazado por results_screen.ts |

---

## 🎨 Guía Visual para Niños

### Estímulo Go — Estrella Fugaz ⭐
- Modelo brillante, dorado/blanco, con efecto bloom intenso
- Puede tener una estela luminosa de partículas (como cometa)
- Al hacer hit: explosión de partículas doradas + sonido positivo
- Al hacer miss: se apaga suavemente, sin efectos dramáticos

### Estímulo No-Go — Basura Espacial 🗑️
- Modelo opaco, gris/marrón, sin efecto bloom
- Aspecto claramente "sucio" y contrastante con la estrella
- Al correct_rejection: simplemente pasa y desaparece
- Al false_alarm: destello rojo suave en los bordes de la pantalla

### Diferenciación Visual Clara
Los estímulos Go y No-Go deben ser **inmediatamente distinguibles** sin ambigüedad:
- Color: dorado brillante vs gris apagado
- Tamaño: similar para no introducir el tamaño como variable
- Forma: modelo 3D reconocible en < 300ms (estrella vs basura)
- Velocidad de acercamiento: IDÉNTICA para ambos

---

## 🔊 Guía de Audio (Opcional pero Recomendado)

```typescript
// Sonidos breves, amigables, no sorpresivos
const SOUNDS = {
  sectorStart: 'whoosh_soft.mp3',     // Transición entre sectores
  hit: 'chime_bright.mp3',            // Respuesta correcta a Go
  falseAlarm: 'soft_buzz.mp3',        // Error por comisión
  sectorComplete: 'fanfare_mini.mp3', // Completar un sector
  missionComplete: 'fanfare_big.mp3'  // Completar los 4 sectores
}
// NO usar sonidos para misses o correct_rejections
// (no dar feedback auditivo en ausencia de respuesta)
```

---

## 📤 Exportación de Datos

El botón "Exportar CSV" en la pantalla de evaluador debe generar:

```csv
trial_number,sector,stimulus_type,appeared_at_ms,responded_at_ms,reaction_time_ms,response_type
1,1,go,1523.4,1887.2,363.8,hit
2,1,nogo,3421.1,,null,correct_rejection
3,1,go,5234.7,5698.3,463.6,hit
4,1,nogo,7001.2,7210.4,209.2,false_alarm
...
```

---

## ⚠️ Consideraciones Clínicas para el Desarrollador

1. **No es una herramienta de diagnóstico** — El juego genera indicadores observacionales, no diagnósticos clínicos. La pantalla de resultados debe incluir este aviso.

2. **Estandarización estricta** — Los parámetros de la prueba (duración del estímulo, ISI, ventana de respuesta) no deben ser modificables por el usuario desde la interfaz; son variables controladas.

3. **Privacidad** — No enviar datos a servidores externos. Todo el procesamiento es local en el navegador.

4. **Accesibilidad** — Soporte para teclado Y touch (tablets son comunes en clínicas pediátricas).

5. **Reproducibilidad** — La semilla aleatoria de la secuencia de estímulos puede guardarse para reproducir la misma sesión si es necesario para comparar evaluaciones.

---

## 🚀 Orden de Implementación Recomendado para Claude Code

```
Fase 1 — Eliminar lo innecesario
  [ ] Borrar bullet.ts, shoot_handler.ts, collision_manager.ts
  [ ] Borrar obstacle.ts, obstacle_spawner.ts, score.ts, game_over_screen.ts
  [ ] Limpiar imports en app.ts e index.ts

Fase 2 — Crear módulos de medición
  [ ] Crear metrics_tracker.ts
  [ ] Crear stimulus.ts (con tipos Go/NoGo, aparición, fade)
  [ ] Crear response_detector.ts
  [ ] Crear stimulus_scheduler.ts

Fase 3 — Crear módulos de flujo
  [ ] Crear sector_manager.ts
  [ ] Crear hud.ts
  [ ] Rediseñar results_screen.ts (2 vistas + exportar CSV)

Fase 4 — Adaptar módulos existentes
  [ ] Simplificar spaceship.ts (eliminar disparos)
  [ ] Extender input_controller.ts (touch + timestamp)
  [ ] Refactorizar app.ts para integrar todo

Fase 5 — Pantalla de instrucciones + práctica
  [ ] Crear welcome_screen.ts
  [ ] Crear practice_mode.ts (opcional)

Fase 6 — Pulido visual y audio
  [ ] Ajustar estilos y HUD para niños
  [ ] Implementar diferenciación visual clara Go/No-Go
  [ ] Agregar audio opcional
  [ ] Revisar accesibilidad touch
```

---

*Plan diseñado para uso con Claude Code. El stack tecnológico (Three.js + TypeScript + Vite) se conserva íntegramente. Todos los cambios son modulares y respetan la arquitectura existente.*
