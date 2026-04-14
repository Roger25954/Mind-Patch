# Skybox Cube Map Images

Coloca aquí las 6 imágenes del cube map para el skybox del juego. Las imágenes deben ser nombradas exactamente como se indica:

- `px.jpg` - Cara derecha (positive X)
- `nx.jpg` - Cara izquierda (negative X)
- `py.jpg` - Cara arriba (positive Y)
- `ny.jpg` - Cara abajo (negative Y)
- `pz.jpg` - Cara frente (positive Z)
- `nz.jpg` - Cara atrás (negative Z)

## Formato recomendado:
- Resolución: 1024x1024 píxeles o superior
- Formato: JPG o PNG
- Orientación: Las imágenes deben estar orientadas correctamente para formar un cubo continuo

## Ejemplo de estructura:
```
public/
  skybox/
    px.jpg
    nx.jpg
    py.jpg
    ny.jpg
    pz.jpg
    nz.jpg
```

## Activación:
Una vez colocadas las imágenes, modifica `src/core/app.ts` para pasar las URLs al constructor del Skybox:

```typescript
private readonly skybox = new Skybox(this.scene, [
  '/skybox/px.jpg', '/skybox/nx.jpg',
  '/skybox/py.jpg', '/skybox/ny.jpg',
  '/skybox/pz.jpg', '/skybox/nz.jpg'
])
```

Si las imágenes no se cargan, el skybox mostrará un fondo azul procedural como respaldo.