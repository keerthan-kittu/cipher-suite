/**
 * NMap Scanner Service
 * Provides network scanning functionality using nmap
 */

import { executeCommand, CommandExecutionError } from '../utils/command-executor';
import { NMapScanResult, Port } from '../types/scan-results';
import { parseStringPromise } from 'xml2js';
import { config } from '../config/env.config';

/**
 * Supported NMap scan types
 */
export type NMapScanType = 'quick' | 'full' | 'stealth' | 'version' | 'os';

/**
 * NMap service for executing network scans
 */
export class NMapService {
  /**
   * Executes an NMap scan on the specified target
   */
  async scan(target: string, scanType: NMapScanType = 'quick'): Promise<NMapScanResult> {
    // Build nmap command arguments based on scan type
    const args = this.buildScanArguments(target, scanType);
    
    try {
      // Execute nmap command (timeout from config)
      const result = await executeCommand('nmap', args, {
        timeout: config.command.timeout,
      });
      
      // Parse the XML output
      const scanResult = await this.parseNMapOutput(result.stdout, target);
      
      return scanResult;
    } catch (error) {
      if (error instanceof CommandExecutionError) {
        if (error.timedOut) {
          throw new Error('NMap scan timed out. The target may be unreachable or the scan is taking too long.');
        }
        throw new Error(`NMap scan failed: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Builds nmap command arguments based on scan type
   */
  private buildScanArguments(target: string, scanType: NMapScanType): string[] {
    const baseArgs = ['-oX', '-']; // Output XML to stdout
    
    switch (scanType) {
      case 'quick':
        // Quick scan: Top 100 ports, no version detection
        return [...baseArgs, '-F', target];
        
      case 'full':
        // Full scan: All ports, version detection
        return [...baseArgs, '-p-', '-sV', target];
        
      case 'stealth':
        // Stealth SYN scan
        return [...baseArgs, '-sS', '-T2', target];
        
      case 'version':
        // Version detection on common ports
        return [...baseArgs, '-sV', '--version-intensity', '5', target];
        
      case 'os':
        // OS detection
        return [...baseArgs, '-O', '-sV', target];
        
      default:
        return [...baseArgs, '-F', target];
    }
  }

  /**
   * Parses NMap XML output into structured result
   */
  private async parseNMapOutput(xmlOutput: string, target: string): Promise<NMapScanResult> {
    try {
      const parsed = await parseStringPromise(xmlOutput);
      
      const nmaprun = parsed.nmaprun;
      const host = nmaprun.host?.[0];
      
      if (!host) {
        return {
          host: target,
          status: 'down',
          openPorts: [],
          os: 'Unknown',
          latency: 'N/A',
        };
      }
      
      // Extract host status
      const status = host.status?.[0]?.$?.state || 'unknown';
      
      // Extract latency
      const latency = host.times?.[0]?.$?.srtt 
        ? `${(parseInt(host.times[0].$.srtt) / 1000).toFixed(2)}ms`
        : 'N/A';
      
      // Extract OS information
      let os = 'Unknown';
      if (host.os?.[0]?.osmatch?.[0]) {
        os = host.os[0].osmatch[0].$.name;
      }
      
      // Extract open ports
      const openPorts: Port[] = [];
      const ports = host.ports?.[0]?.port || [];
      
      for (const port of ports) {
        const portNum = parseInt(port.$.portid);
        const protocol = port.$.protocol;
        const state = port.state?.[0]?.$?.state || 'unknown';
        
        // Only include open ports
        if (state === 'open' || state === 'filtered') {
          const service = port.service?.[0];
          openPorts.push({
            port: portNum,
            protocol,
            state,
            service: service?.$?.name || 'unknown',
            version: service?.$?.product 
              ? `${service.$.product}${service.$.version ? ' ' + service.$.version : ''}`
              : 'unknown',
          });
        }
      }
      
      return {
        host: target,
        status,
        openPorts,
        os,
        latency,
      };
    } catch (error) {
      throw new Error(`Failed to parse NMap output: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

