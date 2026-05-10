import { Zone } from './types';
import type { GameConfig } from './types';
import { assetUrl } from './assetUrl';

// ════════════════════════════════════════════════════════════════════════════
// Configuración central del juego
// ════════════════════════════════════════════════════════════════════════════
export const GAME_CONFIG: GameConfig = {
  totalTrials:      100,
  starRatio:        0.2,    // 320 estrellas (Go)
  debrisRatio:      0.8,    // 80  asteroides (No-Go)
  itemIntervalMs:   2000,   // ms entre ítems
  stimulusWindowMs: 1500,   // ventana de respuesta

  zones: [
    {
      name:      Zone.EARTH,
      threshold: 0.0,
      skybox:    assetUrl('/skyboxes/skybox_earth_moon/'),
      bgm:       'bgm_earth',
      planet:    assetUrl('/models/planet_earth.glb'),
    },
    {
      name:      Zone.MOON,
      threshold: 0.25,
      skybox:    assetUrl('/skyboxes/skybox_earth_moon/'),
      bgm:       'bgm_moon',
      planet:    assetUrl('/models/planet_moon.glb'),
    },
    {
      name:      Zone.MARS,
      threshold: 0.50,
      skybox:    assetUrl('/skyboxes/skybox_mars_jupyther/'),
      bgm:       'bgm_mars',
      planet:    assetUrl('/models/planet_mars.glb'),
    },
    {
      name:      Zone.JUPITER,
      threshold: 0.75,
      skybox:    assetUrl('/skyboxes/skybox_mars_jupyther/'),
      bgm:       'bgm_jupiter',
      planet:    assetUrl('/models/planet_jupyther.glb'),
    },
  ],
};

// ════════════════════════════════════════════════════════════════════════════
// Rutas de todos los assets
// ════════════════════════════════════════════════════════════════════════════
export const ASSET_PATHS = {

  // ── Modelos 3D ────────────────────────────────────────────────────────────
  models: {
    player_ship:      assetUrl('/models/space_shuttle.glb'),   // space_shuttle es el archivo real
    star_collectible: assetUrl('/models/star_collectible.glb'),
    asteroid_1:       assetUrl('/models/asteroid_1.glb'),
    asteroid_2:       assetUrl('/models/asteroid_2.glb'),
    asteroid_3:       assetUrl('/models/asteroid_1.glb'),      // asteroid_3 no existe → fallback
    planet_earth:     assetUrl('/models/planet_earth.glb'),
    planet_moon:      assetUrl('/models/planet_moon.glb'),
    planet_mars:      assetUrl('/models/planet_mars.glb'),
    planet_jupiter:   assetUrl('/models/planet_jupyther.glb'), // jupyther es el nombre real del archivo
  },

  // ── Skyboxes ──────────────────────────────────────────────────────────────
  skyboxes: {
    earth:   assetUrl('/skyboxes/skybox_earth_moon/'),
    moon:    assetUrl('/skyboxes/skybox_earth_moon/'),
    mars:    assetUrl('/skyboxes/skybox_mars_jupyther/'),
    jupiter: assetUrl('/skyboxes/skybox_mars_jupyther/'),
  },

  // ── Texturas de partículas ────────────────────────────────────────────────
  textures: {
    spark:  assetUrl('/textures/star.png'),    // spark.png no existe → usar star.png
    glow:   assetUrl('/textures/glow.png'),
    debris: assetUrl('/textures/debris.png'),
    smoke:  assetUrl('/textures/smoke.png'),
  },

  // ── Audio (archivos no incluidos; AudioManager maneja el fallo con timeout) ──
  audio: {
    bgm_earth:           assetUrl('/audio/bgm_earth.ogg'),
    bgm_moon:            assetUrl('/audio/bgm_moon.ogg'),
    bgm_mars:            assetUrl('/audio/bgm_mars.ogg'),
    bgm_jupiter:         assetUrl('/audio/bgm_jupiter.ogg'),
    sfx_star_collect:    assetUrl('/audio/sfx_star_collect.ogg'),
    sfx_shield_activate: assetUrl('/audio/sfx_shield_activate.ogg'),
    sfx_shield_hit:      assetUrl('/audio/sfx_shield_hit.ogg'),
    sfx_asteroid_damage: assetUrl('/audio/sfx_asteroid_damage.ogg'),
    sfx_warp_start:      assetUrl('/audio/sfx_warp_start.ogg'),
    sfx_warp_end:        assetUrl('/audio/sfx_warp_end.ogg'),
    sfx_warning:         assetUrl('/audio/sfx_warning.ogg'),
  },
};
