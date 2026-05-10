import { defineConfig } from 'vite'

export default defineConfig({
  base: '/nova-drive/',
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.hdr', '**/*.ogg'],
  build: {
    assetsInlineLimit: 0,
  },
})