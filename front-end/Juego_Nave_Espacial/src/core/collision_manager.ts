import { Spaceship } from './spaceship'
import { Obstacle, ObstacleType } from './obstacle'

export class CollisionManager {
  // Radio de interacción
  private readonly interactionRadius = 3.0

  constructor(private readonly spaceship: Spaceship) {}

  /**
   * Verifica colisiones entre balas y obstáculos
   * @param obstacles - Array de obstáculos (será mutado)
   * @param onHit - Callback cuando hay colisión (recibe obstacle y posición)
   */
  public checkBullets(
    obstacles: Obstacle[],
    onHit: (obstacle: Obstacle, pos: any) => void
  ): void {
    const bullets = this.spaceship.getBullets()

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obstacle = obstacles[i]
      if (!obstacle.model) continue

      for (const bullet of bullets) {
        const dist = bullet.getPosition().distanceTo(obstacle.getPosition())
        if (dist < 2.0) {
          console.log('💥 ¡COLISIÓN! Obstáculo tipo:', obstacle.type, 'destruido')
          onHit(obstacle, obstacle.getPosition().clone())
          obstacle.destroy()
          this.spaceship.removeBullet(bullet)
          obstacles.splice(i, 1)
          break
        }
      }
    }
  }

  /**
   * Verifica interacciones cuando el usuario presiona espacio
   * @param obstacles - Array de obstáculos
   * @param onStarCollected - Callback para estrella recolectada
   * @param onImpulsiveError - Callback para error impulsivo
   * @param onDogDestroyed - Callback para perro destruido
   */
  public checkInteractions(
    obstacles: Obstacle[],
    onStarCollected: (reactionTime: number) => void,
    onImpulsiveError: () => void,
    onDogDestroyed: () => void
  ): void {
    if (!this.spaceship.model) return

    const shipPos = this.spaceship.model.position

    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obstacle = obstacles[i]
      if (!obstacle.model) continue

      const dist = obstacle.getPosition().distanceTo(shipPos)
      if (dist < this.interactionRadius) {
        // Interacción posible
        if (obstacle.type === ObstacleType.Star) {
          onStarCollected(obstacle.getReactionTime())
        } else if (obstacle.type === ObstacleType.Trash) {
          onImpulsiveError()
        } else if (obstacle.type === ObstacleType.Dog) {
          onDogDestroyed()
        }
        obstacle.destroy()
        obstacles.splice(i, 1)
      }
    }
  }

  /**
   * Limpia obstáculos que han expirado o pasado
   * @param obstacles - Array de obstáculos (será mutado)
   * @param shipZ - Posición Z de la nave
   * @param onExpired - Callback cuando un obstáculo expira sin interacción
   */
  public cleanup(
    obstacles: Obstacle[],
    shipZ: number,
    onExpired: (type: ObstacleType) => void
  ): void {
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const obstacle = obstacles[i]
      const isExpired = obstacle.isExpired()
      const isPassed = obstacle.getPosition().z < shipZ - 20
      
      if (isPassed || isExpired) {
        if (isPassed) {
          console.log('⚠️  Obstáculo pasó sin ser destruido:', obstacle.type)
          onExpired(obstacle.type)
        } else {
          console.log('⏱️  Obstáculo expiró:', obstacle.type)
        }
        obstacle.destroy()
        obstacles.splice(i, 1)
      }
    }
  }
}