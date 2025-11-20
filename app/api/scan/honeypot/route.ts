import { NextRequest, NextResponse } from 'next/server';
import { HoneypotDetector } from '@/lib/services/honeypot-detector.service';

interface HoneypotScanRequest {
  target: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: HoneypotScanRequest = await request.json();

    // Validate target
    if (!body.target) {
      return NextResponse.json(
        { success: false, error: 'Target IP address or domain is required' },
        { status: 400 }
      );
    }

    // Validate format (IP or domain)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z]{2,})+$/;
    
    if (!ipRegex.test(body.target) && !domainRegex.test(body.target) && !body.target.startsWith('http')) {
      return NextResponse.json(
        { success: false, error: 'Invalid IP address or domain format' },
        { status: 400 }
      );
    }

    // Perform real honeypot detection
    console.log('[Honeypot API] Starting detection for:', body.target);
    const detector = new HoneypotDetector();
    const result = await detector.detect(body.target);
    console.log('[Honeypot API] Detection complete:', result.confidence, '% confidence');

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Honeypot detection error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to perform honeypot detection',
      },
      { status: 500 }
    );
  }
}

