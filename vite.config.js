export default {
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html',
        viewer: './viewer.html',
        dystopian: './dystopian-island.html'
      }
    }
  }
}
