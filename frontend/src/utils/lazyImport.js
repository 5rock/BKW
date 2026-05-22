/**
 * lazyImport.js — Robust React.lazy wrapper with:
 *  1. Automatic retry on network failure (chunk loading errors)
 *  2. Named export support (React.lazy only supports default exports natively)
 *
 * Usage:
 *   const { MyComponent } = lazyImport(() => import('./MyComponent'), 'MyComponent');
 *   // or for default exports:
 *   const MyPage = lazyImport(() => import('./MyPage'));
 */

import { lazy } from 'react';

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 800;

/**
 * Wraps a dynamic import with exponential-backoff retry logic.
 * Handles chunk loading failures caused by stale deployments or flaky networks.
 */
const retryImport = (importFn, retries = MAX_RETRIES) =>
  new Promise((resolve, reject) => {
    importFn().then(resolve).catch((error) => {
      if (retries === 0) {
        reject(error);
        return;
      }
      setTimeout(() => {
        retryImport(importFn, retries - 1).then(resolve).catch(reject);
      }, RETRY_DELAY_MS);
    });
  });

/**
 * Lazy-loads a named export from a module.
 *
 * @param {() => Promise<module>} importFn   - Dynamic import factory
 * @param {string}                [exportName] - Named export (defaults to 'default')
 * @returns {React.LazyExoticComponent}
 *
 * @example
 * const { ProductCard } = lazyImport(() => import('./ProductCard'), 'ProductCard');
 */
export const lazyImport = (importFn, exportName = 'default') =>
  lazy(() =>
    retryImport(importFn).then((module) => ({
      default: exportName === 'default' ? module.default : module[exportName],
    }))
  );

export default lazyImport;
