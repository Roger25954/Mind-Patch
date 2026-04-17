# Guía de Debug - Problema con Espacio y Proyectiles

## Cambios Realizados

He agregado logging extenso para debuggear por qué el espacio no se detecta y por qué los proyectiles no se disparan.

### 1. **InputController.ts** - Mejorado con logging
- Arrow function para `onKeyDown` (preserva `this`)
- Event listeners agregados a: canvas, document y window
- Logging cuando se presiona espacio
- Validaciones múltiples de detección de espacio

### 2. **index.ts** - Logging en handleSpacePress()
- Verifica si se ejecuta la función
- Muestra si hay nave y obstáculos
- Registra qué obstáculo se selecciona como objetivo

### 3. **collision_manager.ts** - Logging de colisiones
- Muestra cuando un proyectil impacta
- Registra qué obstáculos pasan sin ser destruidos

## Cómo Debuggear

### Paso 1: Compilar y ejecutar el proyecto
```bash
npm run dev
```

### Paso 2: Abrir la consola del navegador
- Presiona: **F12** o **Ctrl+Shift+I**
- Ve a la pestaña "Consola" (Console)

### Paso 3: Buscar estos logs cuando presiones espacio

**Si todo funciona:**
- ✅ `InputController inicializado`
- ✅ `Event listeners configurados...`
- ✅ `🔴 ESPACIO PRESIONADO - evento capturado`
- ✅ `Espacio consumido - disparando`
- ✅ `handleSpacePress ejecutado`
- ✅ `Disparando hacia: [tipo]`
- ✅ `💥 ¡COLISIÓN! Obstáculo tipo:...`

**Si algo falla:**
- ❌ No ve `🔴 ESPACIO PRESIONADO`: El evento keydown no se captura
  - Solución: Hacer clic en el canvas primero para darle focus
  
- ❌ Ver `🔴 ESPACIO PRESIONADO` pero NO `Espacio consumido`: 
  - El flag no se está consumiendo correctamente
  
- ❌ No ver `handleSpacePress ejecutado`:
  - El método animate() no está llamando a handleSpacePress()
  
- ❌ Ver `No hay nave o obstáculos`:
  - La nave no cargó o no hay obstáculos en pantalla

## Información Técnica

### Event Listeners Agregados
El `InputController` ahora agrega listeners en tres niveles:
1. Al canvas HTML directamente
2. Al documento (document)
3. A la ventana (window)

Esto asegura máxima cobertura para capturar el evento.

### Detección de Espacio
Se valida usando:
- `event.key === ' '` (estándar moderno)
- `event.code === 'Space'` (código de teclado)
- `event.keyCode === 32` (código numérico legacy)

### Flujo del Juego
```
Presiona Espacio
    ↓
InputController.onKeyDown() → spacePressed = true
    ↓
animate() loop → consumeSpace() 
    ↓
handleSpacePress() → busca obstáculo más cercano
    ↓
spaceship.shootToward() → crea proyectil
    ↓
checkBullets() → detecta colisión con obstáculo
    ↓
Obstáculo destruido + puntos registrados
```

## Próximos Pasos Si Sigue Sin Funcionar

1. **Verifica el focus**: Haz clic en el canvas antes de presionar espacio
2. **Revisa la consola**: Copia los primeros 5 logs y comparte conmigo
3. **Intenta con Enter**: Para verificar si el problema es específico de espacio

---

*Última actualización: 24/03/2026*
