export interface ReportMetadata {
  reportTitle: string;
  scanType: string;
  target: string;
  scanDate: string;
  generatedDate: string;
  organizationName?: string;
  organizationLogo?: string;
}

export interface ReportGenerationRequest {
  scanType: 'honeypot' | 'nmap' | 'redhawk' | 'vulnercipher';
  scanData: any;
  options?: {
    includeSummary?: boolean;
    severityFilter?: string[];
    includeRecommendations?: boolean;
  };
  metadata?: {
    reportTitle?: string;
    organizationName?: string;
  };
}

export interface ReportGenerationResponse {
  success: boolean;
  pdfUrl?: string;
  error?: {
    message: string;
    code: string;
  };
}

export interface VulnercipherReportData {
  target: string;
  scanDate: string;
  vulnerabilities: Array<{
    id: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    affected: string;
    recommendation: string;
  }>;
  summary: {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface NMapReportData {
  host: string;
  scanDate: string;
  scanType: string;
  status: string;
  openPorts: Array<{
    port: number;
    protocol: string;
    state: string;
    service: string;
    version: string;
  }>;
  os: string;
  latency: string;
}

export interface HoneypotReportData {
  target: string;
  scanDate: string;
  isHoneypot: boolean;
  confidence: number;
  indicators: Array<{
    type: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    detected: boolean;
  }>;
  recommendation: string;
}

export interface RedhawkReportData {
  domain: string;
  scanDate: string;
  ip: string;
  whois: {
    registrar: string;
    createdDate: string;
    expiryDate: string;
    nameServers: string[];
  };
  dns: {
    A: string[];
    MX: string[];
    NS: string[];
    TXT: string[];
  };
  technologies: string[];
  headers: { [key: string]: string };
  subdomains: string[];
}
