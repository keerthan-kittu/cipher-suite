/**
 * Environment Configuration
 * Centralized configuration management for all environment variables
 */

export const config = {
  // API Configuration
  api: {
    url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  },

  // Command Execution
  command: {
    timeout: parseInt(process.env.COMMAND_TIMEOUT || '120000', 10),
    maxBuffer: parseInt(process.env.COMMAND_MAX_BUFFER || '10485760', 10),
  },

  // HTTP Client
  http: {
    timeout: parseInt(process.env.HTTP_REQUEST_TIMEOUT || '30000', 10),
    maxRedirects: parseInt(process.env.HTTP_MAX_REDIRECTS || '5', 10),
    userAgent: process.env.HTTP_USER_AGENT || 'SecurityTools/1.0',
  },

  // Scan Delays (for simulation mode)
  scanDelays: {
    nmap: {
      quick: parseInt(process.env.NMAP_QUICK_SCAN_DELAY || '3000', 10),
      full: parseInt(process.env.NMAP_FULL_SCAN_DELAY || '8000', 10),
      stealth: parseInt(process.env.NMAP_STEALTH_SCAN_DELAY || '5000', 10),
      aggressive: parseInt(process.env.NMAP_AGGRESSIVE_SCAN_DELAY || '6000', 10),
    },
    redhawk: parseInt(process.env.REDHAWK_SCAN_DELAY || '5000', 10),
    honeypot: parseInt(process.env.HONEYPOT_SCAN_DELAY || '4000', 10),
    vulnercipher: parseInt(process.env.VULNERCIPHER_SCAN_DELAY || '2000', 10),
  },

  // PDF Generation
  pdf: {
    timeout: parseInt(process.env.PDF_GENERATION_TIMEOUT || '30000', 10),
  },

  // Security Settings
  security: {
    allowPrivateIpScan: process.env.ALLOW_PRIVATE_IP_SCAN === 'true',
    enableRealNmap: process.env.ENABLE_REAL_NMAP === 'true',
    enableRealRedhawk: process.env.ENABLE_REAL_REDHAWK === 'true',
    enableRealHoneypot: process.env.ENABLE_REAL_HONEYPOT === 'true',
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    enableDebug: process.env.ENABLE_DEBUG_LOGGING === 'true',
  },

  // Rate Limiting (optional)
  rateLimit: {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
  },

  // CORS (optional)
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [],
  },

  // Database (optional)
  database: {
    url: process.env.DATABASE_URL,
    poolSize: parseInt(process.env.DATABASE_POOL_SIZE || '10', 10),
  },

  // Redis (optional)
  redis: {
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD,
  },

  // Authentication (optional)
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    sessionSecret: process.env.SESSION_SECRET,
    apiKey: process.env.API_KEY,
  },

  // External Services (optional)
  externalServices: {
    shodanApiKey: process.env.SHODAN_API_KEY,
    virusTotalApiKey: process.env.VIRUSTOTAL_API_KEY,
    censysApiId: process.env.CENSYS_API_ID,
    censysApiSecret: process.env.CENSYS_API_SECRET,
  },
} as const;

/**
 * Validates required environment variables
 */
export function validateConfig(): void {
  const errors: string[] = [];

  // Add validation for required variables in production
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.NEXT_PUBLIC_API_URL) {
      errors.push('NEXT_PUBLIC_API_URL is required in production');
    }

    // Add more production validations as needed
  }

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`);
  }
}

/**
 * Gets a configuration value with type safety
 */
export function getConfig<T extends keyof typeof config>(key: T): typeof config[T] {
  return config[key];
}
