/**
 * Production-Ready Port Scanner Service
 * Pure JavaScript/Node.js implementation - no external dependencies
 */

import { NMapScanResult, Port } from '../types/scan-results';
import * as net from 'net';
import * as dns from 'dns/promises';

export type ScanType = 'quick' | 'full' | 'stealth' | 'version' | 'os';

interface ScanOptions {
  timeout?: number;
  concurrency?: number;
}

export class PortScanner {
  // Common ports for quick scan
  private readonly COMMON_PORTS = [
    21, 22, 23, 25, 53, 80, 110, 111, 135, 139, 143, 443, 445, 993, 995,
    1723, 3306, 3389, 5900, 8080, 8443
  ];

  // Service detection patterns
  private readonly SERVICE_PATTERNS: Record<number, { name: string; probe?: string }> = {
    21: { name: 'ftp', probe: '' },
    22: { name: 'ssh', probe: '' },
    23: { name: 'telnet', probe: '' },
    25: { name: 'smtp', probe: 'EHLO scanner\r\n' },
    53: { name: 'dns' },
    80: { name: 'http', probe: 'GET / HTTP/1.0\r\n\r\n' },
    110: { name: 'pop3', probe: '' },
    111: { name: 'rpcbind' },
    135: { name: 'msrpc' },
    139: { name: 'netbios-ssn' },
    143: { name: 'imap', probe: '' },
    443: { name: 'https', probe: 'GET / HTTP/1.0\r\n\r\n' },
    445: { name: 'microsoft-ds' },
    993: { name: 'imaps' },
    995: { name: 'pop3s' },
    1433: { name: 'ms-sql-s' },
    1723: { name: 'pptp' },
    3306: { name: 'mysql', probe: '' },
    3389: { name: 'ms-wbt-server' },
    5432: { name: 'postgresql' },
    5900: { name: 'vnc' },
    6379: { name: 'redis' },
    8080: { name: 'http-proxy', probe: 'GET / HTTP/1.0\r\n\r\n' },
    8443: { name: 'https-alt' },
    27017: { name: 'mongodb' },
  };

  /**
   * Main scan method
   */
  async scan(target: string, scanType: ScanType = 'quick'): Promise<NMapScanResult> {
    console.log(`[Port Scanner] Starting ${scanType} scan for ${target}`);
    
    // Resolve hostname to IP
    let resolvedIP = target;
    try {
      if (!this.isIPAddress(target)) {
        const addresses = await dns.resolve4(target);
        resolvedIP = addresses[0];
        console.log(`[Port Scanner] Resolved ${target} to ${resolvedIP}`);
      }
    } catch (error) {
      console.error('[Port Scanner] DNS resolution failed:', error);
      return {
        host: target,
        status: 'down',
        openPorts: [],
        os: 'Unknown',
        latency: 'N/A',
      };
    }

    // Determine ports to scan
    const portsToScan = this.getPortsForScanType(scanType);
    console.log(`[Port Scanner] Scanning ${portsToScan.length} ports`);

    // Measure latency with initial connection
    const startTime = Date.now();
    const latency = await this.measureLatency(resolvedIP);
    
    // Scan ports
    const openPorts = await this.scanPorts(resolvedIP, portsToScan, {
      timeout: scanType === 'stealth' ? 5000 : 3000,
      concurrency: scanType === 'stealth' ? 5 : 10,
    });

    console.log(`[Port Scanner] Found ${openPorts.length} open ports`);

    // Detect services if requested
    if (scanType === 'version' || scanType === 'full') {
      await this.detectServices(resolvedIP, openPorts);
    }

    // Attempt OS detection
    const os = scanType === 'os' ? await this.detectOS(resolvedIP, openPorts) : 'Unknown';

    return {
      host: target,
      status: openPorts.length > 0 ? 'up' : 'down',
      openPorts,
      os,
      latency: latency !== null ? `${latency}ms` : 'N/A',
    };
  }

  /**
   * Get ports to scan based on scan type
   */
  private getPortsForScanType(scanType: ScanType): number[] {
    switch (scanType) {
      case 'quick':
        return this.COMMON_PORTS;
      case 'full':
        // Scan all ports (1-65535) - WARNING: This is slow!
        return Array.from({ length: 1000 }, (_, i) => i + 1); // Limited to first 1000 for performance
      case 'stealth':
        return this.COMMON_PORTS;
      case 'version':
        return this.COMMON_PORTS;
      case 'os':
        return this.COMMON_PORTS;
      default:
        return this.COMMON_PORTS;
    }
  }

  /**
   * Measure latency to target
   */
  private async measureLatency(host: string): Promise<number | null> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const socket = new net.Socket();
      
      socket.setTimeout(2000);
      
      socket.connect(80, host, () => {
        const latency = Date.now() - startTime;
        socket.destroy();
        resolve(latency);
      });

      socket.on('error', () => {
        socket.destroy();
        resolve(null);
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(null);
      });
    });
  }

  /**
   * Scan multiple ports concurrently
   */
  private async scanPorts(
    host: string,
    ports: number[],
    options: ScanOptions = {}
  ): Promise<Port[]> {
    const { timeout = 3000, concurrency = 10 } = options;
    const openPorts: Port[] = [];

    // Scan in batches for better performance
    for (let i = 0; i < ports.length; i += concurrency) {
      const batch = ports.slice(i, i + concurrency);
      const results = await Promise.all(
        batch.map(port => this.scanPort(host, port, timeout))
      );

      results.forEach((result, index) => {
        if (result.isOpen) {
          const port = batch[index];
          openPorts.push({
            port,
            protocol: 'tcp',
            state: 'open',
            service: this.SERVICE_PATTERNS[port]?.name || 'unknown',
            version: 'unknown',
          });
        }
      });
    }

    return openPorts;
  }

  /**
   * Scan a single port
   */
  private async scanPort(
    host: string,
    port: number,
    timeout: number
  ): Promise<{ isOpen: boolean; banner?: string }> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let banner = '';

      socket.setTimeout(timeout);

      socket.connect(port, host, () => {
        // Port is open
        socket.destroy();
        resolve({ isOpen: true });
      });

      socket.on('data', (data) => {
        banner += data.toString();
      });

      socket.on('error', () => {
        socket.destroy();
        resolve({ isOpen: false });
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve({ isOpen: false });
      });
    });
  }

  /**
   * Detect services on open ports
   */
  private async detectServices(host: string, ports: Port[]): Promise<void> {
    console.log('[Port Scanner] Detecting services...');
    
    for (const port of ports) {
      try {
        const serviceInfo = await this.probeService(host, port.port);
        if (serviceInfo) {
          port.version = serviceInfo;
        }
      } catch (error) {
        // Service detection failed, keep default
      }
    }
  }

  /**
   * Probe a service to detect version
   */
  private async probeService(host: string, port: number): Promise<string | null> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      let banner = '';

      socket.setTimeout(3000);

      socket.connect(port, host, () => {
        // Send probe if available
        const probe = this.SERVICE_PATTERNS[port]?.probe;
        if (probe) {
          socket.write(probe);
        }
      });

      socket.on('data', (data) => {
        banner += data.toString();
        // Got response, close connection
        socket.destroy();
        
        // Parse banner for version info
        const version = this.parseBanner(banner, port);
        resolve(version);
      });

      socket.on('error', () => {
        socket.destroy();
        resolve(null);
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(banner || null);
      });
    });
  }

  /**
   * Parse service banner for version information
   */
  private parseBanner(banner: string, port: number): string {
    const lines = banner.split('\n')[0]; // First line usually has version
    
    // HTTP/HTTPS
    if (port === 80 || port === 443 || port === 8080 || port === 8443) {
      const serverMatch = banner.match(/Server:\s*([^\r\n]+)/i);
      if (serverMatch) return serverMatch[1].trim();
    }

    // SSH
    if (port === 22) {
      const sshMatch = banner.match(/SSH-[\d.]+-([^\r\n]+)/);
      if (sshMatch) return sshMatch[1].trim();
    }

    // FTP
    if (port === 21) {
      const ftpMatch = banner.match(/220[- ]([^\r\n]+)/);
      if (ftpMatch) return ftpMatch[1].trim();
    }

    // SMTP
    if (port === 25) {
      const smtpMatch = banner.match(/220[- ]([^\r\n]+)/);
      if (smtpMatch) return smtpMatch[1].trim();
    }

    return lines.substring(0, 50) || 'unknown';
  }

  /**
   * Attempt OS detection based on open ports and behavior
   */
  private async detectOS(host: string, ports: Port[]): Promise<string> {
    // Simple OS detection based on port patterns
    const portNumbers = ports.map(p => p.port);

    // Windows indicators
    if (portNumbers.includes(135) && portNumbers.includes(139) && portNumbers.includes(445)) {
      return 'Microsoft Windows';
    }

    // Linux indicators
    if (portNumbers.includes(22) && !portNumbers.includes(3389)) {
      return 'Linux/Unix';
    }

    // macOS indicators
    if (portNumbers.includes(548) || portNumbers.includes(5900)) {
      return 'macOS';
    }

    return 'Unknown';
  }

  /**
   * Check if string is an IP address
   */
  private isIPAddress(str: string): boolean {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    return ipRegex.test(str);
  }
}
