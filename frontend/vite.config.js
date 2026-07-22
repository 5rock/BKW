import { brotliCompressSync, gzipSync } from 'node:zlib';
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Production compression plugin — emits pre-compressed .gz and .br files.
 * When served with a web server configured to serve pre-compressed files
 * (nginx: gzip_static on; brotli_static on) this eliminates runtime compression.
 */
const compressionPlugin = () => ({
  name: 'production-compression',
  apply: 'build',
  generateBundle(_, bundle) {
    for (const [fileName, asset] of Object.entries(bundle)) {
      if (!/\.(js|css|html|svg|json)$/.test(fileName)) continue;
      const raw = asset.source ?? asset.code;
      if (!raw) continue;
      const source = typeof raw === 'string' ? Buffer.from(raw) : raw;
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
 * Manual chunk splitting strategy.
 *
 * Goals:
 *  1. Keep the critical-path bundle (loaded on every page) as small as possible
 *  2. Isolate large async-only deps so they are never in the critical path
 *  3. Create stable, long-lived chunks with consistent hashes for CDN caching
 *
 * Critical path (always loaded):
 *   - react + react-dom runtime
 *   - react-router (needed for client-side navigation)
 *   - app entry + page component
 *
 * Everything else: loaded on demand.
 */
const manualChunks = (id) => {
  if (!id.includes('node_modules')) return undefined;

  // ── Async-only heavy vendors (dynamic imports — never in critical path)
  if (id.includes('hls.js')) return 'vendor-hls';
  if (id.includes('@stripe')) return 'vendor-stripe';

  // Firebase split by module — firestore is heaviest (301 kB)
  if (id.includes('firebase/firestore') || id.includes('@firebase/firestore'))
    return 'vendor-firebase-firestore';
  if (id.includes('firebase/storage') || id.includes('@firebase/storage'))
    return 'vendor-firebase-storage';
  if (id.includes('firebase/auth') || id.includes('@firebase/auth'))
    return 'vendor-firebase-auth';
  if (id.includes('firebase') || id.includes('@firebase'))
    return 'vendor-firebase-core';
  if (id.includes('@tensorflow')) return 'vendor-tf';

  // ── Medium async vendors
  if (id.includes('swiper')) return 'vendor-swiper';
  if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils'))
    return 'vendor-motion';
  if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
  if (id.includes('react-countup') || id.includes('countup.js')) return 'vendor-countup';

  // ── Critical path — stable cache keys
  if (id.includes('react-router')) return 'vendor-router';
  if (id.includes('react-dom') || id.includes('scheduler')) return 'vendor-react-dom';
  if (id.includes('/react/') || id.includes('\\react\\')) return 'vendor-react';

  // ── Icons — large but stable, good cache target
  if (id.includes('lucide-react')) return 'vendor-icons';

  // ── Utilities
  if (
    id.includes('zustand') ||
    id.includes('react-hook-form') ||
    id.includes('axios') ||
    id.includes('clsx') ||
    id.includes('tailwind-merge')
  )
    return 'vendor-utils';

  return 'vendor-misc';
};

export default defineConfig({
  plugins: [
    react({
      // Babel transform to strip console.* calls from production bundles
      babel: {
        plugins: [
          ['transform-remove-console', { exclude: ['error', 'warn'] }],
        ],
      },
    }),
    compressionPlugin(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace'],
        dead_code: true,
        unused: true,
        // Collapse scope to reduce variable count — good for V8 parse time
        collapse_vars: true,
        reduce_vars: true,
      },
      mangle: {
        safari10: true,
        // Mangle class names in production (framer-motion uses class properties)
        keep_classnames: false,
      },
      format: { comments: false },
    },
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 400,
    // Inline small assets as base64 to eliminate HTTP round trips
    assetsInlineLimit: 6144, // 6 kB
    rollupOptions: {
      output: {
        manualChunks,
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
      onwarn(warning, warn) {
        // Suppress circular dependency warnings from third-party libs
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        // Suppress "use client" directive warnings from RSC-aware libraries
        if (warning.message?.includes('"use client"')) return;
        warn(warning);
      },
    },
  },

  optimizeDeps: {
    // Exclude large async-only deps from pre-bundling so they are
    // individually tree-shakeable at build time
    exclude: [
      'firebase',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
      'hls.js',
      '@tensorflow-models/mobilenet',
      '@tensorflow/tfjs',
    ],
    // Pre-bundle synchronous critical-path deps for fast dev server startup
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      'zustand',
      'axios',
      'clsx',
      'tailwind-merge',
    ],
  },

  // Dev server configuration
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
    },
  },

  // Preview server — simulate production caching headers
  preview: {
    headers: {
      // Cache hashed assets for 1 year
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },
});
