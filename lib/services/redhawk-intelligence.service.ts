/**
 * RedHawk Intelligence Service
 * Comprehensive information gathering and reconnaissance
 */

import { WhoisService } from './whois.service';
import { DnsService } from './dns.service';
import { makeHttpRequest, detectTechnologies, extractSecurityHeaders } from '../utils/http-client';

export interface RedhawkIntelligence {
  domain: string;
  ip: string;
  whois: any;
  dns: any;
  technologies: string[];
  headers: Record<string, string>;
  subdomains: string[];
  ports: PortInfo[];
  ssl: SSLInfo;
  geolocation: GeolocationInfo;
  emailAddresses: string[];
  socialMedia: SocialMediaLinks;
  cms: CMSInfo;
  serverInfo: ServerInfo;
  performance: PerformanceMetrics;
  apiKeys: APIKeyInfo[];
  securityIssues: SecurityIssue[];
  metadata: MetadataInfo;
  jsLibraries: string[];
  analytics: AnalyticsInfo[];
  cdn: CDNInfo;
  robots: RobotsInfo;
  sitemap: SitemapInfo;
  confidentialData: ConfidentialDataInfo[];
}

export interface PortInfo {
  port: number;
  service: string;
  status: 'open' | 'closed' | 'filtered';
}

export interface SSLInfo {
  issuer?: string;
  validFrom?: string;
  validTo?: string;
  daysRemaining?: number;
  protocol?: string;
  cipher?: string;
}

export interface GeolocationInfo {
  country?: string;
  region?: string;
  city?: string;
  isp?: string;
  asn?: string;
  timezone?: string;
}

export interface SocialMediaLinks {
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  youtube?: string;
  github?: string;
}

export interface CMSInfo {
  name?: string;
  version?: string;
  plugins?: string[];
  themes?: string[];
}

export interface ServerInfo {
  server?: string;
  poweredBy?: string;
  framework?: string;
  language?: string;
  os?: string;
}

export interface PerformanceMetrics {
  responseTime: number;
  pageSize: number;
  loadTime: number;
}

export interface APIKeyInfo {
  type: string;
  key: string;
  status: 'exposed' | 'protected' | 'unknown';
  location: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface SecurityIssue {
  type: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface MetadataInfo {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  generator?: string;
  viewport?: string;
  charset?: string;
  language?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export interface AnalyticsInfo {
  type: string;
  id: string;
}

export interface CDNInfo {
  provider?: string;
  detected: boolean;
  resources: string[];
}

export interface RobotsInfo {
  exists: boolean;
  disallowedPaths: string[];
  allowedPaths: string[];
  sitemaps: string[];
}

export interface SitemapInfo {
  exists: boolean;
  urls: number;
  lastModified?: string;
}

export interface ConfidentialDataInfo {
  type: string;
  category: 'PII' | 'Financial' | 'Health' | 'Credentials' | 'Business' | 'Legal';
  pattern: string;
  count: number;
  status: 'exposed' | 'protected' | 'encrypted' | 'unknown';
  severity: 'critical' | 'high' | 'medium' | 'low';
  samples: string[];
  location: string;
  recommendation: string;
}

export class RedhawkIntelligenceService {
  private whoisService: WhoisService;
  private dnsService: DnsService;

  constructor() {
    this.whoisService = new WhoisService();
    this.dnsService = new DnsService();
  }

  /**
   * Performs comprehensive intelligence gathering
   */
  async gather(domain: string): Promise<RedhawkIntelligence> {
    const cleanDomain = domain.replace(/^https?:\/\//, '').split('/')[0];
    
    // Parallel execution for speed
    const [whoisData, dnsRecords, httpData, subdomains, geolocation] = await Promise.allSettled([
      this.whoisService.lookup(cleanDomain),
      this.dnsService.lookup(cleanDomain),
      this.gatherHttpIntelligence(cleanDomain),
      this.discoverSubdomains(cleanDomain),
      this.getGeolocation(cleanDomain),
    ]);

    const whois = whoisData.status === 'fulfilled' ? whoisData.value : {};
    const dns = dnsRecords.status === 'fulfilled' ? dnsRecords.value : {};
    const http = httpData.status === 'fulfilled' ? httpData.value : this.getDefaultHttpData();
    const discoveredSubdomains = subdomains.status === 'fulfilled' ? subdomains.value : [];
    const geo = geolocation.status === 'fulfilled' ? geolocation.value : {};

    // Log what was gathered
    console.log('Intelligence gathering results:', {
      whoisSuccess: whoisData.status === 'fulfilled',
      dnsSuccess: dnsRecords.status === 'fulfilled',
      httpSuccess: httpData.status === 'fulfilled',
      subdomainsSuccess: subdomains.status === 'fulfilled',
      geolocationSuccess: geolocation.status === 'fulfilled',
      httpDataKeys: Object.keys(http),
      geoKeys: Object.keys(geo),
    });

    if (httpData.status === 'rejected') {
      console.error('HTTP data gathering failed:', httpData.reason);
    }
    if (geolocation.status === 'rejected') {
      console.error('Geolocation failed:', geolocation.reason);
    }

    return {
      domain: cleanDomain,
      ip: dns.A?.[0] || 'Unknown',
      whois: {
        registrar: whois.registrar || 'Not Available',
        createdDate: whois.createdDate || 'Not Available',
        expiryDate: whois.expiryDate || 'Not Available',
        updatedDate: whois.updatedDate || 'Not Available',
        nameServers: whois.nameServers || dns.NS || [],
        status: whois.status || [],
        registrantOrganization: whois.registrantOrganization,
        registrantCountry: whois.registrantCountry,
      },
      dns: {
        A: dns.A || [],
        AAAA: dns.AAAA || [],
        MX: dns.MX || [],
        NS: dns.NS || [],
        TXT: dns.TXT || [],
        CNAME: dns.CNAME,
      },
      technologies: http.technologies,
      headers: http.headers,
      subdomains: discoveredSubdomains,
      ports: http.ports,
      ssl: http.ssl,
      geolocation: geo,
      emailAddresses: http.emailAddresses,
      socialMedia: http.socialMedia,
      cms: http.cms,
      serverInfo: http.serverInfo,
      performance: http.performance,
      apiKeys: http.apiKeys,
      securityIssues: http.securityIssues,
      metadata: http.metadata,
      jsLibraries: http.jsLibraries,
      analytics: http.analytics,
      cdn: http.cdn,
      robots: http.robots,
      sitemap: http.sitemap,
      confidentialData: http.confidentialData,
    };
  }

  /**
   * Gathers HTTP-based intelligence
   */
  private async gatherHttpIntelligence(domain: string) {
    const startTime = Date.now();
    
    try {
      // Try HTTPS first, fallback to HTTP
      let response;
      let protocol = 'https';
      
      try {
        response = await makeHttpRequest(`https://${domain}`, { timeout: 15000 });
      } catch (httpsError) {
        console.log('HTTPS failed, trying HTTP:', httpsError instanceof Error ? httpsError.message : 'Unknown error');
        try {
          protocol = 'http';
          response = await makeHttpRequest(`http://${domain}`, { timeout: 15000 });
        } catch (httpError) {
          console.error('Both HTTPS and HTTP failed:', httpError instanceof Error ? httpError.message : 'Unknown error');
          throw new Error('Unable to connect to target via HTTP or HTTPS');
        }
      }

      // Ensure response exists
      if (!response || !response.body) {
        throw new Error('No response received from target');
      }

      const loadTime = Date.now() - startTime;
      const technologies = detectTechnologies(response);
      const headers = extractSecurityHeaders(response.headers);
      const allHeaders = response.headers;

      // Extract server information
      const serverInfo = this.extractServerInfo(allHeaders, response.body);
      
      // Detect CMS
      const cms = this.detectCMS(response.body, allHeaders);
      
      // Extract email addresses
      const emailAddresses = this.extractEmails(response.body);
      
      // Extract social media links
      const socialMedia = this.extractSocialMedia(response.body);
      
      // Detect API keys and secrets
      const apiKeys = this.detectAPIKeys(response.body);
      
      // Detect security issues
      const securityIssues = this.detectSecurityIssues(response.body, allHeaders);
      
      // Extract metadata
      const metadata = this.extractMetadata(response.body);
      
      // Detect JavaScript libraries
      const jsLibraries = this.detectJSLibraries(response.body);
      
      // Detect analytics
      const analytics = this.detectAnalytics(response.body);
      
      // Detect CDN
      const cdn = this.detectCDN(response.body, allHeaders);
      
      // Check robots.txt
      const robots = await this.checkRobotsTxt(domain, protocol);
      
      // Check sitemap
      const sitemap = await this.checkSitemap(domain, protocol);
      
      // Detect confidential information
      const confidentialData = this.detectConfidentialData(response.body, allHeaders);
      
      // Detect common ports (limited in browser/Node.js)
      const ports = await this.detectCommonPorts(domain, protocol);
      
      // Extract SSL information
      const ssl = await this.getSSLInfo(domain, protocol);

      const httpData = {
        technologies,
        headers,
        ports,
        ssl,
        emailAddresses,
        socialMedia,
        cms,
        serverInfo,
        performance: {
          responseTime: loadTime,
          pageSize: response.body.length,
          loadTime,
        },
        apiKeys,
        securityIssues,
        metadata,
        jsLibraries,
        analytics,
        cdn,
        robots,
        sitemap,
        confidentialData,
      };

      console.log('HTTP Intelligence gathered:', {
        technologiesCount: technologies.length,
        headersCount: Object.keys(headers).length,
        portsCount: ports.length,
        emailsCount: emailAddresses.length,
        socialMediaCount: Object.keys(socialMedia).length,
        hasCMS: !!cms.name,
        hasServerInfo: Object.keys(serverInfo).length > 0,
      });

      return httpData;
    } catch (error) {
      console.error('HTTP intelligence gathering error:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
      return this.getDefaultHttpData();
    }
  }

  /**
   * Extracts server information from headers and body
   */
  private extractServerInfo(headers: Record<string, string>, body: string): ServerInfo {
    const info: ServerInfo = {};

    // Server header
    if (headers['server']) {
      info.server = headers['server'];
      
      // Detect OS from server header
      const serverLower = headers['server'].toLowerCase();
      if (serverLower.includes('ubuntu') || serverLower.includes('debian')) {
        info.os = 'Linux';
      } else if (serverLower.includes('windows') || serverLower.includes('iis')) {
        info.os = 'Windows';
      } else if (serverLower.includes('centos') || serverLower.includes('red hat')) {
        info.os = 'Linux';
      }
    }

    // X-Powered-By header
    if (headers['x-powered-by']) {
      info.poweredBy = headers['x-powered-by'];
      
      // Detect language
      const poweredBy = headers['x-powered-by'].toLowerCase();
      if (poweredBy.includes('php')) {
        info.language = 'PHP';
      } else if (poweredBy.includes('asp.net')) {
        info.language = 'ASP.NET';
      }
    }

    // Detect framework from body
    const bodyLower = body.toLowerCase();
    if (bodyLower.includes('next.js') || bodyLower.includes('__next')) {
      info.framework = 'Next.js';
      info.language = 'JavaScript';
    } else if (bodyLower.includes('react')) {
      info.framework = 'React';
      info.language = 'JavaScript';
    } else if (bodyLower.includes('vue')) {
      info.framework = 'Vue.js';
      info.language = 'JavaScript';
    } else if (bodyLower.includes('angular')) {
      info.framework = 'Angular';
      info.language = 'TypeScript';
    } else if (bodyLower.includes('django')) {
      info.framework = 'Django';
      info.language = 'Python';
    } else if (bodyLower.includes('laravel')) {
      info.framework = 'Laravel';
      info.language = 'PHP';
    }

    return info;
  }

  /**
   * Detects CMS and its details
   */
  private detectCMS(body: string, headers: Record<string, string>): CMSInfo {
    const cms: CMSInfo = {};
    const bodyLower = body.toLowerCase();

    // WordPress
    if (bodyLower.includes('wp-content') || bodyLower.includes('wordpress')) {
      cms.name = 'WordPress';
      
      // Try to extract version
      const versionMatch = body.match(/wordpress\s+(\d+\.\d+\.?\d*)/i);
      if (versionMatch) {
        cms.version = versionMatch[1];
      }
      
      // Extract plugins
      const pluginMatches = body.match(/wp-content\/plugins\/([^\/'"]+)/g);
      if (pluginMatches) {
        cms.plugins = [...new Set(pluginMatches.map(m => m.split('/')[2]))];
      }
      
      // Extract themes
      const themeMatches = body.match(/wp-content\/themes\/([^\/'"]+)/g);
      if (themeMatches) {
        cms.themes = [...new Set(themeMatches.map(m => m.split('/')[2]))];
      }
    }
    
    // Drupal
    else if (bodyLower.includes('drupal') || headers['x-generator']?.includes('Drupal')) {
      cms.name = 'Drupal';
      const versionMatch = body.match(/drupal\s+(\d+\.\d+\.?\d*)/i);
      if (versionMatch) {
        cms.version = versionMatch[1];
      }
    }
    
    // Joomla
    else if (bodyLower.includes('joomla')) {
      cms.name = 'Joomla';
      const versionMatch = body.match(/joomla!\s+(\d+\.\d+\.?\d*)/i);
      if (versionMatch) {
        cms.version = versionMatch[1];
      }
    }
    
    // Shopify
    else if (bodyLower.includes('shopify') || bodyLower.includes('cdn.shopify.com')) {
      cms.name = 'Shopify';
    }
    
    // Wix
    else if (bodyLower.includes('wix.com') || bodyLower.includes('_wix')) {
      cms.name = 'Wix';
    }
    
    // Squarespace
    else if (bodyLower.includes('squarespace')) {
      cms.name = 'Squarespace';
    }

    return cms;
  }

  /**
   * Extracts email addresses from page content
   */
  private extractEmails(body: string): string[] {
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const emails = body.match(emailRegex) || [];
    
    // Filter out common false positives
    const filtered = emails.filter(email => 
      !email.includes('example.com') &&
      !email.includes('test.com') &&
      !email.includes('placeholder')
    );
    
    return [...new Set(filtered)].slice(0, 10); // Limit to 10 unique emails
  }

  /**
   * Extracts social media links
   */
  private extractSocialMedia(body: string): SocialMediaLinks {
    const links: SocialMediaLinks = {};

    // Facebook
    const fbMatch = body.match(/(?:https?:\/\/)?(?:www\.)?facebook\.com\/([a-zA-Z0-9._-]+)/i);
    if (fbMatch) links.facebook = `https://facebook.com/${fbMatch[1]}`;

    // Twitter/X
    const twitterMatch = body.match(/(?:https?:\/\/)?(?:www\.)?(?:twitter|x)\.com\/([a-zA-Z0-9_]+)/i);
    if (twitterMatch) links.twitter = `https://twitter.com/${twitterMatch[1]}`;

    // LinkedIn
    const linkedinMatch = body.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:company|in)\/([a-zA-Z0-9_-]+)/i);
    if (linkedinMatch) links.linkedin = `https://linkedin.com/company/${linkedinMatch[1]}`;

    // Instagram
    const instaMatch = body.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)/i);
    if (instaMatch) links.instagram = `https://instagram.com/${instaMatch[1]}`;

    // YouTube
    const youtubeMatch = body.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:c|channel|user)\/([a-zA-Z0-9_-]+)/i);
    if (youtubeMatch) links.youtube = `https://youtube.com/${youtubeMatch[1]}`;

    // GitHub
    const githubMatch = body.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
    if (githubMatch) links.github = `https://github.com/${githubMatch[1]}`;

    return links;
  }

  /**
   * Detects common open ports
   */
  private async detectCommonPorts(domain: string, protocol: string): Promise<PortInfo[]> {
    const ports: PortInfo[] = [];

    // HTTP/HTTPS
    if (protocol === 'https') {
      ports.push({ port: 443, service: 'HTTPS', status: 'open' });
    } else {
      ports.push({ port: 80, service: 'HTTP', status: 'open' });
    }

    // Try to detect other common ports (limited in browser/Node.js)
    // In production, you'd use actual port scanning tools
    const commonPorts = [
      { port: 21, service: 'FTP' },
      { port: 22, service: 'SSH' },
      { port: 25, service: 'SMTP' },
      { port: 3306, service: 'MySQL' },
      { port: 5432, service: 'PostgreSQL' },
      { port: 8080, service: 'HTTP-Alt' },
    ];

    // Note: Actual port scanning requires system-level tools
    // This is a placeholder for demonstration
    return ports;
  }

  /**
   * Gets SSL certificate information
   */
  private async getSSLInfo(domain: string, protocol: string): Promise<SSLInfo> {
    if (protocol !== 'https') {
      return {};
    }

    // Note: Detailed SSL info requires system-level tools or APIs
    // This is a basic implementation
    try {
      const response = await makeHttpRequest(`https://${domain}`, { 
        method: 'HEAD',
        timeout: 10000 
      });

      // Basic SSL detection
      return {
        protocol: 'TLS 1.2+',
        // In production, use tools like ssllabs API or testssl.sh
      };
    } catch {
      return {};
    }
  }

  /**
   * Gets geolocation information for IP
   */
  private async getGeolocation(domain: string): Promise<GeolocationInfo> {
    try {
      // Get IP first
      const ips = await this.dnsService.resolveHostname(domain);
      if (ips.length === 0) return {};

      const ip = ips[0];

      // Use free IP geolocation API
      const response = await makeHttpRequest(`http://ip-api.com/json/${ip}`, {
        timeout: 10000,
      });

      const data = JSON.parse(response.body);

      // Check if API returned success
      if (data.status === 'fail') {
        console.error('Geolocation API error:', data.message);
        return {};
      }

      const geoData = {
        country: data.country || undefined,
        region: data.regionName || undefined,
        city: data.city || undefined,
        isp: data.isp || undefined,
        asn: data.as || undefined,
        timezone: data.timezone || undefined,
      };

      console.log('Geolocation data retrieved:', geoData);
      return geoData;
    } catch (error) {
      console.error('Geolocation lookup error:', error instanceof Error ? error.message : 'Unknown error');
      return {};
    }
  }

  /**
   * Discovers subdomains
   */
  private async discoverSubdomains(domain: string): Promise<string[]> {
    const commonSubdomains = [
      'www', 'mail', 'ftp', 'blog', 'shop', 'api', 'cdn', 'app', 
      'dev', 'staging', 'test', 'admin', 'portal', 'dashboard',
      'mobile', 'support', 'help', 'docs', 'status', 'beta'
    ];
    
    const discovered: string[] = [];

    // Check common subdomains in parallel
    const checks = commonSubdomains.map(async (sub) => {
      const subdomain = `${sub}.${domain}`;
      try {
        const ips = await this.dnsService.resolveHostname(subdomain);
        if (ips.length > 0) {
          return subdomain;
        }
      } catch {
        // Subdomain doesn't exist
      }
      return null;
    });

    const results = await Promise.all(checks);
    
    results.forEach(result => {
      if (result) discovered.push(result);
    });

    return discovered;
  }

  /**
   * Returns default HTTP data structure
   */
  private getDefaultHttpData() {
    return {
      technologies: [],
      headers: {},
      ports: [],
      ssl: {},
      emailAddresses: [],
      socialMedia: {},
      cms: {},
      serverInfo: {},
      performance: {
        responseTime: 0,
        pageSize: 0,
        loadTime: 0,
      },
      apiKeys: [],
      securityIssues: [],
      metadata: {},
      jsLibraries: [],
      analytics: [],
      cdn: { detected: false, resources: [] },
      robots: { exists: false, disallowedPaths: [], allowedPaths: [], sitemaps: [] },
      sitemap: { exists: false, urls: 0 },
      confidentialData: [],
    };
  }

  /**
   * Detects exposed API keys and secrets
   */
  private detectAPIKeys(body: string): APIKeyInfo[] {
    const apiKeys: APIKeyInfo[] = [];
    const patterns = [
      { type: 'Google API Key', regex: /AIza[0-9A-Za-z\\-_]{35}/g, severity: 'critical' as const },
      { type: 'AWS Access Key', regex: /AKIA[0-9A-Z]{16}/g, severity: 'critical' as const },
      { type: 'GitHub Token', regex: /ghp_[a-zA-Z0-9]{36}/g, severity: 'critical' as const },
      { type: 'Stripe API Key', regex: /sk_live_[0-9a-zA-Z]{24}/g, severity: 'critical' as const },
      { type: 'Stripe Publishable Key', regex: /pk_live_[0-9a-zA-Z]{24}/g, severity: 'medium' as const },
      { type: 'Firebase API Key', regex: /firebase[_-]?api[_-]?key["']?\s*[:=]\s*["']([^"']+)/gi, severity: 'high' as const },
      { type: 'Mapbox Token', regex: /pk\.[a-zA-Z0-9]{60,}/g, severity: 'medium' as const },
      { type: 'SendGrid API Key', regex: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/g, severity: 'critical' as const },
      { type: 'Twilio API Key', regex: /SK[a-z0-9]{32}/g, severity: 'critical' as const },
    ];

    for (const pattern of patterns) {
      const matches = body.match(pattern.regex);
      if (matches) {
        matches.forEach(key => {
          // Check if key appears to be in a comment or documentation
          const isProtected = this.isKeyProtected(body, key);
          apiKeys.push({
            type: pattern.type,
            key: key.substring(0, 20) + '...' + key.substring(key.length - 4), // Mask the key
            status: isProtected ? 'protected' : 'exposed',
            location: 'HTML/JavaScript',
            severity: pattern.severity,
          });
        });
      }
    }

    return apiKeys.slice(0, 10); // Limit to 10 keys
  }

  /**
   * Checks if an API key is in a protected context
   */
  private isKeyProtected(body: string, key: string): boolean {
    const keyIndex = body.indexOf(key);
    if (keyIndex === -1) return false;

    // Check surrounding context
    const context = body.substring(Math.max(0, keyIndex - 100), Math.min(body.length, keyIndex + 100));
    
    // Check if in comment
    if (context.includes('<!--') || context.includes('//') || context.includes('/*')) {
      return true;
    }

    // Check if marked as example/demo
    if (context.toLowerCase().includes('example') || 
        context.toLowerCase().includes('demo') || 
        context.toLowerCase().includes('placeholder')) {
      return true;
    }

    return false;
  }

  /**
   * Detects security issues
   */
  private detectSecurityIssues(body: string, headers: Record<string, string>): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    // Check for inline JavaScript
    if (body.includes('<script>') && !body.includes('nonce=')) {
      issues.push({
        type: 'Inline JavaScript without CSP nonce',
        description: 'Page contains inline JavaScript without Content Security Policy nonce',
        severity: 'medium',
        recommendation: 'Use CSP nonces or move scripts to external files',
      });
    }

    // Check for eval usage
    if (body.includes('eval(') || body.includes('Function(')) {
      issues.push({
        type: 'Dangerous JavaScript functions',
        description: 'Page uses eval() or Function() which can lead to code injection',
        severity: 'high',
        recommendation: 'Avoid using eval() and Function() constructors',
      });
    }

    // Check for mixed content
    if (body.includes('http://') && headers['content-type']?.includes('text/html')) {
      issues.push({
        type: 'Mixed Content',
        description: 'HTTPS page loads HTTP resources',
        severity: 'medium',
        recommendation: 'Use HTTPS for all resources',
      });
    }

    // Check for autocomplete on sensitive fields
    if (body.match(/type=["']password["'][^>]*autocomplete=["']on["']/i)) {
      issues.push({
        type: 'Password Autocomplete Enabled',
        description: 'Password fields have autocomplete enabled',
        severity: 'low',
        recommendation: 'Disable autocomplete on sensitive fields',
      });
    }

    // Check for exposed comments
    const commentMatches = body.match(/<!--[\s\S]*?-->/g);
    if (commentMatches && commentMatches.length > 10) {
      issues.push({
        type: 'Excessive HTML Comments',
        description: `Found ${commentMatches.length} HTML comments that may expose sensitive information`,
        severity: 'low',
        recommendation: 'Remove comments in production builds',
      });
    }

    return issues;
  }

  /**
   * Extracts metadata from HTML
   */
  private extractMetadata(body: string): MetadataInfo {
    const metadata: MetadataInfo = {};

    // Title
    const titleMatch = body.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch) metadata.title = titleMatch[1].trim();

    // Meta tags
    const metaRegex = /<meta\s+([^>]*?)>/gi;
    let metaMatch;
    while ((metaMatch = metaRegex.exec(body)) !== null) {
      const attrs = metaMatch[1];
      
      if (attrs.includes('name="description"')) {
        const contentMatch = attrs.match(/content=["']([^"']*)["']/i);
        if (contentMatch) metadata.description = contentMatch[1];
      }
      if (attrs.includes('name="keywords"')) {
        const contentMatch = attrs.match(/content=["']([^"']*)["']/i);
        if (contentMatch) metadata.keywords = contentMatch[1];
      }
      if (attrs.includes('name="author"')) {
        const contentMatch = attrs.match(/content=["']([^"']*)["']/i);
        if (contentMatch) metadata.author = contentMatch[1];
      }
      if (attrs.includes('name="generator"')) {
        const contentMatch = attrs.match(/content=["']([^"']*)["']/i);
        if (contentMatch) metadata.generator = contentMatch[1];
      }
      if (attrs.includes('name="viewport"')) {
        const contentMatch = attrs.match(/content=["']([^"']*)["']/i);
        if (contentMatch) metadata.viewport = contentMatch[1];
      }
      if (attrs.includes('charset')) {
        const charsetMatch = attrs.match(/charset=["']?([^"'\s>]+)/i);
        if (charsetMatch) metadata.charset = charsetMatch[1];
      }
      if (attrs.includes('property="og:title"')) {
        const contentMatch = attrs.match(/content=["']([^"']*)["']/i);
        if (contentMatch) metadata.ogTitle = contentMatch[1];
      }
      if (attrs.includes('property="og:description"')) {
        const contentMatch = attrs.match(/content=["']([^"']*)["']/i);
        if (contentMatch) metadata.ogDescription = contentMatch[1];
      }
      if (attrs.includes('property="og:image"')) {
        const contentMatch = attrs.match(/content=["']([^"']*)["']/i);
        if (contentMatch) metadata.ogImage = contentMatch[1];
      }
    }

    // Language
    const langMatch = body.match(/<html[^>]*lang=["']([^"']*)["']/i);
    if (langMatch) metadata.language = langMatch[1];

    return metadata;
  }

  /**
   * Detects JavaScript libraries
   */
  private detectJSLibraries(body: string): string[] {
    const libraries: Set<string> = new Set();
    const patterns = [
      { name: 'jQuery', regex: /jquery[.-](\d+\.\d+\.\d+)/i },
      { name: 'React', regex: /react[.-](\d+\.\d+\.\d+)/i },
      { name: 'Vue.js', regex: /vue[.-](\d+\.\d+\.\d+)/i },
      { name: 'Angular', regex: /angular[.-](\d+\.\d+\.\d+)/i },
      { name: 'Bootstrap', regex: /bootstrap[.-](\d+\.\d+\.\d+)/i },
      { name: 'Lodash', regex: /lodash[.-](\d+\.\d+\.\d+)/i },
      { name: 'Moment.js', regex: /moment[.-](\d+\.\d+\.\d+)/i },
      { name: 'D3.js', regex: /d3[.-](\d+\.\d+\.\d+)/i },
      { name: 'Three.js', regex: /three[.-](\d+\.\d+\.\d+)/i },
      { name: 'Chart.js', regex: /chart[.-](\d+\.\d+\.\d+)/i },
    ];

    for (const pattern of patterns) {
      const match = body.match(pattern.regex);
      if (match) {
        libraries.add(`${pattern.name} ${match[1]}`);
      } else if (body.toLowerCase().includes(pattern.name.toLowerCase())) {
        libraries.add(pattern.name);
      }
    }

    return Array.from(libraries);
  }

  /**
   * Detects analytics services
   */
  private detectAnalytics(body: string): AnalyticsInfo[] {
    const analytics: AnalyticsInfo[] = [];

    // Google Analytics
    const gaMatch = body.match(/UA-\d+-\d+|G-[A-Z0-9]+/g);
    if (gaMatch) {
      gaMatch.forEach(id => analytics.push({ type: 'Google Analytics', id }));
    }

    // Google Tag Manager
    const gtmMatch = body.match(/GTM-[A-Z0-9]+/g);
    if (gtmMatch) {
      gtmMatch.forEach(id => analytics.push({ type: 'Google Tag Manager', id }));
    }

    // Facebook Pixel
    const fbMatch = body.match(/fbq\('init',\s*'(\d+)'/);
    if (fbMatch) {
      analytics.push({ type: 'Facebook Pixel', id: fbMatch[1] });
    }

    // Hotjar
    const hjMatch = body.match(/hjid:\s*(\d+)/);
    if (hjMatch) {
      analytics.push({ type: 'Hotjar', id: hjMatch[1] });
    }

    return analytics;
  }

  /**
   * Detects CDN usage
   */
  private detectCDN(body: string, headers: Record<string, string>): CDNInfo {
    const cdnProviders = [
      'cloudflare', 'cloudfront', 'akamai', 'fastly', 'cdn77',
      'maxcdn', 'jsdelivr', 'unpkg', 'cdnjs', 'bootstrapcdn'
    ];

    const resources: Set<string> = new Set();
    let provider: string | undefined;

    // Check headers
    for (const [key, value] of Object.entries(headers)) {
      const lowerValue = value.toLowerCase();
      for (const cdn of cdnProviders) {
        if (lowerValue.includes(cdn)) {
          provider = cdn.charAt(0).toUpperCase() + cdn.slice(1);
          break;
        }
      }
    }

    // Check body for CDN URLs
    const urlRegex = /https?:\/\/[^\s"'<>]+/g;
    const urls = body.match(urlRegex) || [];
    
    for (const url of urls) {
      const lowerUrl = url.toLowerCase();
      for (const cdn of cdnProviders) {
        if (lowerUrl.includes(cdn)) {
          resources.add(cdn.charAt(0).toUpperCase() + cdn.slice(1));
          if (!provider) provider = cdn.charAt(0).toUpperCase() + cdn.slice(1);
        }
      }
    }

    return {
      provider,
      detected: resources.size > 0,
      resources: Array.from(resources),
    };
  }

  /**
   * Checks robots.txt
   */
  private async checkRobotsTxt(domain: string, protocol: string): Promise<RobotsInfo> {
    try {
      const response = await makeHttpRequest(`${protocol}://${domain}/robots.txt`, {
        timeout: 5000,
      });

      const lines = response.body.split('\n');
      const disallowedPaths: string[] = [];
      const allowedPaths: string[] = [];
      const sitemaps: string[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('Disallow:')) {
          const path = trimmed.substring(9).trim();
          if (path) disallowedPaths.push(path);
        } else if (trimmed.startsWith('Allow:')) {
          const path = trimmed.substring(6).trim();
          if (path) allowedPaths.push(path);
        } else if (trimmed.startsWith('Sitemap:')) {
          const sitemap = trimmed.substring(8).trim();
          if (sitemap) sitemaps.push(sitemap);
        }
      }

      return {
        exists: true,
        disallowedPaths,
        allowedPaths,
        sitemaps,
      };
    } catch {
      return {
        exists: false,
        disallowedPaths: [],
        allowedPaths: [],
        sitemaps: [],
      };
    }
  }

  /**
   * Checks sitemap.xml
   */
  private async checkSitemap(domain: string, protocol: string): Promise<SitemapInfo> {
    try {
      const response = await makeHttpRequest(`${protocol}://${domain}/sitemap.xml`, {
        timeout: 5000,
      });

      const urlMatches = response.body.match(/<url>/g);
      const urlCount = urlMatches ? urlMatches.length : 0;

      const lastModMatch = response.body.match(/<lastmod>(.*?)<\/lastmod>/);
      const lastModified = lastModMatch ? lastModMatch[1] : undefined;

      return {
        exists: true,
        urls: urlCount,
        lastModified,
      };
    } catch {
      return {
        exists: false,
        urls: 0,
      };
    }
  }

  /**
   * Detects confidential information exposure
   */
  private detectConfidentialData(body: string, headers: Record<string, string>): ConfidentialDataInfo[] {
    const confidentialData: ConfidentialDataInfo[] = [];

    // PII Detection Patterns
    const piiPatterns = [
      {
        type: 'Social Security Number (SSN)',
        category: 'PII' as const,
        regex: /\b\d{3}-\d{2}-\d{4}\b/g,
        severity: 'critical' as const,
        recommendation: 'Never expose SSNs in client-side code. Store securely server-side with encryption.',
      },
      {
        type: 'Email Address',
        category: 'PII' as const,
        regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
        severity: 'medium' as const,
        recommendation: 'Consider obfuscating email addresses to prevent scraping.',
      },
      {
        type: 'Phone Number (US)',
        category: 'PII' as const,
        regex: /\b(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g,
        severity: 'medium' as const,
        recommendation: 'Avoid exposing phone numbers in HTML. Use contact forms instead.',
      },
      {
        type: 'Passport Number',
        category: 'PII' as const,
        regex: /\b[A-Z]{1,2}[0-9]{6,9}\b/g,
        severity: 'critical' as const,
        recommendation: 'Passport numbers should never be exposed publicly.',
      },
      {
        type: 'Date of Birth',
        category: 'PII' as const,
        regex: /\b(?:0[1-9]|1[0-2])[-/](?:0[1-9]|[12][0-9]|3[01])[-/](?:19|20)\d{2}\b/g,
        severity: 'high' as const,
        recommendation: 'DOB is sensitive PII. Avoid exposing in client-side code.',
      },
      {
        type: 'IP Address',
        category: 'PII' as const,
        regex: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
        severity: 'low' as const,
        recommendation: 'IP addresses can be used for tracking. Consider privacy implications.',
      },
    ];

    // Financial Data Patterns
    const financialPatterns = [
      {
        type: 'Credit Card Number',
        category: 'Financial' as const,
        regex: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12})\b/g,
        severity: 'critical' as const,
        recommendation: 'CRITICAL: Credit card numbers must never be exposed. Use PCI-compliant payment processors.',
      },
      {
        type: 'Bank Account Number',
        category: 'Financial' as const,
        regex: /\b[0-9]{8,17}\b/g,
        severity: 'critical' as const,
        recommendation: 'Bank account numbers should be encrypted and never exposed in client code.',
      },
      {
        type: 'IBAN',
        category: 'Financial' as const,
        regex: /\b[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}\b/g,
        severity: 'critical' as const,
        recommendation: 'International bank account numbers must be protected.',
      },
      {
        type: 'CVV/CVC',
        category: 'Financial' as const,
        regex: /\b[0-9]{3,4}\b/g,
        severity: 'critical' as const,
        recommendation: 'CVV codes must never be stored or transmitted insecurely.',
      },
    ];

    // Health Information Patterns
    const healthPatterns = [
      {
        type: 'Medical Record Number',
        category: 'Health' as const,
        regex: /\bMRN[:\s]?[0-9]{6,10}\b/gi,
        severity: 'critical' as const,
        recommendation: 'Medical records are protected by HIPAA. Never expose publicly.',
      },
      {
        type: 'Health Insurance Number',
        category: 'Health' as const,
        regex: /\b[A-Z]{3}[0-9]{9}[A-Z]{2}\b/g,
        severity: 'critical' as const,
        recommendation: 'Health insurance information is protected health information (PHI).',
      },
    ];

    // Credentials Patterns
    const credentialPatterns = [
      {
        type: 'Password in Code',
        category: 'Credentials' as const,
        regex: /(?:password|passwd|pwd)[\s]*[=:]\s*["']([^"']{6,})["']/gi,
        severity: 'critical' as const,
        recommendation: 'CRITICAL: Hardcoded passwords detected. Use environment variables and secrets management.',
      },
      {
        type: 'Username Pattern',
        category: 'Credentials' as const,
        regex: /(?:username|user|login)[\s]*[=:]\s*["']([^"']+)["']/gi,
        severity: 'medium' as const,
        recommendation: 'Avoid hardcoding usernames. Use secure authentication systems.',
      },
      {
        type: 'Private Key',
        category: 'Credentials' as const,
        regex: /-----BEGIN (?:RSA |EC |DSA )?PRIVATE KEY-----/g,
        severity: 'critical' as const,
        recommendation: 'CRITICAL: Private keys exposed. Revoke immediately and use secure key management.',
      },
      {
        type: 'JWT Token',
        category: 'Credentials' as const,
        regex: /eyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/g,
        severity: 'high' as const,
        recommendation: 'JWT tokens should not be exposed in HTML. Use secure storage mechanisms.',
      },
      {
        type: 'Database Connection String',
        category: 'Credentials' as const,
        regex: /(?:mongodb|mysql|postgresql|mssql):\/\/[^\s"'<>]+/gi,
        severity: 'critical' as const,
        recommendation: 'CRITICAL: Database credentials exposed. Use environment variables.',
      },
    ];

    // Business Sensitive Patterns
    const businessPatterns = [
      {
        type: 'Tax ID / EIN',
        category: 'Business' as const,
        regex: /\b\d{2}-\d{7}\b/g,
        severity: 'high' as const,
        recommendation: 'Tax identification numbers should be protected.',
      },
      {
        type: 'Internal IP Range',
        category: 'Business' as const,
        regex: /\b(?:10\.|172\.(?:1[6-9]|2[0-9]|3[01])\.|192\.168\.)[0-9]{1,3}\.[0-9]{1,3}\b/g,
        severity: 'medium' as const,
        recommendation: 'Internal network information can aid attackers in reconnaissance.',
      },
    ];

    // Legal/Government Patterns
    const legalPatterns = [
      {
        type: 'Driver License Number',
        category: 'Legal' as const,
        regex: /\b[A-Z]{1,2}[0-9]{5,8}\b/g,
        severity: 'high' as const,
        recommendation: 'Driver license numbers are sensitive PII.',
      },
    ];

    // Combine all patterns
    const allPatterns = [
      ...piiPatterns,
      ...financialPatterns,
      ...healthPatterns,
      ...credentialPatterns,
      ...businessPatterns,
      ...legalPatterns,
    ];

    // Scan for each pattern
    for (const pattern of allPatterns) {
      const matches = body.match(pattern.regex);
      if (matches && matches.length > 0) {
        // Filter out false positives
        const validMatches = this.filterFalsePositives(matches, pattern.type, body);
        
        if (validMatches.length > 0) {
          // Determine protection status
          const status = this.determineProtectionStatus(body, validMatches, headers);
          
          // Mask sensitive data in samples
          const samples = validMatches.slice(0, 3).map(match => this.maskSensitiveData(match, pattern.type));
          
          confidentialData.push({
            type: pattern.type,
            category: pattern.category,
            pattern: pattern.regex.source,
            count: validMatches.length,
            status,
            severity: pattern.severity,
            samples,
            location: 'HTML/JavaScript/Headers',
            recommendation: pattern.recommendation,
          });
        }
      }
    }

    return confidentialData;
  }

  /**
   * Filters false positives from pattern matches
   */
  private filterFalsePositives(matches: string[], type: string, body: string): string[] {
    return matches.filter(match => {
      const matchLower = match.toLowerCase();
      const context = this.getMatchContext(body, match);
      const contextLower = context.toLowerCase();

      // Filter common false positives
      if (contextLower.includes('example') || 
          contextLower.includes('placeholder') ||
          contextLower.includes('demo') ||
          contextLower.includes('test') ||
          contextLower.includes('sample')) {
        return false;
      }

      // Type-specific filtering
      if (type === 'Email Address') {
        if (matchLower.includes('example.com') || 
            matchLower.includes('test.com') ||
            matchLower.includes('domain.com')) {
          return false;
        }
      }

      if (type === 'Credit Card Number') {
        // Filter test card numbers
        if (match.startsWith('4111111111111111') || 
            match.startsWith('5555555555554444')) {
          return false;
        }
      }

      if (type === 'Password in Code') {
        // Filter obvious placeholders
        if (matchLower.includes('password') || 
            matchLower.includes('your') ||
            matchLower.includes('enter')) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Gets context around a match
   */
  private getMatchContext(body: string, match: string): string {
    const index = body.indexOf(match);
    if (index === -1) return '';
    
    const start = Math.max(0, index - 50);
    const end = Math.min(body.length, index + match.length + 50);
    return body.substring(start, end);
  }

  /**
   * Determines if data is protected
   */
  private determineProtectionStatus(
    body: string, 
    matches: string[], 
    headers: Record<string, string>
  ): 'exposed' | 'protected' | 'encrypted' | 'unknown' {
    // Check if in encrypted context
    if (headers['strict-transport-security']) {
      // HTTPS with HSTS
      return 'protected';
    }

    // Check if data appears to be encrypted/hashed
    const firstMatch = matches[0];
    if (firstMatch.length > 32 && /^[a-f0-9]+$/i.test(firstMatch)) {
      return 'encrypted';
    }

    // Check if in comment or documentation
    for (const match of matches) {
      const context = this.getMatchContext(body, match);
      if (context.includes('<!--') || 
          context.includes('//') || 
          context.includes('/*') ||
          context.includes('*')) {
        return 'protected';
      }
    }

    // Check if behind authentication
    if (body.includes('login') || body.includes('auth') || body.includes('signin')) {
      return 'protected';
    }

    // Default to exposed if found in plain HTML
    return 'exposed';
  }

  /**
   * Masks sensitive data for display
   */
  private maskSensitiveData(data: string, type: string): string {
    if (data.length <= 8) {
      return '***' + data.slice(-2);
    }

    // Show first 4 and last 4 characters
    const visibleChars = 4;
    const start = data.substring(0, visibleChars);
    const end = data.substring(data.length - visibleChars);
    const masked = '*'.repeat(Math.min(data.length - (visibleChars * 2), 10));
    
    return `${start}${masked}${end}`;
  }
}
