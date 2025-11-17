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
 * Makes an HTTP request to a target URL
 */
export async function makeHttpRequest(
  url: string,
  options: HttpRequestOptions = {}
): Promise<HttpResponse> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = config.http.timeout,
    followRedirects = true,
    maxRedirects = config.http.maxRedirects,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'User-Agent': config.http.userAgent,
        ...headers,
      },
      body,
      signal: controller.signal,
      redirect: followRedirects ? 'follow' : 'manual',
    });

    clearTimeout(timeoutId);

    // Extract headers as a plain object
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key.toLowerCase()] = value;
    });

    const responseBody = await response.text();

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

    if (error.name === 'AbortError') {
      throw new HttpRequestError(`Request timed out after ${timeout}ms`);
    }

    throw new HttpRequestError(
      error.message || 'HTTP request failed',
      undefined,
      undefined
    );
  }
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
