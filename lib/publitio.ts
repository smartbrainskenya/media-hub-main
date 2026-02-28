import 'server-only';
// @ts-ignore
import PublitioAPI from 'publitio_js_sdk';

const apiKey = process.env.PUBLITIO_API_KEY;
const apiSecret = process.env.PUBLITIO_API_SECRET;
const brandedDomain = process.env.PUBLITIO_BRANDED_DOMAIN;

export const publitio = (apiKey && apiSecret)
  ? new PublitioAPI(apiKey, apiSecret)
  : null as any;

if (!publitio && process.env.NODE_ENV !== 'production') {
  console.warn('Publitio client not initialized - missing env variables');
}

/**
 * Constructs full URL from PUBLITIO_BRANDED_DOMAIN + path
 */
export function buildBrandedUrl(publitioPath: string): string {
  const domain = brandedDomain || 'https://media.smartbrainskenya.com';
  // Ensure the path doesn't start with a slash if the domain ends with one, or vice-versa
  const cleanDomain = domain.endsWith('/') ? domain.slice(0, -1) : domain;
  const cleanPath = publitioPath.startsWith('/') ? publitioPath : `/${publitioPath}`;
  return `${cleanDomain}${cleanPath}`;
}
