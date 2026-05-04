# El Guardián Espacial — Landing + Juego

Este repositorio contiene una versión de prueba del juego "El Guardián Espacial".

Cambios realizados:

- `Index.html`: ahora es una página principal (landing) con un botón "Jugar" que carga dinámicamente el juego.
  - Mantiene un panel de debug que muestra logs de consola cuando se activa.
  - Al pulsar "Jugar" se importa `/src/main.ts` y se invoca `startApp()`.

- `src/main.ts`: ahora exporta `startApp()` que instancia `App` y la expone en `window.__app`.
  - Hay una compatibilidad para auto-iniciar si el módulo se carga antes de la interacción del usuario.

Cómo probar localmente:

1. Instala dependencias e inicia el servidor:

```bash
npm install
npm run dev
```

2. Abre en el navegador:

```
http://localhost:5174/
```

3. Pulsa "Jugar" para cargar el juego. Abre el panel DEBUG (arriba-derecha) para ver logs.

Inspección en runtime (consola del navegador):

```js
// acceso a la instancia
window.__app
window.__app.bullets // array de proyectiles
window.__app.stimulusScheduler.getActiveStimuli()
```

Notas:
- Si usas Vite y ves muchos errores de WebSocket en consola (HMR), asegúrate de que `npm run dev` está ejecutándose correctamente.
- Si quieres que el juego se cargue inmediatamente sin pulsar el botón, puedes editar `Index.html` y llamar a `startGame()` al cargar.

Si quieres que haga más cambios (por ejemplo: abrir el juego en una nueva ruta `/game` o añadir una pantalla de configuración), indícamelo y lo implemento.