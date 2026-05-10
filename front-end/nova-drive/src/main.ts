import { GameManager } from './GameManager.ts';

// ── Arrancar el juego cuando el DOM esté listo ───────────────────────────────
const manager = new GameManager();

manager.start().catch((err: unknown) => {
  console.error('[NOVA DRIVE] Error crítico al iniciar:', err);
});

// ── Exponer en window para debugging en consola ──────────────────────────────
(window as any).__novaDrive = manager;