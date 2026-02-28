import 'server-only';
// @ts-ignore
import PublitioAPI from 'publitio_js_sdk';

const apiKey = process.env.PUBLITIO_API_KEY!;
const apiSecret = process.env.PUBLITIO_API_SECRET!;
const brandedDomain = process.env.PUBLITIO_BRANDED_DOMAIN!;

if (!apiKey || !apiSecret || !brandedDomain) {
  throw new Error('Missing Publitio environment variables');
}

export const publitio = new PublitioAPI(apiKey, apiSecret);

/**
 * Constructs full URL from PUBLITIO_BRANDED_DOMAIN + path
 */
export function buildBrandedUrl(publitioPath: string): string {
  // Ensure the path doesn't start with a slash if the domain ends with one, or vice-versa
  const cleanDomain = brandedDomain.endsWith('/') ? brandedDomain.slice(0, -1) : brandedDomain;
  const cleanPath = publitioPath.startsWith('/') ? publitioPath : `/${publitioPath}`;
  return `${cleanDomain}${cleanPath}`;
}
