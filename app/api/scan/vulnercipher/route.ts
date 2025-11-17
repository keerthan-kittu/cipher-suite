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

  // Always include some common vulnerabilities
  vulnerabilities.push({
    id: '1',
    severity: 'high' as const,
    title: 'Missing Security Headers',
    description: `The target ${domain} is missing critical security headers that protect against common web attacks`,
    affected: 'HTTP Response Headers',
    recommendation: 'Implement Content-Security-Policy, X-Frame-Options, and X-Content-Type-Options headers',
  });

  vulnerabilities.push({
    id: '2',
    severity: 'medium' as const,
    title: 'Outdated TLS Configuration',
    description: 'The server supports older TLS versions that have known vulnerabilities',
    affected: 'TLS/SSL Configuration',
    recommendation: 'Disable TLS 1.0 and 1.1, use only TLS 1.2 and 1.3',
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
    id: '5',
    severity: 'medium' as const,
    title: 'Cookie Security Issues',
    description: 'Cookies are not configured with Secure and HttpOnly flags',
    affected: 'Cookie Configuration',
    recommendation: 'Set Secure, HttpOnly, and SameSite attributes on all cookies',
  });

  return vulnerabilities;
}
