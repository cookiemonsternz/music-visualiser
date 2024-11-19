// vite.config.js
export default {
    build: {
      target: 'esnext',
      minify: 'terser',
      terserOptions: {
        keep_classnames: true,
        keep_fnames: true
      }
    },
    /*
    optimizeDeps: {
      exclude: ['three/webgpu']
    }
      */
  }