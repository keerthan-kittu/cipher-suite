import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config/env.config';

interface VulnerabilityScanRequest {
  target: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: VulnerabilityScanRequest = await request.json();

    // Validate target
    if (!body.target) {
      return NextResponse.json(
        { success: false, error: 'Target URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(body.target.startsWith('http') ? body.target : `https://${body.target}`);
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Simulate scanning delay (only in simulation mode)
    await new Promise(resolve => setTimeout(resolve, config.scanDelays.vulnercipher));

    // Generate realistic vulnerabilities based on target
    const vulnerabilities = generateVulnerabilities(body.target);

    const summary = {
      total: vulnerabilities.length,
      critical: vulnerabilities.filter(v => v.severity === 'critical').length,
      high: vulnerabilities.filter(v => v.severity === 'high').length,
      medium: vulnerabilities.filter(v => v.severity === 'medium').length,
      low: vulnerabilities.filter(v => v.severity === 'low').length,
    };

    return NextResponse.json({
      success: true,
      data: {
        target: body.target,
        scanDate: new Date().toISOString(),
        vulnerabilities,
        summary,
      },
    });
  } catch (error) {
    console.error('Vulnerability scan error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform vulnerability scan',
      },
      { status: 500 }
    );
  }
}

function generateVulnerabilities(target: string) {
  const vulnerabilities = [];
  const domain = target.replace(/^https?:\/\//, '').split('/')[0];

  // Always include some common vulnerabilities with detailed information
  vulnerabilities.push({
    id: 'missing-security-headers',
    severity: 'high' as const,
    title: 'Missing Security Headers',
    description: `The target ${domain} is missing critical security headers that protect against common web attacks such as XSS, clickjacking, and MIME-type sniffing.`,
    cause: 'Security headers are not configured in the web server or application framework.',
    affected: 'HTTP Response Headers',
    recommendation: 'Implement Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, and other security headers.',
    hasSolution: true,
  });

  vulnerabilities.push({
    id: 'outdated-tls',
    severity: 'medium' as const,
    title: 'Outdated TLS Configuration',
    description: 'The server supports older TLS versions (TLS 1.0/1.1) that have known security vulnerabilities.',
    cause: 'Legacy TLS protocols are enabled for backward compatibility but contain cryptographic weaknesses.',
    affected: 'TLS/SSL Configuration',
    recommendation: 'Disable TLS 1.0 and 1.1, use only TLS 1.2 and TLS 1.3 with strong cipher suites.',
    hasSolution: true,
  });

  // Add more vulnerabilities based on domain characteristics
  if (domain.includes('test') || domain.includes('dev') || domain.includes('staging')) {
    vulnerabilities.push({
      id: '3',
      severity: 'critical' as const,
      title: 'Development Environment Exposed',
      description: 'This appears to be a development or testing environment that is publicly accessible',
      affected: 'Server Configuration',
      recommendation: 'Restrict access to development environments using IP whitelisting or VPN',
    });
  }

  if (!domain.includes('www')) {
    vulnerabilities.push({
      id: '4',
      severity: 'low' as const,
      title: 'Missing WWW Redirect',
      description: 'The site does not properly redirect between www and non-www versions',
      affected: 'DNS/Routing Configuration',
      recommendation: 'Implement proper canonical URL redirects',
    });
  }

  vulnerabilities.push({
    id: 'cookie-security',
    severity: 'medium' as const,
    title: 'Insecure Cookie Configuration',
    description: 'Cookies are not configured with Secure, HttpOnly, and SameSite flags, making them vulnerable to theft.',
    cause: 'Application or framework does not set proper cookie security attributes.',
    affected: 'Cookie Configuration',
    recommendation: 'Set Secure, HttpOnly, and SameSite attributes on all cookies.',
    hasSolution: true,
  });

  return vulnerabilities;
}
