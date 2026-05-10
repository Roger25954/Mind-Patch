import { Zone } from './types';
import type { GameConfig } from './types';

// ════════════════════════════════════════════════════════════════════════════
// Configuración central del juego
// ════════════════════════════════════════════════════════════════════════════
export const GAME_CONFIG: GameConfig = {
  totalTrials:      100,
  starRatio:        0.2,    // 320 estrellas (Go)
  debrisRatio:      0.8,    // 80  asteroides (No-Go)
  itemIntervalMs:   2000,   // ms entre ítems
  stimulusWindowMs: 1500,   // ventana de respuesta

 // En constants.ts
  zones: [
    { 
        name: Zone.EARTH, 
        threshold: 0.0, 
        skybox: '/skyboxes/skybox_earth_moon/', 
        bgm: '/audio/bgm_earth.ogg',
        planet: '/models/planet_earth.glb' // <--- Añade esto
    },
    { 
        name: Zone.MOON, 
        threshold: 0.25, 
        skybox: '/skyboxes/skybox_earth_moon/', 
        bgm: '/audio/bgm_moon.ogg',
        planet: '/models/planet_moon.glb' // <--- Añade esto
    },
    { 
        name: Zone.MARS, 
        threshold: 0.50, 
        skybox: '/skyboxes/skybox_mars_jupyther/', 
        bgm: '/audio/bgm_mars.ogg',
        planet: '/models/planet_mars.glb' // <--- Añade esto
    },
    { 
        name: Zone.JUPITER, 
        threshold: 0.75, 
        skybox: '/skyboxes/skybox_mars_jupyther/', 
        bgm: '/audio/bgm_jupiter.ogg',
        planet: '/models/planet_jupyther.glb' // <--- Añade esto
    },
  ],
};

// ════════════════════════════════════════════════════════════════════════════
// Rutas de todos los assets (relativas a /public)
// ════════════════════════════════════════════════════════════════════════════
export const ASSET_PATHS = {

  // ── Modelos 3D ────────────────────────────────────────────────────────────
  models: {
    player_ship:       '/models/player_ship.glb',
    star_collectible:  '/models/star_collectible.glb',
    asteroid_1:        '/models/asteroid_1.glb',
    asteroid_2:        '/models/asteroid_2.glb',
    asteroid_3:        '/models/asteroid_3.glb',
    planet_earth:      '/models/planet_earth.glb',
    planet_moon:       '/models/planet_moon.glb',
    planet_mars:       '/models/planet_mars.glb',
    planet_jupiter:    '/models/planet_jupiter.glb',
  },

  // ── Skyboxes (carpeta con 6 imágenes px/nx/py/ny/pz/nz .jpg) ─────────────
  skyboxes: {
    earth:   '/skyboxes/skybox_earth_moon/',
    moon:    '/skyboxes/skybox_earth_moon/',
    mars:    '/skyboxes/skybox_mars_jupyther/',
    jupiter: '/skyboxes/skybox_mars_jupyther/',
  },

  // ── Texturas de partículas ────────────────────────────────────────────────
  textures: {
    spark:   '/textures/spark.png',
    glow:    '/textures/glow.png',
    debris:  '/textures/debris.png',
    smoke:   '/textures/smoke.png',
  },

  // ── Audio ─────────────────────────────────────────────────────────────────
  audio: {
    bgm_earth:          '/audio/bgm_earth.ogg',
    bgm_moon:           '/audio/bgm_moon.ogg',
    bgm_mars:           '/audio/bgm_mars.ogg',
    bgm_jupiter:        '/audio/bgm_jupiter.ogg',
    sfx_star_collect:   '/audio/sfx_star_collect.ogg',
    sfx_shield_activate:'/audio/sfx_shield_activate.ogg',
    sfx_shield_hit:     '/audio/sfx_shield_hit.ogg',
    sfx_asteroid_damage:'/audio/sfx_asteroid_damage.ogg',
    sfx_warp_start:     '/audio/sfx_warp_start.ogg',
    sfx_warp_end:       '/audio/sfx_warp_end.ogg',
    sfx_warning:        '/audio/sfx_warning.ogg',
  },
} as const;