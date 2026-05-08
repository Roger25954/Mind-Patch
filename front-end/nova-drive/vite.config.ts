import { defineConfig } from 'vite'

export default defineConfig({
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr', '**/*.ogg'],
  build: {
    assetsInlineLimit: 0
  }
})