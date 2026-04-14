// Importa los estilos CSS para el juego
import './style.css'
// Importa la clase principal App que maneja el juego
import { App } from './core'

// Espera a que el DOM esté completamente cargado antes de inicializar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    // Crea una nueva instancia de la aplicación del juego
    new App()
})