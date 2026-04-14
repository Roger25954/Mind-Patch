import { Scene, PerspectiveCamera, WebGLRenderer, AmbientLight, DirectionalLight, Vector2, Vector3, ACESFilmicToneMapping, SRGBColorSpace } from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { InputController } from './input_controller'
import { Skybox } from './skybox'
import { CameraController } from './camera.controller'
import { Obstacle, ObstacleType } from './obstacle'
import { Spaceship } from './spaceship'
import { ParticleSystem } from './particle_system'
import { CollisionManager } from './collision_manager'
import { ObstacleSpawner } from './obstacle_spawner'
import { GameOverScreen } from './game_over_screen'
import { Score } from './score'

/**
 * App: Controlador principal del juego SpaceShip
 *
 * Esta clase centraliza la configuración de Three.js, el bucle de animación,
 * la gestión de colisiones y la lógica de puntuación.
 *
 * Principales submódulos:
 * - input_controller
 * - camera.controller
 * - obstacle_spawner
 * - collision_manager
 * - particle_system
 * - game_over_screen
 * - score
 */
export class App {
  private readonly canvas = document.getElementById('canvas') as HTMLCanvasElement
  private readonly scene = new Scene()
  private readonly renderer = new WebGLRenderer({ canvas: this.canvas, antialias: true })
  private readonly perspectiveCamera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)

  private readonly inputController = new InputController()
  private readonly spaceship = new Spaceship(this.scene, 0.2)
  private readonly cameraController = new CameraController(this.perspectiveCamera, this.spaceship)

  private readonly collisionManager = new CollisionManager(this.spaceship)
  private readonly obstacleSpawner = new ObstacleSpawner(this.scene, this.spaceship)
  private readonly gameOverScreen = new GameOverScreen()
  private readonly score = new Score()
  private readonly composer: EffectComposer
  private readonly skybox = new Skybox(this.scene, [
    '/skybox/px.png', // derecha
    '/skybox/nx.png', // izquierda
    '/skybox/py.png', // arriba
    '/skybox/ny.png', // abajo
    '/skybox/pz.png', // frente
    '/skybox/nz.png'  // atrás
  ])

  private obstacles: Obstacle[] = []
  private particles: ParticleSystem[] = []

  constructor() {
    this.configureRenderer()
    this.createLights()
    this.createInstances()
    this.composer = this.createComposer()
    this.animate()
    window.addEventListener('resize', this.onWindowResize.bind(this))
  }

  private createComposer(): EffectComposer {
    const composer = new EffectComposer(this.renderer)
    composer.addPass(new RenderPass(this.scene, this.perspectiveCamera))
    composer.addPass(new UnrealBloomPass(
      new Vector2(window.innerWidth, window.innerHeight),
      1.8,
      0.5,
      0.1
    ))
    return composer
  }

  private createInstances(): void {
    this.spaceship.loadModel()
  }

  private configureRenderer(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.perspectiveCamera.position.set(0, 3, -8)
    this.perspectiveCamera.lookAt(0, 0, 0)
    this.renderer.domElement.style.cursor = 'crosshair'
    this.renderer.toneMapping = ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.5
    this.renderer.outputColorSpace = SRGBColorSpace
  }

  private spawnExplosion(position: Vector3): void {
    this.particles.push(new ParticleSystem(this.scene, position, {
      count: 60, color: 0xff6600, size: 0.5, speed: 0.5, lifetime: 45, spread: 3,
    }))
    this.particles.push(new ParticleSystem(this.scene, position, {
      count: 25, color: 0xffffff, size: 0.8, speed: 0.2, lifetime: 25, spread: 1,
    }))
    this.particles.push(new ParticleSystem(this.scene, position, {
      count: 30, color: 0x444444, size: 1.2, speed: 0.15, lifetime: 60, spread: 2,
    }))
  }

  private handleSpacePress(): void {
    if (!this.spaceship.model || this.obstacles.length === 0) return

    const shipPos = this.spaceship.model.position

    let closestObstacle: Obstacle | null = null
    let closestDistance = Infinity

    for (const obstacle of this.obstacles) {
      const distance = obstacle.getPosition().distanceTo(shipPos)
      if (distance < closestDistance) {
        closestDistance = distance
        closestObstacle = obstacle
      }
    }

    if (closestObstacle && closestObstacle.model) {
      const direction = closestObstacle.getPosition().clone().sub(shipPos).normalize()
      this.spaceship.shootToward(direction, closestObstacle)
      this.spawnExplosion(closestObstacle.getPosition())
    }
  }

  private animate(): void {
    if (this.score.isGameOver()) {
      this.gameOverScreen.show(this.score.getFinalMetrics())
      return
    }

    const spawned = this.obstacleSpawner.update(this.obstacles)
    if (spawned) this.score.itemSpawned()

    if (this.inputController.consumeSpace()) {
      this.handleSpacePress()
    }

    this.spaceship.update()
    this.cameraController.update()
    this.obstacles.forEach(o => o.update())

    if (this.spaceship.model) {
      this.skybox.update(this.perspectiveCamera.position)
    }

    this.collisionManager.checkBullets(this.obstacles, (obstacle, pos) => {
      this.spawnExplosion(pos)
      if (obstacle.type === ObstacleType.Star) {
        this.score.registerStarCollected(obstacle.getReactionTime())
      } else if (obstacle.type === ObstacleType.Trash) {
        this.score.registerImpulsiveError()
      } else if (obstacle.type === ObstacleType.Dog) {
        this.score.registerDogCollected()
      }
    })

    const shipZ = this.spaceship.model?.position.z ?? 0
    this.collisionManager.cleanup(this.obstacles, shipZ, (type) => {
      if (type === ObstacleType.Star) {
        this.score.registerOmission()
      } else if (type === ObstacleType.Dog) {
        this.score.registerDogCollected()
      }
    })

    this.particles = this.particles.filter(p => p.update())

    this.composer.render()
    requestAnimationFrame(this.animate.bind(this))
  }

  private createLights(): void {
    this.scene.add(new AmbientLight(0xffffff, 0.5))
    this.scene.add(new DirectionalLight(0xffffff, 1))
  }

  private onWindowResize(): void {
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.perspectiveCamera.aspect = window.innerWidth / window.innerHeight
    this.perspectiveCamera.updateProjectionMatrix()
    this.composer.setSize(window.innerWidth, window.innerHeight)
  }
}
