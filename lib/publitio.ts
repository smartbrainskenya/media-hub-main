import 'server-only';
// @ts-ignore
import PublitioAPI from 'publitio_js_sdk';

// Handle commonjs export structure of publitio_js_sdk
const PublitioClient = (PublitioAPI as any).publitioApi || (PublitioAPI as any).default || PublitioAPI;

const apiKey = process.env.PUBLITIO_API_KEY;
const apiSecret = process.env.PUBLITIO_API_SECRET;
const brandedDomain = process.env.PUBLITIO_BRANDED_DOMAIN;

export const publitio = (apiKey && apiSecret && typeof PublitioClient === 'function')
  ? new PublitioClient(apiKey, apiSecret)
  : null as any;

if (!publitio && process.env.NODE_ENV !== 'production') {
  console.warn('Publitio client not initialized - missing env variables');
}

/**
 * Constructs full URL from PUBLITIO_BRANDED_DOMAIN + path
 */
export function buildBrandedUrl(publitioPath: string): string {
  if (!publitioPath) return '';
  
  // If it's already a full URL pointing to our branded domain or any http(s), return it
  if (publitioPath.startsWith('http')) {
    // If it contains the raw publitio domain, we might want to replace it, 
    // but usually url_preview already uses the branded domain if configured in Publitio.
    return publitioPath;
  }

  const domain = brandedDomain || 'https://media.smartbrainskenya.com';
  // Ensure the path doesn't start with a slash if the domain ends with one, or vice-versa
  const cleanDomain = domain.endsWith('/') ? domain.slice(0, -1) : domain;
  const cleanPath = publitioPath.startsWith('/') ? publitioPath : `/${publitioPath}`;
  return `${cleanDomain}${cleanPath}`;
}
