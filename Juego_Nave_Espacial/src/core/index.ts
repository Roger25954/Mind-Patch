export { App } from './app'

// Re-exportar clases de módulos principales para consumo en un solo punto.
export { InputController, type InputResponse } from './input_controller'
export { CameraController } from './camera.controller'
export { Skybox } from './skybox'
export { Spaceship } from './spaceship'
export { ParticleSystem } from './particle_system'

// Nuevos módulos de medición clínica (Fase 2)
export { Stimulus, StimulusType, ResponseType, type StimulusPresentation } from './stimulus'
export { MetricsTracker, type SectorMetrics, type SessionMetrics } from './metrics_tracker'
export { ResponseDetector } from './response_detector'
export { StimulusScheduler, PRUEBA_CONFIG } from './stimulus_scheduler'

// Nuevos módulos de flujo (Fase 3)
export { SectorManager } from './sector_manager'
export { HUD } from './hud'
export { ResultsScreen } from './results_screen'
