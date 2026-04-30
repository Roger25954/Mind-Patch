import {
  Scene,
  Mesh,
  MeshBasicMaterial,
  Vector3,
  Group,
  SphereGeometry,
  BackSide,
  CanvasTexture
} from "three";
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js'

/**
 * Clase Skybox: Gestiona el fondo del juego (skybox/background).
 * Intenta cargar un modelo GLB, con fallback a un skybox procedural generado.
 */
export class Skybox {
  private skyboxMesh: Mesh | null = null
  private skyboxModel: Group | null = null
  private gltfLoader = new GLTFLoader()

  constructor(private readonly scene: Scene) {
    this.loadGLBSkybox()
  }

  private createProceduralSkybox(): void {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 512
    const ctx = canvas.getContext('2d')!
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#0a1a2e')
    gradient.addColorStop(0.5, '#16213e')
    gradient.addColorStop(1, '#0f0f1e')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const texture = new CanvasTexture(canvas)
    const geometry = new SphereGeometry(500, 64, 32)
    const material = new MeshBasicMaterial({ map: texture, side: BackSide })
    this.skyboxMesh = new Mesh(geometry, material)
    this.skyboxMesh.renderOrder = -1
    this.scene.add(this.skyboxMesh)
  }

  public loadGLBSkybox(): void {
    this.gltfLoader.load('./skybox.glb', (gltf: GLTF) => {
      this.skyboxModel = gltf.scene
      this.skyboxModel.position.copy(new Vector3(0, 0, 0))
      this.scene.add(this.skyboxModel)
    }, undefined, () => {
      this.createProceduralSkybox()
    })
  }

  public update(cameraPosition: Vector3): void {
    if (this.skyboxMesh) this.skyboxMesh.position.copy(cameraPosition)
    if (this.skyboxModel) this.skyboxModel.position.copy(cameraPosition)
  }

  public dispose(): void {
    if (this.skyboxMesh) {
      this.scene.remove(this.skyboxMesh)
      this.skyboxMesh.geometry.dispose()
      ;(this.skyboxMesh.material as MeshBasicMaterial).dispose()
    }
    if (this.skyboxModel) {
      this.scene.remove(this.skyboxModel)
      this.skyboxModel.traverse((child) => {
        if (child instanceof Mesh) {
          child.geometry.dispose()
          if (Array.isArray(child.material)) {
            child.material.forEach(mat => mat.dispose())
          } else {
            child.material.dispose()
          }
        }
      })
    }
  }
}