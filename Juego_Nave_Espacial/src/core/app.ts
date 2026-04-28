import { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight, Vector2, ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'

import { InputController } from './input_controller'
import { Skybox } from './skybox'
import { CameraController } from './camera.controller'
import { Spaceship } from './spaceship'
import { Vector3 } from 'three'
import { Bullet } from './bullet_temp'
// particle_system imported where needed by other modules; not used directly here

// Nuevos módulos de Fase 2-3
import { StimulusScheduler, PRUEBA_CONFIG } from './stimulus_scheduler'
import { ResponseDetector } from './response_detector'
import { MetricsTracker } from './metrics_tracker'
import { SectorManager } from './sector_manager'
import { HUD } from './hud'
import { ResultsScreen } from './results_screen'

/**
 * App: Controlador principal del juego rediseñado
 * 
 * Nueva versión para prueba Go/No-Go:
 * - Orquesta la prueba conductual estandarizada
 * - Gestiona sectores, estímulos, respuestas y métricas
 * - Sin lógica de disparos ni colisiones (reemplazada por detección de respuesta)
 * - Registro clínico de tiempos de reacción
 */
export class App {
  private readonly canvas = document.getElementById('canvas') as HTMLCanvasElement
  private readonly scene = new Scene()
  private readonly renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true })
  private readonly perspectiveCamera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  )

  // Controladores principales
  private readonly inputController = new InputController()
  private readonly spaceship = new Spaceship(this.scene, 0.2)
  private readonly cameraController = new CameraController(
    this.perspectiveCamera,
    this.spaceship
  )

  // Nuevos módulos de prueba Go/No-Go
  private readonly metricsTracker = new MetricsTracker()
  private readonly stimulusScheduler = new StimulusScheduler(
    this.scene,
    () => {
      // Spawn aligned with the spaceship view: keep X/Y around the ship, fixed Z=60
      try {
        const shipPos = this.spaceship.getPosition()
        const offsetX = (Math.random() - 0.5) * 6
        const offsetY = (Math.random() - 0.5) * 2
          const baseZ = (typeof shipPos.z === 'number' && !isNaN(shipPos.z)) ? shipPos.z : this.perspectiveCamera.position.z
          const spawnZ = baseZ + 60
        return new Vector3(shipPos.x + offsetX, shipPos.y + offsetY + 1.2, spawnZ)
      } catch (e) {
        const fallbackBase = this.perspectiveCamera ? this.perspectiveCamera.position.z : 0
        return new Vector3(0, 1.8, fallbackBase + 60)
      }
    },
    () => this.spaceship.getPosition(),
    // Only allow spawning when the test is running
    () => this.isTestRunning
  )
  private responseDetector!: ResponseDetector
  private readonly sectorManager = new SectorManager()
  private readonly hud = new HUD(this.sectorManager)
  private readonly resultsScreen = new ResultsScreen()
  private audioMap: { whoosh?: HTMLAudioElement; chime?: HTMLAudioElement; buzz?: HTMLAudioElement; fanfare?: HTMLAudioElement } | null = null

  // Visuales
  private readonly composer: EffectComposer
  private readonly skybox = new Skybox(this.scene)

  // Lista de proyectiles activos para actualizar cada frame
  private bullets: Bullet[] = []

  // Estado de la aplicación
  private isTestRunning: boolean = false


  constructor() {
    this.configureRenderer()
    this.createLights()
    this.createInstances()
    this.installDebugOverlay()
    const audioMap = this.loadAudio()
    this.audioMap = audioMap
    this.responseDetector = new ResponseDetector(this.metricsTracker, this.scene, {
      whoosh: audioMap.whoosh,
      chime: audioMap.chime,
      buzz: audioMap.buzz
    })
    this.composer = this.createComposer()
    this.setupEventListeners()
    this.showWelcomeScreen()
    window.addEventListener('resize', this.onWindowResize.bind(this))
    this.animate() // ← mueve aquí, una sola vez
  }

  /**
   * Instala un overlay flotante que muestra logs en pantalla para facilitar
   * depuración cuando la consola del navegador no es accesible desde la prueba.
   */
  private installDebugOverlay(): void {
    try {
      const overlay = document.createElement('div')
      overlay.id = 'debug-overlay'
      overlay.style.cssText = `
        position: fixed; bottom: 10px; left: 10px; width: 360px; max-height: 40vh;
        overflow: auto; background: rgba(0,0,0,0.6); color: #0f0; font-family: monospace;
        font-size: 12px; padding: 8px; z-index: 9999; border-radius: 6px;
      `
      document.body.appendChild(overlay)

      const origLog = console.log.bind(console)
      console.log = (...args: any[]) => {
        try {
          const msg = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')
          const line = document.createElement('div')
          line.textContent = msg
          overlay.appendChild(line)
          // Mantener scroll al final
          overlay.scrollTop = overlay.scrollHeight
        } catch (e) {}
        origLog(...args)
      }

      const origWarn = console.warn.bind(console)
      console.warn = (...args: any[]) => {
        try {
          const msg = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')
          const line = document.createElement('div')
          line.style.color = '#ff8c00'
          line.textContent = `[WARN] ${msg}`
          overlay.appendChild(line)
          overlay.scrollTop = overlay.scrollHeight
        } catch (e) {}
        origWarn(...args)
      }

      const origErr = console.error.bind(console)
      console.error = (...args: any[]) => {
        try {
          const msg = args.map(a => (typeof a === 'string' ? a : JSON.stringify(a))).join(' ')
          const line = document.createElement('div')
          line.style.color = '#ff4444'
          line.textContent = `[ERROR] ${msg}`
          overlay.appendChild(line)
          overlay.scrollTop = overlay.scrollHeight
        } catch (e) {}
        origErr(...args)
      }
    } catch (e) {
      console.warn('[App] No se pudo instalar overlay de depuración', e)
    }
  }

  /**
   * Carga audio opcional desde /audio/; si no existen los archivos, no explota
   */
  private loadAudio(): { whoosh?: HTMLAudioElement; chime?: HTMLAudioElement; buzz?: HTMLAudioElement; fanfare?: HTMLAudioElement } {
    const base = '/audio/'
    const make = (name: string) => {
      try {
        const a = new Audio(base + name)
        a.preload = 'auto'
        return a
      } catch (e) {
        return undefined
      }
    }

    return {
      whoosh: make('whoosh_soft.mp3'),
      chime: make('chime_bright.mp3'),
      buzz: make('soft_buzz.mp3'),
      fanfare: make('fanfare.mp3')
    }
  }

  /**
   * Muestra la pantalla de bienvenida con instrucciones
   */
  private showWelcomeScreen(): void {
    const welcomeOverlay = document.createElement('div')
    welcomeOverlay.id = 'welcome-overlay'
    welcomeOverlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: radial-gradient(ellipse at center, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.99) 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      font-family: 'Arial', sans-serif;
      color: #ffffff;
      padding: 20px;
    `

    welcomeOverlay.innerHTML = `
      <div style="
        text-align: center;
        max-width: 600px;
      ">
        <!-- Título -->
        <div style="
          font-size: 48px;
          font-weight: bold;
          margin-bottom: 30px;
          color: #00ff00;
          text-shadow: 0 0 20px #00ff00;
        ">
          🚀 EL GUARDIÁN ESPACIAL
        </div>

        <!-- Subtítulo -->
        <div style="
          font-size: 18px;
          color: #aaa;
          margin-bottom: 40px;
        ">
          Prueba de Atención y Control Inhibitorio
        </div>

        <!-- Instrucciones -->
        <div style="
          background: rgba(0, 255, 0, 0.1);
          border: 2px solid #00ff00;
          border-radius: 8px;
          padding: 25px;
          margin-bottom: 40px;
          font-size: 16px;
          line-height: 1.8;
        ">
          <div style="margin-bottom: 15px;"><strong>¡Hola, piloto espacial! 👋</strong></div>
          
          <div style="margin-bottom: 20px;">En esta misión explorarás 4 sectores galácticos. Tu tarea es:</div>
          
          <div style="
            text-align: left;
            display: inline-block;
          ">
            <div style="margin: 10px 0; color: #ffd700;">
              <strong>⭐ Cuando veas una ESTRELLA:</strong> Presiona ESPACIO rápidamente
            </div>
            <div style="margin: 10px 0; color: #ff6b6b;">
              <strong>🗑️ Cuando veas BASURA:</strong> No hagas nada (es una trampa)
            </div>
          </div>

          <div style="
            margin-top: 25px;
            font-size: 13px;
            color: #aaa;
            border-top: 1px solid rgba(0, 255, 0, 0.3);
            padding-top: 15px;
          ">
            Tendrás ~0.5 segundos desde que aparece el objeto para responder.
          </div>
        </div>

        <!-- Botón de inicio -->
        <button id="btn-start-mission" style="
          background: linear-gradient(135deg, #00ff00, #00dd00);
          color: #000;
          border: none;
          padding: 15px 40px;
          font-size: 18px;
          font-weight: bold;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 0 20px #00ff00;
        ">
          ¡COMENZAR MISIÓN!
        </button>
      </div>
    `

    document.body.appendChild(welcomeOverlay)

    const btnStart = document.getElementById('btn-start-mission')
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        welcomeOverlay.remove()
        this.startTest()
      })
    }
  }

  /**
   * Inicia la prueba Go/No-Go
   */
  private startTest(): void {
    console.log('[App] Iniciando prueba Go/No-Go')
    // Mostrar instrucciones iniciales en el HUD y esperar antes de iniciar la prueba
    const instructionMs = 10000
    this.hud.showInstructions(instructionMs)
    this.metricsTracker.setCurrentSector(1)
    this.lastTime = performance.now()

    // Iniciar la prueba (movimiento de nave y scheduler) una vez finalicen las instrucciones
    setTimeout(() => {
      this.isTestRunning = true
      try { this.spaceship.setAutoSpeed(0.3) } catch (e) {}

      // Iniciar scheduler de estímulos con callbacks
      this.stimulusScheduler.start(
      // Callback: cuando aparece estímulo
      (stimulus) => {
        this.responseDetector.onStimulusAppeared(stimulus)
        console.log(
          `[App] Estímulo ${stimulus.getId()} apareció (${stimulus.getType()})`
        )
        try {
          console.log('[App] cameraPos=', this.perspectiveCamera.position.toArray(), 'stimulusPos=', stimulus.getPosition().toArray())
        } catch (e) {}
      },
      // Callback: cuando se completa un sector
      (sector) => {
        console.log(`[App] Sector ${sector} completado`)
        this.metricsTracker.setCurrentSector(sector + 1)
        this.sectorManager.nextSector()
        this.hud.updateDisplay()

        if (sector < 4) {
          const nextSectorName = this.sectorManager.getCurrentSectorName()
          this.hud.showBreakIndicator(nextSectorName, PRUEBA_CONFIG.sectorBreakMs)
        }
      },
      // Callback: cuando se completa todo
      () => {
        this.endTest()
      }
      )
    }, instructionMs)
  }

  /**
   * Finaliza la prueba y muestra resultados
   */
  private endTest(): void {
    console.log('[App] Prueba completada')
    this.isTestRunning = false

    // Generar métricas finales
    const metrics = this.metricsTracker.generateSessionMetrics()
    const adhd_alerts = this.metricsTracker.detectADHDIndicators(metrics)

    // Mostrar pantalla de resultados
    this.resultsScreen.show(metrics, adhd_alerts, () => {
      console.log('[App] Exportando CSV')
    }, { fanfare: this.audioMap?.fanfare, buzz: this.audioMap?.buzz })

    // Detener scheduler
    this.stimulusScheduler.stop()
  }

  /**
   * Configura el renderer de Three.js
   */
  private configureRenderer(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.perspectiveCamera.position.set(0, 3, -8)
    this.perspectiveCamera.lookAt(0, 0, 0)
    this.renderer.domElement.style.cursor = 'default'
    this.renderer.toneMapping = ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.5
    this.renderer.outputColorSpace = SRGBColorSpace
  }

  /**
   * Crea post-processing con efecto Bloom
   */
  private createComposer(): EffectComposer {
    const composer = new EffectComposer(this.renderer)
    composer.addPass(new RenderPass(this.scene, this.perspectiveCamera))
    composer.addPass(
      new UnrealBloomPass(new Vector2(window.innerWidth, window.innerHeight), 1.8, 0.5, 0.1)
    )
    return composer
  }

  /**
   * Instancia los modelos principales
   */
  private createInstances(): void {
    this.spaceship.loadModel()
    // Desactivar movimiento automático hasta que inicie la prueba
    try { this.spaceship.setAutoSpeed(0) } catch (e) {}
    console.log('[App] Instancias creadas')
  }

  /**
   * Crea iluminación de la escena
   */
  private createLights(): void {
    this.scene.add(new AmbientLight(0xffffff, 0.5))
    this.scene.add(new DirectionalLight(0xffffff, 1))
  }

  /**
   * Configura event listeners adicionales
   */
  private setupEventListeners(): void {
    // Listener para respuesta del jugador (espacio o toque)
    const checkResponse = () => {
      const response = this.inputController.consumeSpace()
      if (response.pressed && this.isTestRunning) {
        this.responseDetector.onPlayerResponse()
        this.spaceship.triggerHitFeedback()
        // Crear un proyectil de depuración para confirmar que los bullets se renderizan
        try {
          const startPos = this.spaceship.getPosition()
          // Determinar dirección hacia adelante basada en la orientación de la nave
          let dir = new Vector3(0, 0, -1)
          try {
            if ((this.spaceship as any).model) {
              dir = dir.applyQuaternion((this.spaceship as any).model.quaternion)
            }
          } catch (e) {}
          // defensiva: evitar vector 0
          if (!dir || isNaN(dir.x) || isNaN(dir.y) || isNaN(dir.z) || dir.length() === 0) {
            dir = new Vector3(0, 0, -1)
          }
          // Asegurar normalización y creación del bullet
          const b = new Bullet(this.scene, startPos, dir)
          this.bullets.push(b)
          console.log('[App] Bullet creado para depuración dir=', dir.toArray())
        } catch (e: unknown) {
          const ex: any = e
          const msg = ex && (ex.stack || ex.message || String(ex))
          console.warn(`[App] No se pudo crear Bullet de depuración: ${msg}`)
        }
      }
    }

    // Ejecutar check cada frame (~60fps)
    setInterval(() => {
      if (this.isTestRunning) {
        checkResponse()
      }
    }, 16)
  }

  /**
   * Bucle de animación principal
   */

  private lastTime: number = 0  // ← agrega esta propiedad a la clase

  private animate = (): void => {
    // Calcular deltaTime cada frame y usarlo para scheduler y bullets
    const now = performance.now()
    const deltaTime = Math.min((now - this.lastTime) / 1000, 0.1)
    this.lastTime = now

    // Renderizar siempre
    this.spaceship.update()
    this.cameraController.update()

    if (this.isTestRunning) {
      this.stimulusScheduler.update(deltaTime)
    }

    if (this.spaceship.model) {
      this.skybox.update(this.perspectiveCamera.position)
    }

    this.composer.render()
    // Actualizar proyectiles con deltaTime para movimiento consistente
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bl = this.bullets[i]
      try {
        bl.update(deltaTime)
        const pos = bl.getPosition()
        // Remover si sale muy lejos del área de juego
        if (Math.abs(pos.x) > 200 || Math.abs(pos.y) > 200 || Math.abs(pos.z) > 400) {
          bl.destroy()
          this.bullets.splice(i, 1)
        }
      } catch (e) {
        // Si update falla, limpiarlo para evitar bloqueos
        try { bl.destroy() } catch (e) {}
        this.bullets.splice(i, 1)
      }
    }

    requestAnimationFrame(this.animate)
  }

  /**
   * Maneja redimensionamiento de ventana
   */
  private onWindowResize = (): void => {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.perspectiveCamera.aspect = window.innerWidth / window.innerHeight
    this.perspectiveCamera.updateProjectionMatrix()
    this.composer.setSize(window.innerWidth, window.innerHeight)
  }
}
