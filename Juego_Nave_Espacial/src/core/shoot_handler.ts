/**
 * Clase ShootHandler: Maneja el disparo de balas desde la nave.
 * Utiliza raycasting para:
 * - Apuntar automáticamente a obstáculos bajo el cursor
 * - Detectar intersecciones directas
 * - Usar obstáculo cercano como fallback
 */

import { Raycaster, Vector2, Vector3, Object3D, PerspectiveCamera } from 'three'
import { Spaceship } from './spaceship'
import { Obstacle } from './obstacle'

export class ShootHandler {
  // Raycaster para detectar intersecciones con obstáculos
  private readonly raycaster = new Raycaster()

  constructor(
    private readonly spaceship: Spaceship,
    private readonly camera: PerspectiveCamera
  ) {
    // Configurar rango del raycaster
    this.raycaster.near = 0.1
    this.raycaster.far = 500
  }

  /**
   * Procesa un clic para disparar, con apuntado automático a obstáculos mejorado
   * Prioridad: intersección directa > predicción de movimiento > búsqueda expandida
   * @param click - Posición normalizada del clic en pantalla
   * @param obstacles - Array de obstáculos en la escena
   * @param onShoot - Callback cuando se dispara (recibe posición del cañón)
   */
  public handle(
    click: Vector2,
    obstacles: Obstacle[],
    onShoot: (muzzlePos: Vector3) => void
  ): void {
    if (!this.spaceship.model) return

    this.raycaster.setFromCamera(click, this.camera)

    // Calcular posición del cañón una sola vez
    const muzzlePos = this.spaceship.model.position
      .clone()
      .add(new Vector3(0, 0.3, 1))

    // Recopilar todos los meshes de obstáculos y mapearlos a sus instancias
    const obstacleModels: Object3D[] = []
    const obstacleMap = new Map<Object3D, Obstacle>()

    for (const obs of obstacles) {
      if (obs.model) {
        obs.model.traverse((child: Object3D) => {
          obstacleModels.push(child)
          obstacleMap.set(child, obs)
        })
      }
    }

    const intersects = this.raycaster.intersectObjects(obstacleModels, false)

    let shootDirection: Vector3

    // Prioridad 1: Intersección directa (usuario clickeó directamente en meteorito)
    if (intersects.length > 0) {
      const targetMesh = intersects[0].object
      const targetObstacle = obstacleMap.get(targetMesh)

      if (targetObstacle) {
        // Usar la posición del obstáculo con predicción de movimiento
        shootDirection = this.calculateLeadAim(targetObstacle)
        onShoot(muzzlePos)
        this.spaceship.shootToward(shootDirection, targetObstacle)
        return
      } else {
        // Fallback a punto de impacto si no encontramos el obstáculo
        shootDirection = intersects[0].point
          .clone()
          .sub(this.spaceship.model.position)
          .normalize()
      }
    } else {
      // Prioridad 2: Búsqueda expandida de obstáculo cercano al rayo
      let closestObs: Obstacle | null = null
      let closestDist = 6.0 // Expandido de 2.5 para mejor detección

      for (const obs of obstacles) {
        const obsPos = obs.getPosition()
        const dist = this.raycaster.ray.distanceToPoint(obsPos)
        if (dist < closestDist) {
          closestDist = dist
          closestObs = obs
        }
      }

      if (closestObs) {
        // Usar predicción de movimiento para el objetivo más cercano
        shootDirection = this.calculateLeadAim(closestObs)
        onShoot(muzzlePos)
        this.spaceship.shootToward(shootDirection, closestObs)
        return
      } else {
        // Prioridad 3: Disparar en dirección del rayo
        shootDirection = this.raycaster.ray.direction.clone()
      }
    }

    // Disparos sin objetivo: usar dirección calculada
    onShoot(muzzlePos)
    this.spaceship.shootToward(shootDirection)
  }

  /**
   * Calcula la dirección de disparo con predicción de movimiento (lead aim)
   * Compensa el movimiento del meteorito para apuntar donde estará
   * @param obstacle - Obstáculo objetivo
   * @returns Dirección normalizada hacia donde dispará para acertar
   */
  private calculateLeadAim(obstacle: Obstacle): Vector3 {
    const obstaclePos = obstacle.getPosition()
    const shipPos = this.spaceship.model!.position

    // Estimación simple: usar velocidad del rayo para proyectar posición futura
    const toObstacle = obstaclePos.clone().sub(shipPos)
    const distance = toObstacle.length()

    // Bala se mueve a ~2 unidades por frame, meteorito se mueve a su velocity
    // Estimar frames hasta impacto (distance / 2)
    const estimatedFramesToHit = Math.max(1, distance / 2)

    // El meteorito se mueve principalmente en dirección -Z (hacia cámara)
    // Aplicar predicción simple: compensar el movimiento futuro
    const predictedPos = obstaclePos.clone()

    // Predicción de movimiento: meteoritos se mueven hacia -Z a una velocidad aproximada
    // Usamos un factor de predicción basado en la distancia
    const leadFactor = Math.min(0.8, estimatedFramesToHit * 0.15)
    predictedPos.z += leadFactor * 3 // Compensar movimiento futuro del meteorito

    // Calcular dirección hacia la posición predicha
    return predictedPos
      .clone()
      .sub(shipPos)
      .normalize()
  }
}