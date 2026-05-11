const _base = import.meta.env.BASE_URL; // '/nova-drive/' en build, '/' en dev

/** Convierte una ruta pública (/models/foo.glb) a la URL correcta según el base path de Vite */
export const assetUrl = (path: string): string =>
  _base + (path.startsWith('/') ? path.slice(1) : path);
