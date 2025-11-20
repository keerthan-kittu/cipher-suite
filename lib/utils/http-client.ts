/**
 * HTTP client utility for making requests to target URLs
 */

import { config } from '../config/env.config';

/**
 * HTTP response data
 */
export interface HttpResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  redirected: boolean;
  url: string;
}

/**
 * Options for HTTP requests
 */
export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'HEAD';
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
  followRedirects?: boolean;
  maxRedirects?: number;
}

/**
 * Error thrown when HTTP request fails
 */
export class HttpRequestError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: HttpResponse
  ) {
    super(message);
    this.name = 'HttpRequestError';
  }
}

/**
 * Makes an HTTP request to a target URL with retry logic and comprehensive error handling
 */
export async function makeHttpRequest(
  url: string,
  options: HttpRequestOptions = {}
): Promise<HttpResponse> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = 30000, // Increased to 30 seconds for better reliability
    followRedirects = true,
    maxRedirects = config.http.maxRedirects,
  } = options;

  const maxRetries = 3; // Increased retries
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      console.log(`[HTTP Client] Attempt ${attempt + 1}/${maxRetries + 1} for ${url}`);
      
      const response = await fetch(url, {
        method,
        headers: {
          'User-Agent': config.http.userAgent,
          'Accept': '*/*',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
          ...headers,
        },
        body,
        signal: controller.signal,
        redirect: followRedirects ? 'follow' : 'manual',
        // @ts-ignore - Next.js specific options
        cache: 'no-store',
        // @ts-ignore - Additional fetch options for better compatibility
        keepalive: true,
      });

      clearTimeout(timeoutId);

      console.log(`[HTTP Client] Success: ${response.status} ${response.statusText}`);

      // Extract headers as a plain object
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key.toLowerCase()] = value;
      });

      // Handle response body with timeout
      const bodyController = new AbortController();
      const bodyTimeoutId = setTimeout(() => bodyController.abort(), 15000);
      
      let responseBody = '';
      try {
        responseBody = await response.text();
        clearTimeout(bodyTimeoutId);
      } catch (bodyError) {
        clearTimeout(bodyTimeoutId);
        console.warn('[HTTP Client] Failed to read response body, using empty string');
        responseBody = '';
      }

      return {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseBody,
        redirected: response.redirected,
        url: response.url,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      lastError = error;

      console.error(`[HTTP Client] Attempt ${attempt + 1} failed:`, error.message);

      // Don't retry on abort errors (timeout)
      if (error.name === 'AbortError') {
        if (attempt < maxRetries) {
          console.log(`[HTTP Client] Timeout, retrying in ${(attempt + 1) * 2}s...`);
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2000));
          continue;
        }
        throw new HttpRequestError(`Request timed out after ${timeout}ms. Target may be slow or blocking requests.`);
      }

      // Parse error details
      const errorCode = error.cause?.code || error.code || '';
      const errorMessage = error.message || '';

      // Don't retry on certain errors
      if (errorCode === 'ENOTFOUND' || errorMessage.includes('getaddrinfo')) {
        throw new HttpRequestError('DNS lookup failed - domain name could not be resolved. Verify the domain is correct.');
      }

      if (errorCode === 'ECONNREFUSED') {
        throw new HttpRequestError('Connection refused - target server is not accepting connections on this port.');
      }

      if (errorCode.includes('CERT') || errorCode.includes('SSL') || errorMessage.includes('certificate')) {
        // Try HTTP if HTTPS fails
        if (url.startsWith('https://') && attempt === 0) {
          console.log('[HTTP Client] SSL error, will try HTTP on next attempt');
          await new Promise(resolve => setTimeout(resolve, 1000));
          continue;
        }
        throw new HttpRequestError('SSL/TLS certificate error. Try using http:// instead of https://');
      }

      // Retry on network errors
      if (attempt < maxRetries) {
        const delay = (attempt + 1) * 2000; // Exponential backoff: 2s, 4s, 6s
        console.log(`[HTTP Client] Network error, retrying in ${delay/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  // All retries failed
  let errorMessage = 'HTTP request failed after multiple attempts';
  if (lastError) {
    const errorCode = lastError.cause?.code || lastError.code || '';
    const errorMsg = lastError.message || '';
    
    if (errorCode.includes('TIMEOUT') || errorMsg.includes('timeout')) {
      errorMessage = 'Connection timeout - target is unreachable, too slow, or blocking automated requests';
    } else if (errorCode === 'ENOTFOUND' || errorMsg.includes('getaddrinfo')) {
      errorMessage = 'DNS lookup failed - domain name could not be resolved';
    } else if (errorCode === 'ECONNREFUSED') {
      errorMessage = 'Connection refused - target is not accepting connections';
    } else if (errorCode.includes('CERT') || errorCode.includes('SSL') || errorMsg.includes('certificate')) {
      errorMessage = 'SSL/TLS certificate error - invalid or expired certificate';
    } else if (errorMsg.includes('CORS') || errorMsg.includes('blocked')) {
      errorMessage = 'Request blocked by CORS policy or firewall';
    } else if (errorMsg) {
      errorMessage = `${errorMessage}: ${errorMsg}`;
    }
  }

  throw new HttpRequestError(errorMessage, undefined, undefined);
}

/**
 * Extracts security-relevant headers from an HTTP response
 */
export function extractSecurityHeaders(headers: Record<string, string>): Record<string, string> {
  const securityHeaderKeys = [
    'x-frame-options',
    'x-content-type-options',
    'x-xss-protection',
    'strict-transport-security',
    'content-security-policy',
    'referrer-policy',
    'permissions-policy',
    'x-powered-by',
    'server',
  ];

  const securityHeaders: Record<string, string> = {};

  for (const key of securityHeaderKeys) {
    if (headers[key]) {
      securityHeaders[key] = headers[key];
    }
  }

  return securityHeaders;
}

/**
 * Detects technologies from HTTP headers and response body
 */
export function detectTechnologies(response: HttpResponse): string[] {
  const technologies: Set<string> = new Set();

  // Check Server header
  if (response.headers['server']) {
    const server = response.headers['server'].toLowerCase();
    if (server.includes('nginx')) technologies.add('Nginx');
    if (server.includes('apache')) technologies.add('Apache');
    if (server.includes('iis')) technologies.add('IIS');
    if (server.includes('cloudflare')) technologies.add('Cloudflare');
  }

  // Check X-Powered-By header
  if (response.headers['x-powered-by']) {
    const poweredBy = response.headers['x-powered-by'];
    technologies.add(poweredBy);
  }

  // Check response body for common patterns
  const body = response.body.toLowerCase();

  if (body.includes('wp-content') || body.includes('wordpress')) {
    technologies.add('WordPress');
  }
  if (body.includes('drupal')) {
    technologies.add('Drupal');
  }
  if (body.includes('joomla')) {
    technologies.add('Joomla');
  }
  if (body.includes('react')) {
    technologies.add('React');
  }
  if (body.includes('vue')) {
    technologies.add('Vue.js');
  }
  if (body.includes('angular')) {
    technologies.add('Angular');
  }
  if (body.includes('next.js') || body.includes('__next')) {
    technologies.add('Next.js');
  }
  if (body.includes('jquery')) {
    technologies.add('jQuery');
  }

  return Array.from(technologies);
}

/**
 * Checks if a URL is reachable
 */
export async function isUrlReachable(url: string, timeout: number = 10000): Promise<boolean> {
  try {
    await makeHttpRequest(url, { method: 'HEAD', timeout });
    return true;
  } catch {
    return false;
  }
}

/**
 * Extracts all headers from a response
 */
export function getAllHeaders(response: HttpResponse): Record<string, string> {
  return { ...response.headers };
}
