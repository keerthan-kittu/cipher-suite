import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config/env.config';

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

    // Simulate scanning delay based on scan type (only in simulation mode)
    const scanDuration = config.scanDelays.nmap[body.scanType] || config.scanDelays.nmap.quick;
    await new Promise(resolve => setTimeout(resolve, scanDuration));

    // Generate realistic scan results
    const result = generateNMapResults(body.target, body.scanType);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('NMap scan error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to perform network scan',
      },
      { status: 500 }
    );
  }
}

function generateNMapResults(target: string, scanType: string) {
  const commonPorts = [
    { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.2' },
    { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'nginx 1.18.0' },
    { port: 443, protocol: 'tcp', state: 'open', service: 'https', version: 'nginx 1.18.0' },
  ];

  const additionalPorts = [
    { port: 21, protocol: 'tcp', state: 'open', service: 'ftp', version: 'vsftpd 3.0.3' },
    { port: 25, protocol: 'tcp', state: 'open', service: 'smtp', version: 'Postfix' },
    { port: 3306, protocol: 'tcp', state: 'open', service: 'mysql', version: 'MySQL 8.0.23' },
    { port: 5432, protocol: 'tcp', state: 'open', service: 'postgresql', version: 'PostgreSQL 13.2' },
    { port: 6379, protocol: 'tcp', state: 'open', service: 'redis', version: 'Redis 6.2.0' },
    { port: 8080, protocol: 'tcp', state: 'open', service: 'http-proxy', version: 'Squid 4.10' },
    { port: 27017, protocol: 'tcp', state: 'open', service: 'mongodb', version: 'MongoDB 4.4.0' },
  ];

  let openPorts = [...commonPorts];

  // Add more ports based on scan type
  if (scanType === 'full' || scanType === 'aggressive') {
    openPorts = [...openPorts, ...additionalPorts];
  } else if (scanType === 'quick') {
    // Quick scan only shows most common ports
    openPorts = commonPorts.slice(0, 3);
  }

  // Determine OS based on open ports
  let os = 'Linux 5.4.0';
  if (openPorts.some(p => p.port === 3389)) {
    os = 'Windows Server 2019';
  } else if (openPorts.some(p => p.port === 548)) {
    os = 'macOS 11.0';
  }

  return {
    host: target,
    status: 'up',
    openPorts,
    os: scanType === 'aggressive' ? os : 'Unknown',
    latency: `${(Math.random() * 5 + 1).toFixed(2)}ms`,
  };
}
