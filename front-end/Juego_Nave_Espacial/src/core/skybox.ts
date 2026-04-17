import {
  Scene,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  BackSide,
  CubeTextureLoader,
  CubeTexture,
  Vector3,
} from 'three'

/**
 * Skybox: Sistema de fondo ambiental usando cube map
 *
 * Esta clase crea un skybox inmersivo cargando un conjunto de 6 imágenes
 * que representan las caras de un cubo (frente, atrás, izquierda, derecha, arriba, abajo).
 *
 * Características:
 * - Carga automática de cube map desde archivos de imagen
 * - Renderizado eficiente con geometría esférica
 * - Seguimiento automático de la posición de la cámara
 * - Liberación de recursos al destruir
 *
 * @example
 * ```typescript
 * // Con cube map
 * const skybox = new Skybox(scene, [
 *   'px.jpg', 'nx.jpg', // derecha, izquierda
 *   'py.jpg', 'ny.jpg', // arriba, abajo
 *   'pz.jpg', 'nz.jpg'  // frente, atrás
 * ])
 *
 * // Sin cube map (procedural)
 * const skybox = new Skybox(scene)
 * ```
 */
export class Skybox {
  private mesh: Mesh | null = null
  private texture: CubeTexture | null = null

  /**
   * Crea un nuevo skybox con cube map
   *
   * @param scene - Escena de Three.js donde se añadirá el skybox
   * @param urls - Array opcional de 6 URLs de imágenes para el cube map:
   *               [derecha, izquierda, arriba, abajo, frente, atrás]
   *               Si no se proporciona, usa skybox procedural
   */
  constructor(private readonly scene: Scene, urls?: string[]) {
    if (urls && urls.length === 6) {
      this.loadCubeMap(urls)
    } else {
      this.createFallbackSkybox()
    }
  }

  /**
   * Carga las imágenes del cube map y crea la geometría del skybox
   *
   * @param urls - Array de URLs de las 6 imágenes del cube map
   * @private
   */
  private loadCubeMap(urls: string[]): void {
    const loader = new CubeTextureLoader()

    loader.load(
      urls,
      (texture: CubeTexture) => {
        this.texture = texture
        this.createSkyboxMesh()
      },
      undefined,
      (error) => {
        console.error('Error cargando cube map:', error instanceof Error ? error.message : error || 'Archivo no encontrado')
        this.createFallbackSkybox()
      }
    )
  }

  /**
   * Crea la malla del skybox usando la textura del cube map
   * @private
   */
  private createSkyboxMesh(): void {
    if (!this.texture) return

    const geometry = new SphereGeometry(500, 32, 16)
    const material = new MeshBasicMaterial({
      envMap: this.texture,
      side: BackSide,
      depthWrite: false,
    })

    this.mesh = new Mesh(geometry, material)
    this.mesh.renderOrder = -1 // Renderizar primero (fondo)
    this.scene.add(this.mesh)
  }

  /**
   * Crea un skybox de respaldo procedural si falla la carga del cube map
   * @private
   */
  private createFallbackSkybox(): void {
    const geometry = new SphereGeometry(500, 32, 16)
    const material = new MeshBasicMaterial({
      color: 0x000011,
      side: BackSide,
      depthWrite: false,
    })

    this.mesh = new Mesh(geometry, material)
    this.mesh.renderOrder = -1
    this.scene.add(this.mesh)

    console.warn('Usando skybox de respaldo procedural')
  }

  /**
   * Actualiza la posición del skybox para que siga a la cámara
   *
   * @param cameraPosition - Posición actual de la cámara
   */
  public update(cameraPosition: Vector3): void {
    if (this.mesh) {
      this.mesh.position.copy(cameraPosition)
    }
  }

  /**
   * Libera los recursos del skybox (geometría, materiales, texturas)
   */
  public dispose(): void {
    if (this.mesh) {
      this.scene.remove(this.mesh)
      this.mesh.geometry.dispose()
      if (this.mesh.material instanceof MeshBasicMaterial) {
        this.mesh.material.dispose()
        if (this.texture) {
          this.texture.dispose()
        }
      }
    }
  }
}