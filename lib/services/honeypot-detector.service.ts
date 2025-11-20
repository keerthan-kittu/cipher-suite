/**
 * Production-Ready Honeypot Detection Service
 * Uses real network analysis techniques to detect honeypot systems
 */

import { makeHttpRequest } from '../utils/http-client';

export interface HoneypotIndicator {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  details: string;
  detected: boolean;
  score: number;
}

export interface SecurityAssessment {
  overallScore: number; // 0-100, higher is better
  securityGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  securityLevel: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  httpsEnabled: boolean;
  hasValidCertificate: boolean;
  tlsVersion?: string;
  cipherSuite?: string;
  certificateInfo?: {
    issuer: string;
    validFrom: string;
    validTo: string;
    daysUntilExpiry: number;
  };
  serverInfo: {
    serverSoftware: string;
    poweredBy: string;
    technologies: string[];
    exposedPorts: number[];
  };
  securityHeaders: {
    present: string[];
    missing: string[];
    score: number;
    details: { [key: string]: string };
  };
  cookieSecurity: {
    hasSecureFlag: boolean;
    hasHttpOnlyFlag: boolean;
    hasSameSiteFlag: boolean;
    issues: string[];
  };
  contentAnalysis: {
    hasLoginForm: boolean;
    hasFileUpload: boolean;
    hasAdminPanel: boolean;
    suspiciousPatterns: string[];
    technologies: string[];
  };
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    details: Array<{
      severity: 'critical' | 'high' | 'medium' | 'low';
      title: string;
      description: string;
      impact: string;
      remediation: string;
    }>;
  };
  complianceStatus: {
    gdpr: boolean;
    pciDss: boolean;
    owasp: boolean;
    issues: string[];
  };
  securityRecommendations: string[];
  riskFactors: string[];
  positiveFindings: string[];
}

export interface HoneypotDetectionResult {
  target: string;
  isHoneypot: boolean;
  confidence: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  indicators: HoneypotIndicator[];
  recommendation: string;
  detectionMethods: string[];
  networkInfo: {
    responseTime: number;
    openPorts: number;
    serviceFingerprints: number;
  };
  securityAssessment: SecurityAssessment;
}

export class HoneypotDetector {
  /**
   * Performs comprehensive honeypot detection on a target
   */
  async detect(target: string): Promise<HoneypotDetectionResult> {
    console.log('[Honeypot Detector] Starting detection for:', target);
    
    const indicators: HoneypotIndicator[] = [];
    let totalScore = 0;

    try {
      // 1. HTTP Response Analysis
      const httpIndicators = await this.analyzeHTTPBehavior(target);
      indicators.push(...httpIndicators);

      // 2. Timing Analysis
      const timingIndicators = await this.analyzeResponseTiming(target);
      indicators.push(...timingIndicators);

      // 3. Header Analysis
      const headerIndicators = await this.analyzeHeaders(target);
      indicators.push(...headerIndicators);

      // 4. Content Analysis
      const contentIndicators = await this.analyzeContent(target);
      indicators.push(...contentIndicators);

      // 5. Behavioral Analysis
      const behaviorIndicators = await this.analyzeBehavior(target);
      indicators.push(...behaviorIndicators);

    } catch (error) {
      console.error('[Honeypot Detector] Detection error:', error);
      // Add error indicator
      indicators.push({
        type: 'Connection Analysis',
        severity: 'low',
        description: 'Unable to complete full analysis',
        details: error instanceof Error ? error.message : 'Unknown error',
        detected: false,
        score: 0,
      });
    }

    // Perform security assessment
    const securityAssessment = await this.assessSecurity(target);

    // Calculate results
    totalScore = indicators.reduce((sum, ind) => sum + ind.score, 0);
    const detectedCount = indicators.filter(i => i.detected).length;
    const maxScore = 115; // Maximum possible score
    
    // Calculate confidence based on actual score
    const rawConfidence = Math.round((totalScore / maxScore) * 100);
    const confidence = Math.min(95, rawConfidence);
    
    // Honeypot detection threshold: 35% confidence or 3+ indicators
    const isHoneypot = confidence >= 35 || (detectedCount >= 3 && totalScore >= 30);

    let riskLevel: 'critical' | 'high' | 'medium' | 'low';
    if (confidence >= 60) riskLevel = 'critical';
    else if (confidence >= 35) riskLevel = 'high';
    else if (confidence >= 20) riskLevel = 'medium';
    else riskLevel = 'low';

    const recommendation = this.generateRecommendation(isHoneypot, confidence, detectedCount, totalScore, maxScore);

    const detectionMethods = [
      'HTTP Response Analysis',
      'Response Timing Profiling',
      'Header Fingerprinting',
      'Content Pattern Analysis',
      'Behavioral Analysis',
      'Service Consistency Check',
    ];

    return {
      target,
      isHoneypot,
      confidence,
      riskLevel,
      indicators,
      recommendation,
      detectionMethods,
      networkInfo: {
        responseTime: indicators.find(i => i.type.includes('Response Time'))?.score || 0,
        openPorts: 0, // Would need actual port scanning
        serviceFingerprints: detectedCount,
      },
      securityAssessment,
    };
  }

  /**
   * Comprehensive security assessment
   */
  private async assessSecurity(target: string): Promise<SecurityAssessment> {
    let securityScore = 100; // Start with perfect score, deduct for issues
    const securityRecommendations: string[] = [];
    const riskFactors: string[] = [];
    const positiveFindings: string[] = [];
    const vulnerabilityDetails: Array<{
      severity: 'critical' | 'high' | 'medium' | 'low';
      title: string;
      description: string;
      impact: string;
      remediation: string;
    }> = [];
    const vulnerabilities = { critical: 0, high: 0, medium: 0, low: 0, details: vulnerabilityDetails };
    
    let httpsEnabled = false;
    let hasValidCertificate = false;
    let tlsVersion: string | undefined;
    let cipherSuite: string | undefined;
    const presentHeaders: string[] = [];
    const missingHeaders: string[] = [];
    const headerDetails: { [key: string]: string } = {};
    
    const serverInfo = {
      serverSoftware: 'Unknown',
      poweredBy: 'Unknown',
      technologies: [] as string[],
      exposedPorts: [] as number[],
    };

    const cookieSecurity = {
      hasSecureFlag: false,
      hasHttpOnlyFlag: false,
      hasSameSiteFlag: false,
      issues: [] as string[],
    };

    const contentAnalysis = {
      hasLoginForm: false,
      hasFileUpload: false,
      hasAdminPanel: false,
      suspiciousPatterns: [] as string[],
      technologies: [] as string[],
    };

    const complianceStatus = {
      gdpr: true,
      pciDss: true,
      owasp: true,
      issues: [] as string[],
    };

    try {
      // Check HTTPS
      const isHttps = target.startsWith('https://');
      const url = target.startsWith('http') ? target : `https://${target}`;
      
      try {
        const httpsResponse = await makeHttpRequest(url.replace('http://', 'https://'), { timeout: 5000 });
        httpsEnabled = true;
        hasValidCertificate = true;
        securityScore += 0; // No penalty
      } catch {
        if (isHttps) {
          httpsEnabled = false;
          hasValidCertificate = false;
          securityScore -= 30;
          vulnerabilities.critical++;
          securityRecommendations.push('🔴 CRITICAL: HTTPS is not properly configured or certificate is invalid');
        } else {
          httpsEnabled = false;
          securityScore -= 25;
          vulnerabilities.high++;
          securityRecommendations.push('🔴 HIGH: No HTTPS encryption - all traffic is sent in plain text');
        }
      }

      // Analyze security headers and content
      const httpUrl = target.startsWith('http') ? target : `http://${target}`;
      try {
        const response = await makeHttpRequest(httpUrl, { timeout: 10000 });
        
        // Extract server information
        if (response.headers['server']) {
          serverInfo.serverSoftware = response.headers['server'];
          const serverHeader = response.headers['server'].toLowerCase();
          
          // Detect technologies
          if (serverHeader.includes('apache')) serverInfo.technologies.push('Apache');
          if (serverHeader.includes('nginx')) serverInfo.technologies.push('Nginx');
          if (serverHeader.includes('iis')) serverInfo.technologies.push('IIS');
          if (serverHeader.includes('cloudflare')) serverInfo.technologies.push('Cloudflare');
          
          if (serverHeader.match(/\d+\.\d+/)) {
            securityScore -= 5;
            vulnerabilities.low++;
            riskFactors.push('Server version exposed in headers');
            vulnerabilityDetails.push({
              severity: 'low',
              title: 'Server Version Disclosure',
              description: 'Server version is exposed in HTTP headers',
              impact: 'Attackers can identify specific vulnerabilities for this version',
              remediation: 'Configure server to hide version information in headers',
            });
          }
        }

        if (response.headers['x-powered-by']) {
          serverInfo.poweredBy = response.headers['x-powered-by'];
          securityScore -= 5;
          vulnerabilities.low++;
          riskFactors.push('Technology stack disclosed');
          vulnerabilityDetails.push({
            severity: 'low',
            title: 'Technology Stack Disclosure',
            description: `X-Powered-By header reveals: ${response.headers['x-powered-by']}`,
            impact: 'Provides attackers with information about backend technologies',
            remediation: 'Remove X-Powered-By header from server configuration',
          });
        }

        // Analyze content
        const bodyLower = response.body.toLowerCase();
        
        // Check for login forms
        if (bodyLower.includes('login') || bodyLower.includes('password') || bodyLower.includes('signin')) {
          contentAnalysis.hasLoginForm = true;
          if (!httpsEnabled) {
            securityScore -= 15;
            vulnerabilities.critical++;
            riskFactors.push('Login form over unencrypted connection');
            vulnerabilityDetails.push({
              severity: 'critical',
              title: 'Insecure Authentication',
              description: 'Login form detected on unencrypted HTTP connection',
              impact: 'Credentials transmitted in plain text, vulnerable to interception',
              remediation: 'Implement HTTPS with valid SSL/TLS certificate immediately',
            });
          }
        }

        // Check for file upload
        if (bodyLower.includes('upload') || bodyLower.includes('file') || bodyLower.includes('type="file"')) {
          contentAnalysis.hasFileUpload = true;
          riskFactors.push('File upload functionality detected');
        }

        // Check for admin panel
        if (bodyLower.includes('admin') || bodyLower.includes('dashboard') || bodyLower.includes('control panel')) {
          contentAnalysis.hasAdminPanel = true;
          riskFactors.push('Admin panel or dashboard detected');
        }

        // Detect technologies from content
        if (bodyLower.includes('wordpress')) contentAnalysis.technologies.push('WordPress');
        if (bodyLower.includes('drupal')) contentAnalysis.technologies.push('Drupal');
        if (bodyLower.includes('joomla')) contentAnalysis.technologies.push('Joomla');
        if (bodyLower.includes('react')) contentAnalysis.technologies.push('React');
        if (bodyLower.includes('angular')) contentAnalysis.technologies.push('Angular');
        if (bodyLower.includes('vue')) contentAnalysis.technologies.push('Vue.js');
        if (bodyLower.includes('jquery')) contentAnalysis.technologies.push('jQuery');

        // Check for suspicious patterns
        if (bodyLower.includes('sql') && bodyLower.includes('error')) {
          contentAnalysis.suspiciousPatterns.push('SQL error messages exposed');
          securityScore -= 10;
          vulnerabilities.high++;
          riskFactors.push('Database error messages exposed');
          vulnerabilityDetails.push({
            severity: 'high',
            title: 'Information Leakage - Database Errors',
            description: 'SQL error messages are exposed in page content',
            impact: 'Reveals database structure and aids SQL injection attacks',
            remediation: 'Implement proper error handling and disable debug mode in production',
          });
        }

        if (bodyLower.includes('debug') || bodyLower.includes('stacktrace')) {
          contentAnalysis.suspiciousPatterns.push('Debug information exposed');
          securityScore -= 8;
          vulnerabilities.medium++;
          riskFactors.push('Debug mode enabled in production');
        }

        // Security headers analysis
        const securityHeaders = {
          'strict-transport-security': { score: 10, severity: 'high' as const, description: 'Forces HTTPS connections' },
          'content-security-policy': { score: 10, severity: 'high' as const, description: 'Prevents XSS and injection attacks' },
          'x-frame-options': { score: 8, severity: 'medium' as const, description: 'Prevents clickjacking attacks' },
          'x-content-type-options': { score: 8, severity: 'medium' as const, description: 'Prevents MIME-sniffing attacks' },
          'x-xss-protection': { score: 5, severity: 'low' as const, description: 'Browser XSS filter' },
          'referrer-policy': { score: 5, severity: 'low' as const, description: 'Controls referrer information' },
          'permissions-policy': { score: 4, severity: 'low' as const, description: 'Controls browser features' },
        };

        for (const [header, config] of Object.entries(securityHeaders)) {
          const headerValue = response.headers[header] || response.headers[header.toLowerCase()];
          if (headerValue) {
            presentHeaders.push(header);
            headerDetails[header] = headerValue;
            positiveFindings.push(`${header} header present`);
          } else {
            missingHeaders.push(header);
            securityScore -= config.score;
            
            if (config.severity === 'high') {
              vulnerabilities.high++;
              riskFactors.push(`Missing ${header}`);
              complianceStatus.owasp = false;
              vulnerabilityDetails.push({
                severity: 'high',
                title: `Missing Security Header: ${header}`,
                description: config.description,
                impact: 'Exposes application to various security attacks',
                remediation: `Add ${header} header to server configuration`,
              });
            } else if (config.severity === 'medium') {
              vulnerabilities.medium++;
              riskFactors.push(`Missing ${header}`);
              vulnerabilityDetails.push({
                severity: 'medium',
                title: `Missing Security Header: ${header}`,
                description: config.description,
                impact: 'Reduces overall security posture',
                remediation: `Add ${header} header to server configuration`,
              });
            } else {
              vulnerabilities.low++;
            }
          }
        }

        // Cookie security analysis
        const setCookie = response.headers['set-cookie'];
        if (setCookie && typeof setCookie === 'string') {
          if (setCookie.includes('Secure')) {
            cookieSecurity.hasSecureFlag = true;
            positiveFindings.push('Cookies have Secure flag');
          } else {
            cookieSecurity.issues.push('Missing Secure flag');
            securityScore -= 8;
            vulnerabilities.medium++;
            riskFactors.push('Insecure cookie configuration');
            if (!httpsEnabled) {
              complianceStatus.pciDss = false;
            }
            vulnerabilityDetails.push({
              severity: 'medium',
              title: 'Insecure Cookie Configuration',
              description: 'Cookies missing Secure flag',
              impact: 'Cookies can be intercepted over unencrypted connections',
              remediation: 'Add Secure flag to all cookies and enforce HTTPS',
            });
          }
          
          if (setCookie.includes('HttpOnly')) {
            cookieSecurity.hasHttpOnlyFlag = true;
            positiveFindings.push('Cookies have HttpOnly flag');
          } else {
            cookieSecurity.issues.push('Missing HttpOnly flag');
            securityScore -= 8;
            vulnerabilities.medium++;
            riskFactors.push('Cookies vulnerable to XSS');
            vulnerabilityDetails.push({
              severity: 'medium',
              title: 'Cookie Accessible via JavaScript',
              description: 'Cookies missing HttpOnly flag',
              impact: 'Cookies can be stolen via XSS attacks',
              remediation: 'Add HttpOnly flag to all session cookies',
            });
          }
          
          if (setCookie.includes('SameSite')) {
            cookieSecurity.hasSameSiteFlag = true;
            positiveFindings.push('Cookies have SameSite attribute');
          } else {
            cookieSecurity.issues.push('Missing SameSite attribute');
            securityScore -= 5;
            vulnerabilities.low++;
            riskFactors.push('Cookies vulnerable to CSRF');
          }
        }

        // Check for GDPR compliance indicators
        if (!bodyLower.includes('cookie') && !bodyLower.includes('privacy') && !bodyLower.includes('gdpr')) {
          complianceStatus.gdpr = false;
          complianceStatus.issues.push('No visible privacy policy or cookie consent');
        }

      } catch (error) {
        securityScore -= 10;
        securityRecommendations.push('⚠️ Unable to fully analyze security headers - connection issues');
        riskFactors.push('Connection analysis incomplete');
      }

    } catch (error) {
      securityScore -= 15;
      securityRecommendations.push('⚠️ Unable to complete security assessment - target may be unreachable');
    }

    // Ensure score is within bounds
    securityScore = Math.max(0, Math.min(100, securityScore));

    // Calculate grade
    let securityGrade: SecurityAssessment['securityGrade'];
    let securityLevel: SecurityAssessment['securityLevel'];
    
    if (securityScore >= 95) {
      securityGrade = 'A+';
      securityLevel = 'Excellent';
    } else if (securityScore >= 85) {
      securityGrade = 'A';
      securityLevel = 'Excellent';
    } else if (securityScore >= 75) {
      securityGrade = 'B';
      securityLevel = 'Good';
    } else if (securityScore >= 60) {
      securityGrade = 'C';
      securityLevel = 'Fair';
    } else if (securityScore >= 40) {
      securityGrade = 'D';
      securityLevel = 'Poor';
    } else {
      securityGrade = 'F';
      securityLevel = 'Critical';
    }

    // Generate comprehensive recommendations
    if (securityScore >= 90) {
      securityRecommendations.unshift('✅ EXCELLENT: Strong security posture with minimal issues');
    } else if (securityScore >= 75) {
      securityRecommendations.unshift('✅ GOOD: Solid security foundation with room for improvement');
    } else if (securityScore >= 60) {
      securityRecommendations.unshift('⚠️ FAIR: Several security issues need attention');
    } else if (securityScore >= 40) {
      securityRecommendations.unshift('🔴 POOR: Significant security vulnerabilities detected');
    } else {
      securityRecommendations.unshift('🔴 CRITICAL: Severe security issues - immediate action required');
    }

    // Add specific recommendations based on findings
    if (!httpsEnabled) {
      securityRecommendations.push('🔴 URGENT: Implement HTTPS with a valid SSL/TLS certificate');
      securityRecommendations.push('💡 Use Let\'s Encrypt for free SSL certificates');
    }

    if (missingHeaders.length > 0) {
      securityRecommendations.push(`🔧 Implement ${missingHeaders.length} missing security headers`);
    }

    if (cookieSecurity.issues.length > 0) {
      securityRecommendations.push('🍪 Fix cookie security configuration');
    }

    if (contentAnalysis.suspiciousPatterns.length > 0) {
      securityRecommendations.push('🐛 Disable debug mode and error message exposure');
    }

    if (!complianceStatus.owasp) {
      securityRecommendations.push('📋 Review OWASP Top 10 security guidelines');
    }

    if (positiveFindings.length > 0) {
      securityRecommendations.push(`✅ ${positiveFindings.length} positive security measures detected`);
    }

    const headerScore = Math.round((presentHeaders.length / (presentHeaders.length + missingHeaders.length)) * 100) || 0;

    return {
      overallScore: Math.round(securityScore),
      securityGrade,
      securityLevel,
      httpsEnabled,
      hasValidCertificate,
      tlsVersion,
      cipherSuite,
      serverInfo,
      securityHeaders: {
        present: presentHeaders,
        missing: missingHeaders,
        score: headerScore,
        details: headerDetails,
      },
      cookieSecurity,
      contentAnalysis,
      vulnerabilities,
      complianceStatus,
      securityRecommendations,
      riskFactors,
      positiveFindings,
    };
  }

  /**
   * Analyze HTTP behavior for honeypot characteristics
   */
  private async analyzeHTTPBehavior(target: string): Promise<HoneypotIndicator[]> {
    const indicators: HoneypotIndicator[] = [];

    try {
      const url = target.startsWith('http') ? target : `http://${target}`;
      const response = await makeHttpRequest(url, { timeout: 10000 });

      // Check for suspiciously perfect responses
      if (response.status === 200 && response.body.length < 100) {
        indicators.push({
          type: 'Minimal Response Content',
          severity: 'medium',
          description: 'Server returns minimal content for successful requests',
          details: `Response body is only ${response.body.length} bytes, suggesting automated/fake service`,
          detected: true,
          score: 15,
        });
      }

      // Check for missing common headers
      const commonHeaders = ['date', 'server', 'content-type'];
      const missingHeaders = commonHeaders.filter(h => !response.headers[h]);
      if (missingHeaders.length >= 2) {
        indicators.push({
          type: 'Missing Standard Headers',
          severity: 'medium',
          description: 'Response lacks common HTTP headers',
          details: `Missing headers: ${missingHeaders.join(', ')}. Suggests incomplete HTTP implementation.`,
          detected: true,
          score: 10,
        });
      }

    } catch (error) {
      // Connection failure might indicate honeypot blocking
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      if (errorMsg.includes('refused') || errorMsg.includes('timeout')) {
        indicators.push({
          type: 'Selective Connection Blocking',
          severity: 'high',
          description: 'Target selectively blocks certain connection attempts',
          details: 'Connection refused or timed out, may indicate honeypot filtering',
          detected: true,
          score: 20,
        });
      }
    }

    return indicators;
  }

  /**
   * Analyze response timing patterns
   */
  private async analyzeResponseTiming(target: string): Promise<HoneypotIndicator[]> {
    const indicators: HoneypotIndicator[] = [];
    const timings: number[] = [];

    try {
      const url = target.startsWith('http') ? target : `http://${target}`;

      // Make multiple requests to analyze timing consistency
      for (let i = 0; i < 3; i++) {
        const start = Date.now();
        try {
          await makeHttpRequest(url, { timeout: 5000 });
          timings.push(Date.now() - start);
        } catch {
          // Ignore errors for timing analysis
        }
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      if (timings.length >= 2) {
        // Calculate variance
        const avg = timings.reduce((a, b) => a + b, 0) / timings.length;
        const variance = timings.reduce((sum, t) => sum + Math.pow(t - avg, 2), 0) / timings.length;
        const stdDev = Math.sqrt(variance);

        // Suspiciously consistent timing (< 5ms variance) suggests automation
        if (stdDev < 5 && timings.length >= 2) {
          indicators.push({
            type: 'Response Time Anomaly',
            severity: 'high',
            description: 'Suspiciously consistent response times',
            details: `Response times show artificial uniformity (±${stdDev.toFixed(2)}ms variance), indicating emulated services`,
            detected: true,
            score: 25,
          });
        }
      }

    } catch (error) {
      // Timing analysis failed
    }

    return indicators;
  }

  /**
   * Analyze HTTP headers for honeypot signatures
   */
  private async analyzeHeaders(target: string): Promise<HoneypotIndicator[]> {
    const indicators: HoneypotIndicator[] = [];

    try {
      const url = target.startsWith('http') ? target : `http://${target}`;
      const response = await makeHttpRequest(url, { timeout: 10000 });

      // Check for known honeypot signatures
      const honeypotSignatures = [
        'honeyd', 'kippo', 'cowrie', 'dionaea', 'conpot', 'glastopf',
        'honeytrap', 'thug', 'phoneyc', 'amun'
      ];

      const serverHeader = (response.headers['server'] || '').toLowerCase();
      const detectedSignature = honeypotSignatures.find(sig => serverHeader.includes(sig));

      if (detectedSignature) {
        indicators.push({
          type: 'Honeypot Signature Detection',
          severity: 'critical',
          description: 'Known honeypot software signature detected',
          details: `Server header contains '${detectedSignature}' - known honeypot framework`,
          detected: true,
          score: 30,
        });
      }

      // Check for fake/outdated server versions
      if (serverHeader.match(/apache\/1\.|nginx\/0\.|iis\/5\./)) {
        indicators.push({
          type: 'Outdated Server Version',
          severity: 'medium',
          description: 'Server advertises extremely outdated version',
          details: 'Version is suspiciously old, typical honeypot bait strategy',
          detected: true,
          score: 15,
        });
      }

    } catch (error) {
      // Header analysis failed
    }

    return indicators;
  }

  /**
   * Analyze response content for honeypot patterns
   */
  private async analyzeContent(target: string): Promise<HoneypotIndicator[]> {
    const indicators: HoneypotIndicator[] = [];

    try {
      const url = target.startsWith('http') ? target : `http://${target}`;
      const response = await makeHttpRequest(url, { timeout: 10000 });

      // Check for generic/template content
      const genericPatterns = [
        'default page', 'test page', 'it works', 'welcome to',
        'apache2 ubuntu default', 'nginx default', 'iis windows server'
      ];

      const bodyLower = response.body.toLowerCase();
      const hasGenericContent = genericPatterns.some(pattern => bodyLower.includes(pattern));

      if (hasGenericContent && response.body.length < 5000) {
        indicators.push({
          type: 'Generic Default Content',
          severity: 'low',
          description: 'Page contains generic default server content',
          details: 'Default/template content suggests minimal configuration, possible honeypot',
          detected: true,
          score: 5,
        });
      }

      // Check for honeypot-specific strings
      if (bodyLower.includes('honeypot') || bodyLower.includes('decoy')) {
        indicators.push({
          type: 'Explicit Honeypot Reference',
          severity: 'critical',
          description: 'Content explicitly mentions honeypot or decoy',
          details: 'Page content contains honeypot-related terminology',
          detected: true,
          score: 30,
        });
      }

    } catch (error) {
      // Content analysis failed
    }

    return indicators;
  }

  /**
   * Analyze behavioral patterns
   */
  private async analyzeBehavior(target: string): Promise<HoneypotIndicator[]> {
    const indicators: HoneypotIndicator[] = [];

    try {
      const url = target.startsWith('http') ? target : `http://${target}`;

      // Test with different user agents
      const normalResponse = await makeHttpRequest(url, { timeout: 5000 });
      const scannerResponse = await makeHttpRequest(url, {
        timeout: 5000,
        headers: { 'User-Agent': 'Nmap Scripting Engine' }
      });

      // If responses differ significantly, might be detecting scanners
      if (normalResponse.status !== scannerResponse.status) {
        indicators.push({
          type: 'User-Agent Based Filtering',
          severity: 'high',
          description: 'Server responds differently to scanner user-agents',
          details: 'Behavioral change detected when using security scanner user-agent',
          detected: true,
          score: 20,
        });
      }

    } catch (error) {
      // Behavioral analysis failed
    }

    return indicators;
  }

  /**
   * Generate recommendation based on detection results
   */
  private generateRecommendation(
    isHoneypot: boolean,
    confidence: number,
    detectedCount: number,
    totalScore: number,
    maxScore: number
  ): string {
    if (isHoneypot) {
      return `⚠️ CRITICAL ALERT: This target exhibits ${detectedCount} honeypot characteristics with ${confidence}% confidence (Risk Score: ${totalScore}/${maxScore}). IMMEDIATE ACTION REQUIRED: Cease all interaction immediately to prevent detection and logging of your activities. This is highly likely a decoy system designed to trap and monitor attackers. Your IP address, scan patterns, and attack vectors may already be logged. Recommend immediate disconnection and review of operational security procedures.`;
    } else {
      return `✓ NO HONEYPOT DETECTED: Analysis found ${detectedCount} minor indicators with ${confidence}% confidence (Risk Score: ${totalScore}/${maxScore}). No honeypot characteristics detected - this appears to be a real system, not a decoy. However, this does NOT mean the system is secure or safe to interact with. Use VulnerCipher, Nmap, and RedHawk tools to assess actual security posture, vulnerabilities, and risks before proceeding.`;
    }
  }
}
