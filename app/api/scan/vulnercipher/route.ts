import { NextRequest, NextResponse } from 'next/server';
import { VulnerabilityScanner } from '@/lib/services/vulnerability-scanner.service';

interface VulnerabilityScanRequest {
  target: string;
  deepScan?: boolean;
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

    // Perform real vulnerability scan
    const scanner = new VulnerabilityScanner();
    const vulnerabilities = await scanner.scan(body.target, {
      checkHeaders: true,
      checkTLS: true,
      checkCookies: true,
      checkCORS: true,
      checkCSP: true,
      deepScan: body.deepScan || false,
    });

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
