const MAX_CACHE_SIZE = 20;
const FETCH_TIMEOUT_MS = 5_000;
const cache = new Map<string, string>();
const SUPPORTED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/svg+xml']);

function detectMimeType(url: string, contentType?: string, buffer?: Buffer): string | null {
  if (buffer && buffer.length >= 4) {
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return 'image/png';
    if (buffer[0] === 0xff && buffer[1] === 0xd8) return 'image/jpeg';
    if (buffer[0] === 0x3c || (buffer[0] === 0xef && buffer[1] === 0xbb)) return 'image/svg+xml';
  }
  if (contentType?.includes('png')) return 'image/png';
  if (contentType?.includes('jpeg') || contentType?.includes('jpg')) return 'image/jpeg';
  if (contentType?.includes('svg')) return 'image/svg+xml';
  const ext = url.split('.').pop()?.toLowerCase().split('?')[0];
  if (ext === 'png') return 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
  if (ext === 'svg') return 'image/svg+xml';
  return null;
}

export async function fetchLogoAsDataUri(url: string): Promise<string | null> {
  if (!url) return null;
  const cached = cache.get(url);
  if (cached) return cached;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!response.ok) { console.warn(`Logo fetch failed: ${response.status} for ${url}`); return null; }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mime = detectMimeType(url, response.headers.get('content-type') ?? undefined, buffer);
    if (!mime || !SUPPORTED_MIME_TYPES.has(mime)) { console.warn(`Unsupported image format for ${url}`); return null; }
    const dataUri = `data:${mime};base64,${buffer.toString('base64')}`;
    if (cache.size >= MAX_CACHE_SIZE) {
      const first = cache.keys().next();
      if (!first.done) cache.delete(first.value);
    }
    cache.set(url, dataUri);
    return dataUri;
  } catch (err) {
    console.warn(`Logo fetch error for ${url}: ${(err as Error).message}`);
    return null;
  }
}
