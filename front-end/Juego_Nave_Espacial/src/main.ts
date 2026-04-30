// Importa los estilos CSS para el juego
import './style.css'
// Importa la clase principal App que maneja el juego
import { App } from './core'

// Función que inicia la aplicación y la expone en window.__app
export async function startApp() {
    // @ts-ignore
    if ((window as any).__app) return (window as any).__app
    // Crear la app
    // @ts-ignore
    const app = new App()
    // @ts-ignore
    window.__app = app
    return app
}

// API de compatibilidad: si el módulo se carga automáticamente en tiempo de carga
// (por ejemplo, con <script type="module" src="/src/main.ts">) y el DOM ya
// está listo, iniciar la app automáticamente.
if (document.readyState !== 'loading') {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    startApp().catch(() => {})
} else {
    document.addEventListener('DOMContentLoaded', () => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        startApp().catch(() => {})
    })
}