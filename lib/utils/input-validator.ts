/**
 * Input validation and sanitization utilities for security scanning
 */

import { config } from '../config/env.config';

/**
 * Validates if a string is a valid IPv4 address
 */
export function isValidIPv4(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = ip.match(ipv4Regex);
  
  if (!match) return false;
  
  // Check each octet is between 0-255
  for (let i = 1; i <= 4; i++) {
    const octet = parseInt(match[i], 10);
    if (octet < 0 || octet > 255) return false;
  }
  
  return true;
}

/**
 * Validates if a string is a valid IPv6 address
 */
export function isValidIPv6(ip: string): boolean {
  const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
  return ipv6Regex.test(ip);
}

/**
 * Validates if a string is a valid IP address (IPv4 or IPv6)
 */
export function isValidIP(ip: string): boolean {
  return isValidIPv4(ip) || isValidIPv6(ip);
}

/**
 * Validates if a string is a valid domain name
 */
export function isValidDomain(domain: string): boolean {
  // Remove protocol if present
  const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
  
  // Domain regex: allows letters, numbers, hyphens, and dots
  const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)*[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?$/;
  
  return domainRegex.test(cleanDomain) && cleanDomain.length <= 253;
}

/**
 * Validates if a string is a valid URL
 */
export function isValidURL(url: string): boolean {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Checks if an IP address is in a private range
 */
export function isPrivateIP(ip: string): boolean {
  if (!isValidIPv4(ip)) {
    // For simplicity, only check IPv4 private ranges
    return false;
  }
  
  const parts = ip.split('.').map(Number);
  
  // 10.0.0.0/8
  if (parts[0] === 10) return true;
  
  // 172.16.0.0/12
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  
  // 192.168.0.0/16
  if (parts[0] === 192 && parts[1] === 168) return true;
  
  // 127.0.0.0/8 (localhost)
  if (parts[0] === 127) return true;
  
  // 169.254.0.0/16 (link-local)
  if (parts[0] === 169 && parts[1] === 254) return true;
  
  return false;
}

/**
 * Sanitizes input to prevent command injection
 * Removes or escapes dangerous characters while preserving valid URL characters
 */
export function sanitizeInput(input: string): string {
  // Remove dangerous shell characters that could be used for command injection
  // Keep alphanumeric, dots, hyphens, underscores, colons, forward slashes, 
  // question marks, equals, ampersands, and percent signs (for URLs)
  // Remove: semicolons, pipes, backticks, dollar signs, parentheses, etc.
  return input.replace(/[;|`$(){}[\]<>&!\\'"]/g, '');
}

/**
 * Validates and sanitizes a target for scanning
 * Returns sanitized target or throws error
 */
export function validateAndSanitizeTarget(
  target: string,
  type: 'ip' | 'domain' | 'url',
  allowPrivate: boolean = false
): string {
  if (!target || typeof target !== 'string') {
    throw new Error('Target must be a non-empty string');
  }
  
  const trimmedTarget = target.trim();
  
  if (trimmedTarget.length === 0) {
    throw new Error('Target cannot be empty');
  }
  
  // Validate based on type
  switch (type) {
    case 'ip':
      if (!isValidIP(trimmedTarget)) {
        throw new Error('Invalid IP address format');
      }
      // Check against configuration setting
      const allowPrivateFromConfig = config.security.allowPrivateIpScan;
      if (!allowPrivate && !allowPrivateFromConfig && isPrivateIP(trimmedTarget)) {
        throw new Error('Scanning private IP addresses is not allowed');
      }
      break;
      
    case 'domain':
      if (!isValidDomain(trimmedTarget)) {
        throw new Error('Invalid domain name format');
      }
      break;
      
    case 'url':
      if (!isValidURL(trimmedTarget)) {
        throw new Error('Invalid URL format. Must start with http:// or https://');
      }
      break;
      
    default:
      throw new Error('Invalid validation type');
  }
  
  // Sanitize the input
  return sanitizeInput(trimmedTarget);
}

/**
 * Validates scan options
 */
export function validateScanOptions(options: any): void {
  if (options && typeof options !== 'object') {
    throw new Error('Options must be an object');
  }
  
  if (options?.timeout) {
    const timeout = Number(options.timeout);
    if (isNaN(timeout) || timeout < 1000 || timeout > 300000) {
      throw new Error('Timeout must be between 1000ms and 300000ms');
    }
  }
}
