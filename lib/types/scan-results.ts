/**
 * Shared TypeScript type definitions for security scan results
 */

/**
 * Represents a network port with its associated service information
 */
export interface Port {
  port: number;
  protocol: string;
  state: string;
  service: string;
  version: string;
}

/**
 * Represents an indicator that suggests a target may be a honeypot
 */
export interface HoneypotIndicator {
  type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  detected: boolean;
}

/**
 * Represents a security vulnerability found during scanning
 */
export interface Vulnerability {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affected: string;
  recommendation: string;
}

/**
 * Represents WHOIS registration information for a domain
 */
export interface WhoisInfo {
  registrar: string;
  createdDate: string;
  expiryDate: string;
  nameServers: string[];
}

/**
 * Represents DNS records for a domain
 */
export interface DnsRecords {
  A: string[];
  MX: string[];
  NS: string[];
  TXT: string[];
}

/**
 * Complete result from a honeypot detection scan
 */
export interface HoneypotDetectionResult {
  target: string;
  isHoneypot: boolean;
  confidence: number;
  indicators: HoneypotIndicator[];
  recommendation: string;
}

/**
 * Complete result from an NMap network scan
 */
export interface NMapScanResult {
  host: string;
  status: string;
  openPorts: Port[];
  os: string;
  latency: string;
}

/**
 * Complete result from a RedHawk intelligence gathering scan
 */
export interface RedhawkResult {
  domain: string;
  ip: string;
  whois: WhoisInfo;
  dns: DnsRecords;
  technologies: string[];
  headers: Record<string, string>;
  subdomains: string[];
}

/**
 * Complete result from a Vulnercipher vulnerability scan
 */
export interface VulnerabilityResult {
  target: string;
  vulnerabilities: Vulnerability[];
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}
