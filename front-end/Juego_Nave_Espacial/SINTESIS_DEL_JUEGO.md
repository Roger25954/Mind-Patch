# 🚀 El Guardián Espacial - Síntesis del Juego

## 📋 Descripción General

**El Guardián Espacial** es un videojuego 3D en tiempo real desarrollado con **Three.js** y **TypeScript** que funciona en el navegador. Es un juego de atención y reacción donde:

- 🛸 Controlas una nave espacial que avanza automáticamente
- ⭐ Debes disparar a **estrellas** presionando la **barra espaciadora**
- 🗑️ Debes **evitar** presionar cuando aparezca **basura espacial**
- 👽 Otros obstáculos alienígenas crean variabilidad en el juego
- 📊 El juego evalúa **tiempo de reacción**, **errores impulsivos** y **omisiones**

---

## 🏗️ Arquitectura del Proyecto

### Stack Tecnológico
```
├─ TypeScript (lenguaje principal)
├─ Three.js 0.175.0 (motor 3D)
├─ Vite 6.2.0 (bundler y dev server)
└─ Skybox + Modelos 3D (assets visuales)
```

### Estructura de Carpetas
```
Juego_Nave_Espacial/
├─ Index.html           # Punto de entrada HTML
├─ package.json         # Configuración y dependencias
├─ tsconfig.json        # Configuración de TypeScript
├─ src/
│  ├─ main.ts           # Punto de entrada TypeScript
│  ├─ style.css         # Estilos globales
│  └─ core/             # Lógica principal del juego
│     ├─ app.ts         # Controlador principal
│     ├─ spaceship.ts   # Nave del jugador
│     ├─ obstacle.ts    # Obstáculos/meteoritos
│     ├─ bullet.ts      # Proyectiles de la nave
│     ├─ camera.controller.ts   # Control de cámara
│     ├─ input_controller.ts    # Entrada del usuario
│     ├─ collision_manager.ts   # Detección de colisiones
│     ├─ obstacle_spawner.ts    # Generación de obstáculos
│     ├─ particle_system.ts     # Efectos visuales
│     ├─ score.ts       # Sistema de puntuación
│     ├─ game_over_screen.ts    # Pantalla de fin de juego
│     ├─ shoot_handler.ts       # Lógica de disparo
│     ├─ skybox.ts      # Fondo del escenario
│     ├─ starfield.ts   # Campo de estrellas
│     └─ index.ts       # Exportaciones del módulo
└─ public/
   └─ skybox/           # Imágenes del skybox (6 caras del cubo)
```

---

## 📁 Descripción Detallada de Archivos

### 🎮 Archivos Principales

#### **Index.html**
- Archivo HTML de entrada de la aplicación
- Contiene el canvas (`#canvas`) donde se renderiza el juego
- Panel de debug (`#debug-panel`) para monitoreo en desarrollo
- Botón toggle para mostrar/ocultar debug
- Estilos CSS inline para el panel de debug

#### **src/main.ts**
- Punto de entrada de la aplicación TypeScript
- Importa estilos CSS globales
- Espera a que el DOM esté listo e instancia la clase `App`
- Estructura básica:
  ```typescript
  import './style.css'
  import { App } from './core'
  document.addEventListener('DOMContentLoaded', () => {
    new App()
  })
  ```

#### **src/style.css**
- Estilos globales del juego
- Configuración de Canvas (ancho/alto, sin márgenes)
- Fuentes y colores del HUD
- Animaciones y efectos visuales

---

### 🎯 Core del Juego (src/core/)

#### **app.ts** - Controlador Principal ⚙️
**Función**: Orquestador central que conecta todos los sistemas del juego

**Responsabilidades**:
- Configuración de Three.js (Scene, Camera, Renderer)
- Creación de iluminación (AmbientLight, DirectionalLight)
- Instanciación de todos los componentes del juego
- Bucle de animación principal (animate)
- Manejo de eventos (resize, colisiones, fin de juego)
- Post-procesamiento con efectos Bloom (UnrealBloomPass)

**Flujo principal**:
1. Constructor inicializa renderer, cámara, escena
2. Carga el modelo de la nave
3. Configura post-procesamiento
4. Inicia el bucle animate()
5. En cada frame: actualiza entrada, obstáculos, cámara, colisiones, partículas

---

#### **spaceship.ts** - Nave del Jugador 🛸
**Función**: Gestiona la nave controlada por el jugador

**Características**:
- Carga modelo 3D desde archivo `/spaceship.glb`
- Movimiento automático hacia adelante (velocidad: 0.3 unidades/frame)
- Restricción de altura máxima
- Sistema de disparos con cooldown (1 disparo cada 10 frames)
- Mantiene array de balas activas
- Rotación controlada por entrada del usuario (izquierda/derecha)

**Métodos principales**:
- `loadModel()`: Carga modelo GLB asincronamente
- `update()`: Actualiza posición, rotación, y vida de balas
- `shoot()`: Crea nueva bala si no está en cooldown
- `getBullets()`: Retorna array de balas activas

---

#### **obstacle.ts** - Obstáculos/Meteoritos 🌑
**Función**: Representa objetos que aparecen en el camino de la nave

**Tipos de obstáculos**:
```typescript
enum ObstacleType {
  Star = 'star',      // Objetivo a disparar
  Trash = 'trash',    // Evitar disparar (error impulsivo)
  Dog = 'dog'         // Obstáculo alienígena
}
```

**Características**:
- Modelo 3D cargado desde archivos GLB específicos por tipo
- Velocidad y escala aleatoria
- Movimiento hacia la nave (eje Z)
- Rotación continua en 3 ejes para efecto dinámico
- Tiempo de vida limitado para tracking de reacción
- Compatible con raycasting para colisiones

**Estados**:
- `lifetime`: Contador de frames para medir tiempo de reacción
- `_model`: Objeto 3D de Three.js
- `_position`: Posición actual en el espacio

---

#### **bullet.ts** - Proyectiles 💥
**Función**: Proyectiles disparados por la nave

**Características visuales**:
- Núcleo central blanco iluminado
- Halo luminoso con color cian que pulsa
- Estela de partículas que se desvanece gradualmente
- Renderizado con Blending aditivo para efecto luminoso

**Sistemas visuales**:
- `SphereGeometry`: Esfera para el núcleo
- `PointsMaterial`: Puntos para la estela
- `Sprite`: Halo luminoso pulsante

**Movimiento**:
- Viaja en línea recta hacia adelante
- Destrucción automática fuera de límites

---

#### **camera.controller.ts** - Control de Cámara 📷
**Función**: Controla la posición y orientación de la cámara

**Sistema de seguimiento**:
- Offset fijo respecto a la nave: `(0, 4, -8)` unidades
- Interpolación suave del movimiento
- Rotación según orientación de la nave
- La cámara siempre mira hacia donde se dirige la nave

**Importancia**:
- Permite ver la nave y los obstáculos que se aproximan
- Proporciona inmersión visual en 3D
- Se actualiza cada frame en el bucle principal

---

#### **input_controller.ts** - Entrada del Usuario ⌨️
**Función**: Detecta y procesa entrada del teclado

**Entrada monitoreada**:
- Presión de barra espaciadora

**Sistema de estados**:
- Flag `spacePressed: boolean`
- Método `consumeSpace()`: Retorna estado y resetea la bandera
- Patrón "consume" para evitar duplicados en un mismo frame

**Eventos escuchados**:
- `keydown`: Detecta presión de tecla
- `keyup`: Detecta liberación de tecla

---

#### **collision_manager.ts** - Gestión de Colisiones 💥
**Función**: Detecta y maneja colisiones entre balas y obstáculos

**Distancia de colisión**:
- Radio de interacción: 3.0 unidades
- Choque directo: < 2.0 unidades entre bala y obstáculo

**Callbacks**:
- `checkBullets()`: Verifica todas las colisiones en cada frame
- `onHit()`: Callback ejecutado cuando hay impacto
- Genera partículas y actualiza puntuación

**Sistema de detección**:
- Itera sobre todos los obstáculos
- Para cada obstáculo, verifica distancia a cada bala
- Si distancia < 2.0, cuenta como colisión
- Destruye bala y obstáculo

---

#### **obstacle_spawner.ts** - Generador de Obstáculos 🎲
**Función**: Crea y posiciona obstáculos periódicamente

**Parámetros de spawn**:
- Intervalo: 200 frames (~3.3 segundos a 60fps)
- Distancia adelante: 120 unidades
- Rango lateral: ±5 unidades de dispersión
- Tipos aleatorios: Star, Trash, Dog

**Lógica**:
1. Incrementa temporizador cada frame
2. Cuando llega a `spawnInterval`, crea nuevo obstáculo
3. Posiciona en coordenadas aleatorias frente a la nave
4. Agrega a array de obstáculos activos
5. Resetea temporizador

**Importancia para el juego**:
- Controla la dificultad (intervalo de spawn)
- Variabilidad: tipos y posiciones aleatorios
- Crea flujo constante de desafíos

---

#### **particle_system.ts** - Sistema de Partículas ✨
**Función**: Crea efectos visuales con partículas

**Configuración**:
```typescript
interface ParticleConfig {
  count: number        // Cantidad de partículas
  color: number        // Color hexadecimal
  size: number         // Tamaño individual
  speed: number        // Velocidad base
  lifetime: number     // Duración en frames
  spread: number       // Rango de dispersión (0-360°)
}
```

**Efectos**:
- Explosiones al destruir obstáculos
- Flashes de cañón al disparar
- Estelas visuales
- Desvanecimiento gradual

**Características**:
- Partículas se mueven en direcciones aleatorias
- Desaceleración gradual para efecto natural
- Se destruyen automáticamente al término de `lifetime`
- Blending aditivo para luminosidad

---

#### **score.ts** - Sistema de Puntuación 📊
**Función**: Evalúa el desempeño del jugador (test de atención)

**Métricas**:
- `reactionTimes[]`: Array de tiempos de reacción en ms
- `impulsiveErrors`: Disparos a basura (errores impulsivos)
- `omissions`: Estrellas no disparadas (omisiones)
- `totalPoints`: Puntuación total

**Sectores**:
- El juego se divide en 4 sectores de 90 items cada uno
- Total: 360 items en toda la sesión
- Permite análisis por sector del desempeño

**HUD (Head-Up Display)**:
- Muestra puntuación en tiempo real
- Contador de estrellas destruidas
- Contador de errores
- Información de sector actual

---

#### **game_over_screen.ts** - Pantalla de Fin ☠️
**Función**: Muestra resultados finales cuando termina el juego

**Características visuales**:
- Overlay oscuro con gradiente radial
- Mensaje dramaticista de destrucción
- Cantidad de meteoritos que destruyeron la nave
- Botón de reinicio con efectos visuales
- Animaciones de glitch/corrupción para tema apocalíptico

**Información mostrada**:
- Número total de meteoritos impactados
- Tiempo de reacción promedio
- Número de errores impulsivos
- Número de omisiones
- Puntuación total

**Interactividad**:
- Botón "REINICIAR" para volver a jugar
- Recarga la página al hacer clic

---

#### **shoot_handler.ts** - Lógica de Disparo 🎯
**Función**: Maneja automáticamente el apuntado y disparo a obstáculos

**Sistema de apuntado**:
- Usa **Raycasting** desde la cámara
- Detecta intersecciones con obstáculos bajo el cursor
- Fallback a obstáculo cercano si no hay intersección directa

**Parámetros**:
- Rango del raycaster: 0.1 a 500 unidades
- Radio de búsqueda de fallback: configurable

**Métodos**:
- `aim()`: Determina qué obstáculo disparar
- `fire()`: Ejecuta el disparo hacia el objetivo

**Integración**:
- Se llama desde `app.ts` en cada frame
- Usa posición del ratón para raycasting

---

#### **skybox.ts** - Fondo del Escenario 🌌
**Función**: Crea el ambiente visual de fondo inmersivo

**Sistema de cube map**:
- 6 imágenes (frente, atrás, izquierda, derecha, arriba, abajo)
- Ubicadas en `public/skybox/`
- Cargador: `CubeTextureLoader` de Three.js

**Características**:
- Renderizado eficiente con geometría esférica
- Material `MeshBasicMaterial` sin iluminación
- Renderizado con `BackSide` para estar "adentro" del cubo
- Sigue automáticamente la posición de la cámara

**Archivo de texturas**:
```
public/skybox/
├─ px.png  (derecha - positive X)
├─ nx.png  (izquierda - negative X)
├─ py.png  (arriba - positive Y)
├─ ny.png  (abajo - negative Y)
├─ pz.png  (frente - positive Z)
└─ nz.png  (atrás - negative Z)
```

---

#### **starfield.ts** - Campo de Estrellas ⭐
**Función**: Crea efecto de fondo con estrellas generadas proceduralmente

**Sistema alternativo**:
- Intenta cargar modelo GLB personalizado
- Fallback a skybox proceduralmente generado

**Opciones**:
- Generación dinámica de estrellas
- Posicionamiento aleatorio
- Variación de tamaño y brillo

---

#### **index.ts** - Exportaciones del Módulo
**Función**: Barril (barrel export) que centraliza las exportaciones

**Patrón**:
```typescript
export { App } from './app'
export { Spaceship } from './spaceship'
export { Obstacle, ObstacleType } from './obstacle'
// ... etc
```

**Beneficio**:
- Simplifica imports: `import { App, Spaceship } from './core'`
- Mantenibilidad centralizada
- Mejor organización de namespace

---

## 🔄 Flujo de Ejecución Principal

### Inicialización
```
1. Usuario carga Index.html
2. Browser ejecuta main.ts
3. Espera DOMContentLoaded
4. Instancia new App()
   ├─ Configura renderer 3D
   ├─ Crea escena
   ├─ Carga modelo de nave
   ├─ Carga skybox
   ├─ Instancia todos los controladores
   └─ Inicia bucle animate()
```

### Bucle de Juego (cada frame ~60fps)
```
animate() {
  1. Captura entrada: inputController.consumeSpace()
  2. Actualiza nave: spaceship.update()
     ├─ Movimiento automático hacia adelante
     ├─ Disparar si se presionó espacio
     └─ Actualizar posición de balas
  3. Actualiza obstáculos: obstacleSpawner.update()
     └─ Genera nuevos si corresponde
  4. Actualiza cámara: cameraController.update()
     └─ Sigue a la nave
  5. Detecta colisiones: collisionManager.checkBullets()
     ├─ Si hay impacto:
     │  ├─ Crea ParticleSystem
     │  ├─ Actualiza Score
     │  └─ Destruye obstáculo
     └─ Guarda métricas
  6. Actualiza partículas: particleSystem.update()
     └─ Desvanecimiento y movimiento
  7. Verifica fin de juego: gameOverScreen.show()
     └─ Si nave fue golpeada
  8. Renderiza: composer.render()
     └─ Post-procesamiento con Bloom
  9. Siguiente frame...
}
```

### Finalización
```
Si nave es destruida por obstáculo:
1. CollisionManager detecta colisión
2. GameOverScreen.show() con métricas
3. Botón "REINICIAR" recarga la página
```

---

## 🎮 Mecánicas de Juego

### Objetivos
- **Dispara** (barra espaciadora) a las **ESTRELLAS ⭐**
- **Evita** disparar a **BASURA 🗑️**
- Evitar que los obstáculos **golpeen** la nave

### Puntuación
- ✅ Estrella destruida: +10 puntos
- ❌ Disparar a basura: -5 puntos (error impulsivo)
- 😴 Estrella no destruida: omisión registrada
- 💥 Obstáculo golpea nave: FIN DEL JUEGO

### Métricas de Atención
Al terminar se muestran:
- Tiempo de reacción promedio
- Número de errores impulsivos
- Número de omisiones
- Puntuación total
- Rendimiento por sector

---

## 🛠️ Tecnologías Utilizadas

### Librerías
- **Three.js**: Motor gráfico 3D principal
- **TypeScript**: Lenguaje tipado compilado a JavaScript
- **Vite**: Bundler y servidor de desarrollo ultra-rápido

### Características de Three.js
- Scene: Escena 3D
- PerspectiveCamera: Cámara de perspectiva
- WebGLRenderer: Renderizador WebGL
- GLTFLoader: Cargador de modelos 3D
- EffectComposer: Post-procesamiento
- UnrealBloomPass: Efecto Bloom de iluminación
- Raycaster: Detección de intersecciones
- BufferGeometry: Geometría optimizada
- Points/PointsMaterial: Sistema de partículas

### Características de Three.js Addons
- RenderPass: Pase de renderizado
- GLTFLoader: Carga de modelos GLB/gltf
- CubeTextureLoader: Carga de skybox

---

## 📊 Rendimiento

### Optimizaciones
- Geometría precargada (SphereGeometry, BoxGeometry)
- Materiales instanciados una sola vez
- Array de obstáculos y partículas activos
- Destrucción automática al salir del viewport
- Post-procesamiento selectivo (solo Bloom)

### Requisitos
- Browser moderno con soporte WebGL
- GPU dedicada recomendada
- Conexión para cargar modelos 3D (.glb)

---

## 🎨 Estética Visual

### Tema
- Apocalíptico espacial
- Luces neon y bloom
- Cielo oscuro con skybox de espacio
- Efectos de partículas para impactos

### Paleta de Colores
- **Nave**: Metálico con luces LED
- **Balas**: Blanco con aura cian
- **Obstáculos**: Variados según tipo
- **HUD**: Verde neón (#0f0) tema retro
- **Fondo**: Negro profundo con gradientes

---

## 🚀 Cómo Ejecutar

### Desarrollo
```bash
npm install
npm run dev
```
Abre `http://localhost:5173` (puerto por defecto Vite)

### Build Producción
```bash
npm run build
```
Genera archivos optimizados en carpeta `dist/`

### Preview Build
```bash
npm run preview
```
Prueba la build de producción localmente

---

## 📝 Resumen Arquitectónico

```
┌─────────────────────────────────────┐
│      Index.html (Canvas)            │
│      ↓                              │
│      main.ts (Entrada TS)           │
│      ↓                              │
│      App (Orquestador)              │
├─────────────┬───────────────────────┤
│   Entrada   │  Spaceship            │
│   InputCtrl │  Bullet               │
│             │  ↓                    │
├─────────────┤  Camera               │
│  Rendering  │  CameraController     │
│  Composer   │  ↓                    │
│  (Bloom)    │  Skybox               │
│             │  ParticleSystem       │
├─────────────┤──────────────────────┤
│ Lógica Gim  │  Obstacles            │
│ Spawner     │  ObstacleSpawner      │
│ Collision   │  CollisionManager     │
│ Manager     │  ShootHandler         │
│ Score       │  ↓                    │
│ GameOver    │  GameOverScreen       │
└─────────────┴───────────────────────┘
```

---

## 🎯 Conclusión

**El Guardián Espacial** es un juego educativo de atención visual construido sobre una arquitectura modular y escalable en Three.js. Cada componente tiene una responsabilidad clara, permitiendo fácil mantenimiento y extensión. El juego proporciona feedback visual inmediato y recopila métricas detalladas de atención para análisis.

Los 16 archivos principales trabajan en conjunto para crear una experiencia inmersiva en 3D que combina gráficos llamativos, mecánicas de juego claras y evaluación automática de capacidades cognitivas.
