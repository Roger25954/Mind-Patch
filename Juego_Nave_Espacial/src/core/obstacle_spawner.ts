/**
 * Clase ObstacleSpawner: Gestiona la creación de obstáculos (meteoritos) en el juego.
 * Spawnea obstáculos periódicamente en forma aleatoria delante de la nave
 */

import { Scene, Vector3 } from 'three'
import { Obstacle, ObstacleType } from './obstacle'
import { Spaceship } from './spaceship'

export class ObstacleSpawner {
  // Temporizador para controlar el spawn
  private spawnTimer = 0
  // Intervalo entre spawns (en frames) - aumentado para menos spawns
  private readonly spawnInterval = 200
  // Distancia delante de la nave para spawnear
  private readonly spawnAhead = 120
  // Rango lateral de spawn
  private readonly spawnSpread = 5

  constructor(
    private readonly scene: Scene,
    private readonly spaceship: Spaceship
  ) {}

  /**
   * Actualiza el spawner y agrega nuevos obstáculos al array
   * @param obstacles - Array de obstáculos (será mutado con nuevos spawn)
   * @returns true si se spawneó un obstáculo
   */
  public update(obstacles: Obstacle[]): boolean {
    this.spawnTimer++
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0
      const obstacle = this.trySpawn()
      if (obstacle) {
        obstacles.push(obstacle)
        return true
      }
    }
    return false
  }

  /**
   * Intenta crear un nuevo obstáculo en una posición aleatoria delante de la nave
   * @returns Nuevo obstáculo o null si la nave no está cargada
   */
  private trySpawn(): Obstacle | null {
    if (!this.spaceship.model) return null

    const shipPos = this.spaceship.model.position
    const spawnPos = new Vector3(
      shipPos.x + (Math.random() - 0.5) * this.spawnSpread * 2,
      0,  // Altura fija
      shipPos.z + this.spawnAhead
    )

    // Probabilidades: 80% estrella, 19% basura, 1% perro
    const rand = Math.random()
    let type: ObstacleType
    if (rand < 0.8) {
      type = ObstacleType.Star
    } else if (rand < 0.99) {
      type = ObstacleType.Trash
    } else {
      type = ObstacleType.Dog
    }

    return new Obstacle(this.scene, spawnPos, type)
  }
}