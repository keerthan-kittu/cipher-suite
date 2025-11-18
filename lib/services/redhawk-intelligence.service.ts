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
    };
  }
}
