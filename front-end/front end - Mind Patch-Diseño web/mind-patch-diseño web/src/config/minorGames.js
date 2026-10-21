/**
 * Juegos del módulo infantil / adolescente.
 * Cada carpeta es un front independiente; en desarrollo suele ser otro puerto (Vite, etc.).
 *
 * Rutas en tu máquina (referencia):
 *   D:\Mind-Patch\juego-astrid
 *   D:\Mind-Patch\front-end\Juego_Academia_de_la_magia
 *   D:\Mind-Patch\front-end\nova-drive
 *
 * Configura las URLs en .env (ver .env.example).
 */
const env = import.meta.env

export const MINOR_GAME_ENV = {
  juegoAstrid: env.VITE_MINOR_GAME_ASTRID_URL ?? '',
  academiaMagia: env.VITE_MINOR_GAME_ACADEMIA_URL ?? '',
  novaDrive: env.VITE_MINOR_GAME_NOVA_URL ?? '',
}
