/**
 * Clase CameraController: Controla el movimiento y orientación de la cámara.
 * La cámara sigue a la nave con un offset suave y mira hacia adelante (dirección de movimiento)
 */

import { PerspectiveCamera, Vector3 } from "three"
import { Spaceship } from "./spaceship"

export class CameraController {
    // Offset de la cámara respecto a la nave - permite ver nave y obstáculos
    private readonly offset: Vector3 = new Vector3(0, 4, -8)

    constructor(private readonly perspectivCamera: PerspectiveCamera, private readonly spaceship : Spaceship) {}

    /**
     * Actualiza la posición y orientación de la cámara cada frame
     * - Interpola suavemente hacia la posición deseada
     * - Aplica rotación de la nave al offset
     * - Mira hacia donde apunta la nave
     */
    public update(): void {
      if (!this.spaceship.model) return

      const rotatedOffset = this.offset.clone().applyQuaternion(this.spaceship.model.quaternion)
      const desideredPosition = this.spaceship.model.position.clone().add(rotatedOffset)

      this.perspectivCamera.position.lerp(desideredPosition, 0.8)
  
      const forwardDirection = new Vector3(0, 0, 1)
          .applyQuaternion(this.spaceship.model.quaternion)
      const lookAtTarget = this.spaceship.model.position.clone().add(forwardDirection.multiplyScalar(100))
      
      this.perspectivCamera.lookAt(lookAtTarget)
    }
}