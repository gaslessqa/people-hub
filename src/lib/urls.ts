/**
 * URLs oficiales de la aplicación por ambiente
 * Fuente única de verdad para todos los redirects y links
 *
 * Ambientes:
 * - development: localhost:3000 (servidor local)
 * - staging: rama 'staging' en Vercel (custom environment tipo preview)
 * - production: rama 'main' en Vercel
 */
export const APP_URLS = {
  development: 'http://localhost:3000',
  staging: 'https://people-hub-git-staging-gaslessqas.vercel.app',
  production: 'https://people-hub-blush.vercel.app',
} as const;

export type AppEnvironment = keyof typeof APP_URLS;

/**
 * Detecta el ambiente actual basándose en variables de Vercel/Node
 *
 * - VERCEL_ENV='production' → production
 * - VERCEL_ENV='preview'    → staging (nuestro custom environment)
 * - Sin VERCEL_ENV          → development (local)
 */
export function getEnvironment(): AppEnvironment {
  if (process.env.VERCEL_ENV === 'production') {
    return 'production';
  }

  if (process.env.VERCEL_ENV === 'preview') {
    return 'staging';
  }

  return 'development';
}

/**
 * Retorna la URL base de la aplicación para el ambiente actual
 *
 * Uso:
 * ```ts
 * const baseUrl = getBaseUrl()
 * // development: 'http://localhost:3000'
 * // staging:     'https://people-hub-git-staging-gaslessqas.vercel.app'
 * // production:  'https://people-hub-blush.vercel.app'
 * ```
 */
export function getBaseUrl(): string {
  const env = getEnvironment();
  return APP_URLS[env];
}

/**
 * Construye una URL completa a partir de un path
 *
 * Uso:
 * ```ts
 * buildUrl('/people/123')
 * // → 'https://people-hub-blush.vercel.app/people/123' (en production)
 * ```
 */
export function buildUrl(path: string): string {
  const baseUrl = getBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
