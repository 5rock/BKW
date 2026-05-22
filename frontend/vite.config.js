import { brotliCompressSync, gzipSync } from 'node:zlib';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/** Emit pre-compressed .gz and .br files for server-side delivery */
const compressionPlugin = () => ({
  name: 'production-compression',
  apply: 'build',
  generateBundle(_, bundle) {
    for (const [fileName, asset] of Object.entries(bundle)) {
      if (!/\.(js|css|html|svg|json)$/.test(fileName)) continue;
      const source =
        typeof asset.source === 'string' ? Buffer.from(asset.source) : asset.source;
      if (!source || source.length < 1024) continue;

      this.emitFile({
        type: 'asset',
        fileName: `${fileName}.gz`,
        source: gzipSync(source, { level: 9 }),
      });
      this.emitFile({
        type: 'asset',
        fileName: `${fileName}.br`,
        source: brotliCompressSync(source),
      });
    }
  },
});

/**
 * Manual chunk strategy — keeps vendor bundles focused so only
 * what a route needs is fetched. Each chunk is a separate HTTP request
 * that can be cached independently.
 */
const manualChunks = (id) => {
  if (!id.includes('node_modules')) return undefined;

  // Heavy async-only vendors — loaded on-demand, never block homepage
  if (id.includes('hls.js')) return 'vendor-hls';
  if (id.includes('firebase/firestore') || id.includes('@firebase/firestore'))
    return 'vendor-firebase-firestore';
  if (id.includes('firebase/storage') || id.includes('@firebase/storage'))
    return 'vendor-firebase-storage';
  if (id.includes('firebase/auth') || id.includes('@firebase/auth'))
    return 'vendor-firebase-auth';
  if (id.includes('firebase') || id.includes('@firebase'))
    return 'vendor-firebase-core';
  if (id.includes('@tensorflow')) return 'vendor-tf';

  // Swiper is lazy-loaded — keep it separate
  if (id.includes('swiper')) return 'vendor-swiper';

  // Framer-motion — keep isolated so tree-shaking works per chunk
  if (
    id.includes('framer-motion') ||
    id.includes('motion-dom') ||
    id.includes('motion-utils')
  )
    return 'vendor-motion';

  // Chart library — only seller dashboard needs it
  if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';

  // Router
  if (id.includes('react-router')) return 'vendor-router';

  // Core React runtime — tiny and shared everywhere
  if (id.includes('react-dom') || id.includes('scheduler')) return 'vendor-react-dom';
  if (id.includes('/react/')) return 'vendor-react';

  // Icons — lucide tree-shakes well; keep in its own chunk so it can be cached
  if (id.includes('lucide-react')) return 'vendor-icons';

  // State / form / misc utilities
  if (
    id.includes('zustand') ||
    id.includes('react-hook-form') ||
    id.includes('axios') ||
    id.includes('clsx') ||
    id.includes('tailwind-merge')
  )
    return 'vendor-utils';

  // Everything else (toasts, phone input, range, countup …)
  return 'vendor-misc';
};

export default defineConfig({
  plugins: [
    react({
      // Babel config — remove prop-types & dev-only code in production
      babel: {
        plugins: [
          ['transform-remove-console', { exclude: ['error', 'warn'] }],
        ],
      },
    }),
    compressionPlugin(),
  ],

  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: { safari10: true },
      format: { comments: false },
    },
    cssCodeSplit: true,
    sourcemap: false,
    // Warn when any single chunk exceeds 400 kB (gzip ~130 kB)
    chunkSizeWarningLimit: 400,
    // Inline small assets (< 4 kB) as base64 to cut HTTP round-trips
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks,
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
      // Warn on circular deps which bloat bundles
      onwarn(warning, warn) {
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        warn(warning);
      },
    },
  },

  optimizeDeps: {
    // Exclude large async deps so Vite doesn't pre-bundle them.
    // They are imported dynamically and will be split into their own chunks.
    exclude: ['firebase', 'firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage', 'hls.js', '@tensorflow-models/mobilenet', '@tensorflow/tfjs'],
    // Pre-bundle synchronous critical-path deps for fast dev starts
    include: ['react', 'react-dom', 'react-router-dom', 'zustand', 'axios', 'clsx', 'tailwind-merge'],
  },
});
