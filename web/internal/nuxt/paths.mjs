import { joinRelativeURL } from 'ufo'

export function baseURL() {
  return process.env.NUXT_APP_BASE_URL || '/'
}

export function buildAssetsDir() {
  return process.env.NUXT_APP_BUILD_ASSETS_DIR || '/_nuxt/'
}

export function buildAssetsURL(...path) {
  return joinRelativeURL(publicAssetsURL(), buildAssetsDir(), ...path)
}

export function publicAssetsURL(...path) {
  const publicBase = process.env.NUXT_APP_CDN_URL || baseURL()
  return path.length ? joinRelativeURL(publicBase, ...path) : publicBase
}
