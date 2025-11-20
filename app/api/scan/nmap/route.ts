import { NextRequest, NextResponse } from 'next/server';
import { PortScanner } from '@/lib/services/port-scanner.service';

interface NMapScanRequest {
  target: string;
  scanType: 'quick' | 'full' | 'stealth' | 'aggressive';
}

export async function POST(request: NextRequest) {
  try {
    const body: NMapScanRequest = await request.json();

    // Validate target
    if (!body.target) {
      return NextResponse.json(
        { success: false, error: 'Target host is required' },
        { status: 400 }
      );
    }

    // Validate target format (IP or hostname)
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    const hostnameRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z]{2,})+$/;
    
    if (!ipRegex.test(body.target) && !hostnameRegex.test(body.target)) {
      return NextResponse.json(
        { success: false, error: 'Invalid IP address or hostname format' },
        { status: 400 }
      );
    }

    // Map scan types
    const scanTypeMap: Record<string, 'quick' | 'full' | 'stealth' | 'version' | 'os'> = {
      'quick': 'quick',
      'full': 'full',
      'stealth': 'stealth',
      'aggressive': 'version', // Aggressive = version detection
    };

    const mappedScanType = scanTypeMap[body.scanType] || 'quick';

    // Perform REAL port scan
    console.log(`[NMap API] Starting REAL ${mappedScanType} scan for ${body.target}`);
    const scanner = new PortScanner();
    const result = await scanner.scan(body.target, mappedScanType);
    console.log(`[NMap API] Scan complete: ${result.openPorts.length} open ports found`);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('NMap scan error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to perform network scan',
      },
      { status: 500 }
    );
  }
}
