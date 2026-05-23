import { Buffer } from 'node:buffer';
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

  if (id.includes('swiper')) return 'vendor-swiper';

  if (
    id.includes('framer-motion') ||
    id.includes('motion-dom') ||
    id.includes('motion-utils')
  )
    return 'vendor-motion';

  if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts';
  if (id.includes('react-countup') || id.includes('countup')) return 'vendor-countup';
  if (id.includes('react-router')) return 'vendor-router';
  if (id.includes('react-dom') || id.includes('scheduler')) return 'vendor-react-dom';
  if (id.includes('/react/')) return 'vendor-react';

  // FIX: lucide-react is 799 KiB — split into its own cacheable chunk
  if (id.includes('lucide-react')) return 'vendor-icons';

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
      babel: {
        plugins: [
          ['transform-remove-console', { exclude: ['error', 'warn'] }],
        ],
      },
    }),
    compressionPlugin(),
  ],

  build: {
    modulePreload: false,
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 2,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        // Additional aggressive compression
        dead_code: true,
        unused: true,
      },
      mangle: { safari10: true },
      format: { comments: false },
    },
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 400,
    // FIX: Inline more small assets to cut HTTP round-trips
    assetsInlineLimit: 8192,
    rollupOptions: {
      output: {
        manualChunks,
        assetFileNames: 'assets/[name]-[hash][extname]',
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
      },
      onwarn(warning, warn) {
        if (warning.code === 'CIRCULAR_DEPENDENCY') return;
        warn(warning);
      },
    },
  },

  optimizeDeps: {
    exclude: [
      'firebase', 'firebase/app', 'firebase/auth',
      'firebase/firestore', 'firebase/storage',
      'lucide-react',
      'hls.js',
      '@tensorflow-models/mobilenet', '@tensorflow/tfjs',
    ],
    include: [
      'react', 'react-dom', 'react-router-dom',
      'zustand', 'axios', 'clsx', 'tailwind-merge',
    ],
  },

  // FIX: Serve with proper headers in dev to simulate production behaviour
  server: {
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
    },
  },
});
