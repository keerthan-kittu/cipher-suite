import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config/env.config';
import { WhoisService } from '@/lib/services/whois.service';
import { DnsService } from '@/lib/services/dns.service';
import { makeHttpRequest, detectTechnologies, extractSecurityHeaders } from '@/lib/utils/http-client';

interface RedhawkScanRequest {
  target: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RedhawkScanRequest = await request.json();

    // Validate target
    if (!body.target) {
      return NextResponse.json(
        { success: false, error: 'Target domain is required' },
        { status: 400 }
      );
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z]{2,})+$/;
    const cleanDomain = body.target.replace(/^https?:\/\//, '').split('/')[0];
    
    if (!domainRegex.test(cleanDomain)) {
      return NextResponse.json(
        { success: false, error: 'Invalid domain format' },
        { status: 400 }
      );
    }

    // Perform real intelligence gathering
    const result = await gatherIntelligence(cleanDomain);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('RedHawk scan error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to gather intelligence',
      },
      { status: 500 }
    );
  }
}

async function gatherIntelligence(domain: string) {
  const whoisService = new WhoisService();
  const dnsService = new DnsService();

  // Perform parallel lookups
  const [whoisData, dnsRecords, httpResponse] = await Promise.allSettled([
    whoisService.lookup(domain),
    dnsService.lookup(domain),
    makeHttpRequest(`https://${domain}`, { timeout: 10000 }).catch(() =>
      makeHttpRequest(`http://${domain}`, { timeout: 10000 })
    ),
  ]);

  // Extract WHOIS data
  const whois = whoisData.status === 'fulfilled' ? whoisData.value : {};

  // Log WHOIS data for debugging
  if (config.logging.enableDebug) {
    console.log('WHOIS lookup result:', whoisData);
  }

  // Extract DNS records
  const dns = dnsRecords.status === 'fulfilled' ? dnsRecords.value : {};

  // Extract HTTP data
  let technologies: string[] = [];
  let headers: Record<string, string> = {};
  let ip = dns.A?.[0] || 'Unknown';

  if (httpResponse.status === 'fulfilled') {
    technologies = detectTechnologies(httpResponse.value);
    headers = extractSecurityHeaders(httpResponse.value.headers);
  }

  // Build subdomain list (common subdomains)
  const subdomains = await discoverSubdomains(domain, dnsService);

  // Use DNS nameservers as fallback if WHOIS doesn't have them
  const nameServers = whois.nameServers && whois.nameServers.length > 0
    ? whois.nameServers
    : dns.NS || [];

  return {
    domain,
    ip,
    whois: {
      registrar: whois.registrar || 'Not Available',
      createdDate: whois.createdDate || 'Not Available',
      expiryDate: whois.expiryDate || 'Not Available',
      updatedDate: whois.updatedDate || 'Not Available',
      nameServers: nameServers,
      status: whois.status || [],
      registrantOrganization: whois.registrantOrganization || 'Not Available',
      registrantCountry: whois.registrantCountry || 'Not Available',
    },
    dns: {
      A: dns.A || [],
      AAAA: dns.AAAA || [],
      MX: dns.MX || [],
      NS: dns.NS || [],
      TXT: dns.TXT || [],
      CNAME: dns.CNAME,
    },
    technologies: technologies.length > 0 ? technologies : ['Unknown'],
    headers,
    subdomains,
  };
}

async function discoverSubdomains(domain: string, dnsService: DnsService): Promise<string[]> {
  const commonSubdomains = ['www', 'mail', 'ftp', 'blog', 'shop', 'api', 'cdn', 'app', 'dev', 'staging'];
  const discovered: string[] = [];

  // Check common subdomains in parallel
  const checks = commonSubdomains.map(async (sub) => {
    const subdomain = `${sub}.${domain}`;
    try {
      const ips = await dnsService.resolveHostname(subdomain);
      if (ips.length > 0) {
        return subdomain;
      }
    } catch {
      // Subdomain doesn't exist
    }
    return null;
  });

  const results = await Promise.all(checks);
  
  // Filter out nulls and add to discovered list
  results.forEach(result => {
    if (result) discovered.push(result);
  });

  return discovered;
}
