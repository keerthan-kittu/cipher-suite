'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { PDFExportButton } from '../../components/PDFExportButton';

interface HoneypotIndicator {
  type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  detected: boolean;
  details?: string;
  score: number;
}

interface SecurityAssessment {
  overallScore: number;
  securityGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  securityLevel: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  httpsEnabled: boolean;
  hasValidCertificate: boolean;
  tlsVersion?: string;
  cipherSuite?: string;
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

interface DetectionResult {
  target: string;
  isHoneypot: boolean;
  confidence: number;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  indicators: HoneypotIndicator[];
  recommendation: string;
  scanDate: string;
  scanDuration: number;
  detectionMethods: string[];
  networkInfo?: {
    responseTime: number;
    openPorts: number;
    serviceFingerprints: number;
  };
  securityAssessment: SecurityAssessment;
}

export default function HoneypotPage() {
  const [target, setTarget] = useState('');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<DetectionResult | null>(null);

  const startScan = async () => {
    if (!target) return;
    
    setScanning(true);
    setProgress(0);
    setResult(null);

    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 13, 90));
    }, 350);

    try {
      const response = await fetch('/api/scan/honeypot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target }),
      });

      const apiResult = await response.json();

      clearInterval(progressInterval);
      setProgress(100);

      if (apiResult.success && apiResult.data) {
        const scanDuration = Date.now() - startTime;
        const resultData = {
          ...apiResult.data,
          scanDuration,
          scanDate: new Date().toISOString(),
        };
        setResult(resultData);
        
        // Automatically save to reports
        try {
          await fetch('/api/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tool: 'Honeypot Detection',
              target,
              findings: apiResult.data.indicators?.length || 0,
              data: resultData,
            }),
          });
        } catch (reportError) {
          console.error('Failed to save report:', reportError);
        }
      } else {
        alert(`Scan failed: ${apiResult.error || 'Unknown error'}`);
      }
    } catch (error: unknown) {
      clearInterval(progressInterval);
      alert(`Scan failed: ${error instanceof Error ? error.message : 'Network error'}`);
    } finally {
      setScanning(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-primary bg-primary/10 border-red-500/20';
      case 'medium': return 'text-primary bg-primary/10 border-orange-500/20';
      case 'low': return 'text-primary bg-primary/10 border-yellow-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      case 'low': return 'bg-green-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getSecurityGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+':
      case 'A': return 'text-green-600 dark:text-green-400';
      case 'B': return 'text-blue-600 dark:text-blue-400';
      case 'C': return 'text-yellow-600 dark:text-yellow-400';
      case 'D': return 'text-orange-600 dark:text-orange-400';
      case 'F': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-black">
      <div className="flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 sm:px-4 md:px-8 lg:px-20 xl:px-40">
          <div className="flex w-full max-w-7xl flex-1 flex-col">
            <Header />

            <main className="flex-grow p-4 sm:p-6 md:p-12 lg:p-16">
              <div className="flex flex-col gap-8">
                {/* Header Section */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center size-16 rounded-xl bg-surface-elevated border border-primary/20 text-primary shadow-lg">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white">
                      Honeypot Detection System
                    </h1>
                    <p className="text-white/60 mt-1">
                      Advanced AI-Powered Network Decoy & Trap Identification
                    </p>
                  </div>
                </div>

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-primary/30">
                    <div className="flex items-center gap-3">
                      🛡️
                      <div>
                        <div className="text-sm font-medium text-white/60">Detection Methods</div>
                        <div className="text-lg font-bold text-white">12+ Techniques</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-500/30">
                    <div className="flex items-center gap-3">
                      🛡️
                      <div>
                        <div className="text-sm font-medium text-white/60">Scan Speed</div>
                        <div className="text-lg font-bold text-white">{'<'} 30 Seconds</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30">
                    <div className="flex items-center gap-3">
                      🛡️
                      <div>
                        <div className="text-sm font-medium text-white/60">Accuracy Rate</div>
                        <div className="text-lg font-bold text-white">95%+</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Scan Configuration */}
                <div className="bg-surface-elevated border border-primary/20 rounded-2xl p-6 sm:p-8 shadow-lg">
                  <div className="flex items-center gap-3 mb-6">
                    🛡️
                    <h2 className="text-xl font-bold text-white">Detection Configuration</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Target IP Address or Hostname
                      </label>
                      <input
                        type="text"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder="192.168.1.100 or example.com"
                        className="w-full px-4 py-3 rounded-lg border border-primary/20 bg-black text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={scanning}
                      />
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        Enter an IP address or domain name to analyze for honeypot characteristics
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-500/30">
                      <div className="flex items-start gap-3">
                        🛡️
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          <strong className="font-bold">Legal Notice:</strong> This tool performs active reconnaissance and network analysis. 
                          Only use on systems you own or have explicit authorization to test. Unauthorized scanning may violate laws and regulations.
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={startScan}
                      disabled={!target || scanning}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-primary to-gold-light text-white font-bold hover:from-primary/90 hover:to-blue-600/90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ▶
                      {scanning ? 'Analyzing Target...' : 'Start Detection Scan'}
                    </button>
                  </div>

                  {scanning && (
                    <div className="mt-6">
                      <div className="flex justify-between text-sm text-white/60 mb-2">
                        <span className="font-medium">Analyzing target characteristics...</span>
                        <span className="font-bold">{progress}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-gold-light transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                        Running behavioral analysis, port scanning, and fingerprint detection...
                      </p>
                    </div>
                  )}
                </div>

                {/* Results Section */}
                {result && (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Status Card */}
                      <div className={`p-8 rounded-2xl border-2 shadow-xl ${
                        result.isHoneypot 
                          ? 'bg-surface-elevated border-primary/30' 
                          : 'bg-surface-elevated border-primary/30'
                      }`}>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {result.isHoneypot ? (
                              <div className="p-3 rounded-full bg-surface-elevated border border-primary/20">
                                <span className="text-2xl">⚠️</span>
                              </div>
                            ) : (
                              <div className="p-3 rounded-full bg-surface-elevated border border-primary/20">
                                <span className="text-2xl">🛡️</span>
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-white/60">Detection Status</div>
                              <div className={`text-3xl font-bold ${result.isHoneypot ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                                {result.isHoneypot ? 'HONEYPOT' : 'LEGITIMATE'}
                              </div>
                            </div>
                          </div>
                          <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase ${getRiskLevelColor(result.riskLevel)}`}>
                            {result.riskLevel} RISK
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {result.isHoneypot 
                            ? 'This target exhibits multiple honeypot characteristics and should be avoided.' 
                            : 'No honeypot indicators detected. This does not guarantee the site is secure - use other tools to assess security.'}
                        </p>
                      </div>

                      {/* Confidence & Metrics Card */}
                      <div className="p-8 rounded-2xl bg-surface-elevated border border-primary/20 shadow-xl">
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-3">
                            <div className="text-sm font-medium text-white/60">Confidence Level</div>
                            <div className="text-4xl font-bold text-primary">{result.confidence}%</div>
                          </div>
                          <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                              style={{ width: `${result.confidence}%` }}
                            />
                          </div>
                        </div>

                        {result.networkInfo && (
                          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Response Time</div>
                              <div className="text-lg font-bold text-white">{result.networkInfo.responseTime}ms</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Open Ports</div>
                              <div className="text-lg font-bold text-white">{result.networkInfo.openPorts}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500 dark:text-gray-400">Services</div>
                              <div className="text-lg font-bold text-white">{result.networkInfo.serviceFingerprints}</div>
                            </div>
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Scan Duration</div>
                          <div className="text-sm font-medium text-white">
                            {(result.scanDuration / 1000).toFixed(2)} seconds
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Security Assessment */}
                    {result.securityAssessment && (
                      <div className="bg-surface-elevated border border-primary/20 rounded-2xl p-6 sm:p-8 shadow-lg">
                        <div className="flex items-center gap-3 mb-6">
                          🔒
                          <h3 className="text-lg font-bold text-white">Security Assessment</h3>
                        </div>

                        {/* Security Score & Grade */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                          <div className="p-6 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-primary/30">
                            <div className="text-sm font-medium text-white/60 mb-2">Overall Security Score</div>
                            <div className={`text-5xl font-bold ${getSecurityGradeColor(result.securityAssessment.securityGrade)}`}>
                              {result.securityAssessment.overallScore}/100
                            </div>
                            <div className="mt-2 text-xs text-white/60">
                              Grade: <span className={`font-bold ${getSecurityGradeColor(result.securityAssessment.securityGrade)}`}>
                                {result.securityAssessment.securityGrade}
                              </span>
                            </div>
                          </div>

                          <div className="p-6 rounded-xl bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-primary/30">
                            <div className="text-sm font-medium text-white/60 mb-2">Security Level</div>
                            <div className={`text-3xl font-bold ${getSecurityGradeColor(result.securityAssessment.securityGrade)}`}>
                              {result.securityAssessment.securityLevel}
                            </div>
                            <div className="mt-3 space-y-1">
                              <div className="flex items-center gap-2 text-xs">
                                {result.securityAssessment.httpsEnabled ? '✅' : '❌'}
                                <span className="text-white/60">HTTPS {result.securityAssessment.httpsEnabled ? 'Enabled' : 'Disabled'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs">
                                {result.securityAssessment.hasValidCertificate ? '✅' : '❌'}
                                <span className="text-white/60">Valid Certificate</span>
                              </div>
                            </div>
                          </div>

                          <div className="p-6 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-primary/30">
                            <div className="text-sm font-medium text-white/60 mb-2">Vulnerabilities Found</div>
                            <div className="space-y-2">
                              {result.securityAssessment.vulnerabilities.critical > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-white/60">Critical</span>
                                  <span className="px-2 py-1 rounded-full bg-red-600 text-white text-xs font-bold">
                                    {result.securityAssessment.vulnerabilities.critical}
                                  </span>
                                </div>
                              )}
                              {result.securityAssessment.vulnerabilities.high > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-white/60">High</span>
                                  <span className="px-2 py-1 rounded-full bg-orange-600 text-white text-xs font-bold">
                                    {result.securityAssessment.vulnerabilities.high}
                                  </span>
                                </div>
                              )}
                              {result.securityAssessment.vulnerabilities.medium > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-white/60">Medium</span>
                                  <span className="px-2 py-1 rounded-full bg-yellow-600 text-white text-xs font-bold">
                                    {result.securityAssessment.vulnerabilities.medium}
                                  </span>
                                </div>
                              )}
                              {result.securityAssessment.vulnerabilities.low > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-white/60">Low</span>
                                  <span className="px-2 py-1 rounded-full bg-blue-600 text-white text-xs font-bold">
                                    {result.securityAssessment.vulnerabilities.low}
                                  </span>
                                </div>
                              )}
                              {Object.values(result.securityAssessment.vulnerabilities).every(v => v === 0) && (
                                <div className="text-green-600 dark:text-green-400 text-sm font-bold">
                                  ✅ No vulnerabilities
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Security Headers */}
                        <div className="mb-8 p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="font-bold text-white">Security Headers</h4>
                            <span className="text-sm text-white/60">
                              Score: {result.securityAssessment.securityHeaders.score}%
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {result.securityAssessment.securityHeaders.present.length > 0 && (
                              <div>
                                <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-2">
                                  ✅ Present ({result.securityAssessment.securityHeaders.present.length})
                                </div>
                                <div className="space-y-1">
                                  {result.securityAssessment.securityHeaders.present.map((header, idx) => (
                                    <div key={idx} className="text-xs text-white/60 font-mono">
                                      {header}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            {result.securityAssessment.securityHeaders.missing.length > 0 && (
                              <div>
                                <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">
                                  ❌ Missing ({result.securityAssessment.securityHeaders.missing.length})
                                </div>
                                <div className="space-y-1">
                                  {result.securityAssessment.securityHeaders.missing.map((header, idx) => (
                                    <div key={idx} className="text-xs text-white/60 font-mono">
                                      {header}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Server & Technology Information */}
                        {result.securityAssessment.serverInfo && (
                          <div className="mb-6 p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                            <h4 className="font-bold text-white mb-3">Server & Technology Stack</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs text-white/60 mb-1">Server Software</div>
                                <div className="text-sm text-white font-mono">{result.securityAssessment.serverInfo.serverSoftware}</div>
                              </div>
                              <div>
                                <div className="text-xs text-white/60 mb-1">Powered By</div>
                                <div className="text-sm text-white font-mono">{result.securityAssessment.serverInfo.poweredBy}</div>
                              </div>
                            </div>
                            {result.securityAssessment.serverInfo.technologies?.length > 0 && (
                              <div className="mt-3">
                                <div className="text-xs text-white/60 mb-2">Detected Technologies</div>
                                <div className="flex flex-wrap gap-2">
                                  {result.securityAssessment.serverInfo.technologies.map((tech, idx) => (
                                    <span key={idx} className="px-2 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium">
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {result.securityAssessment.contentAnalysis?.technologies?.length > 0 && (
                              <div className="mt-3">
                                <div className="text-xs text-white/60 mb-2">Frontend Technologies</div>
                                <div className="flex flex-wrap gap-2">
                                  {result.securityAssessment.contentAnalysis.technologies.map((tech, idx) => (
                                    <span key={idx} className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium">
                                      {tech}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Content Analysis */}
                        {result.securityAssessment.contentAnalysis && (
                          <div className="mb-6 p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                            <h4 className="font-bold text-white mb-3">Content Analysis</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="flex items-center gap-2">
                                {result.securityAssessment.contentAnalysis.hasLoginForm ? '⚠️' : '✅'}
                                <span className="text-sm text-white/80">Login Form</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {result.securityAssessment.contentAnalysis.hasFileUpload ? '⚠️' : '✅'}
                                <span className="text-sm text-white/80">File Upload</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {result.securityAssessment.contentAnalysis.hasAdminPanel ? '⚠️' : '✅'}
                                <span className="text-sm text-white/80">Admin Panel</span>
                              </div>
                            </div>
                            {result.securityAssessment.contentAnalysis.suspiciousPatterns?.length > 0 && (
                              <div className="mt-3 p-3 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30">
                                <div className="text-xs font-medium text-red-600 dark:text-red-400 mb-2">⚠️ Suspicious Patterns Detected</div>
                                {result.securityAssessment.contentAnalysis.suspiciousPatterns.map((pattern, idx) => (
                                  <div key={idx} className="text-xs text-white/80">• {pattern}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Cookie Security */}
                        {result.securityAssessment.cookieSecurity && (
                          <div className="mb-6 p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                            <h4 className="font-bold text-white mb-3">Cookie Security</h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-white/80">Secure Flag</span>
                                <span className={`text-sm font-bold ${result.securityAssessment.cookieSecurity.hasSecureFlag ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {result.securityAssessment.cookieSecurity.hasSecureFlag ? '✅ Present' : '❌ Missing'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-white/80">HttpOnly Flag</span>
                                <span className={`text-sm font-bold ${result.securityAssessment.cookieSecurity.hasHttpOnlyFlag ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {result.securityAssessment.cookieSecurity.hasHttpOnlyFlag ? '✅ Present' : '❌ Missing'}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-white/80">SameSite Attribute</span>
                                <span className={`text-sm font-bold ${result.securityAssessment.cookieSecurity.hasSameSiteFlag ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                  {result.securityAssessment.cookieSecurity.hasSameSiteFlag ? '✅ Present' : '❌ Missing'}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Compliance Status */}
                        {result.securityAssessment.complianceStatus && (
                          <div className="mb-6 p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                            <h4 className="font-bold text-white mb-3">Compliance Status</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="flex items-center gap-2">
                                {result.securityAssessment.complianceStatus.gdpr ? '✅' : '❌'}
                                <span className="text-sm text-white/80">GDPR</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {result.securityAssessment.complianceStatus.pciDss ? '✅' : '❌'}
                                <span className="text-sm text-white/80">PCI DSS</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {result.securityAssessment.complianceStatus.owasp ? '✅' : '❌'}
                                <span className="text-sm text-white/80">OWASP</span>
                              </div>
                            </div>
                            {result.securityAssessment.complianceStatus.issues?.length > 0 && (
                              <div className="mt-3 text-xs text-white/60">
                                {result.securityAssessment.complianceStatus.issues.map((issue, idx) => (
                                  <div key={idx}>• {issue}</div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Risk Factors & Positive Findings */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          {result.securityAssessment.riskFactors?.length > 0 && (
                            <div className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30">
                              <h4 className="font-bold text-red-600 dark:text-red-400 mb-3">⚠️ Risk Factors ({result.securityAssessment.riskFactors.length})</h4>
                              <div className="space-y-1">
                                {result.securityAssessment.riskFactors.slice(0, 5).map((risk, idx) => (
                                  <div key={idx} className="text-xs text-white/80">• {risk}</div>
                                ))}
                                {result.securityAssessment.riskFactors.length > 5 && (
                                  <div className="text-xs text-white/60 italic">+ {result.securityAssessment.riskFactors.length - 5} more</div>
                                )}
                              </div>
                            </div>
                          )}
                          {result.securityAssessment.positiveFindings?.length > 0 && (
                            <div className="p-6 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-500/30">
                              <h4 className="font-bold text-green-600 dark:text-green-400 mb-3">✅ Positive Findings ({result.securityAssessment.positiveFindings.length})</h4>
                              <div className="space-y-1">
                                {result.securityAssessment.positiveFindings.slice(0, 5).map((finding, idx) => (
                                  <div key={idx} className="text-xs text-white/80">• {finding}</div>
                                ))}
                                {result.securityAssessment.positiveFindings.length > 5 && (
                                  <div className="text-xs text-white/60 italic">+ {result.securityAssessment.positiveFindings.length - 5} more</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Detailed Vulnerabilities */}
                        {result.securityAssessment.vulnerabilities?.details?.length > 0 && (
                          <div className="mb-6 p-6 rounded-xl bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-500/30">
                            <h4 className="font-bold text-white mb-3">🔍 Detailed Vulnerability Analysis</h4>
                            <div className="space-y-4">
                              {result.securityAssessment.vulnerabilities.details.slice(0, 3).map((vuln, idx) => (
                                <div key={idx} className="p-3 rounded bg-white/50 dark:bg-black/20">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                      vuln.severity === 'critical' ? 'bg-red-600 text-white' :
                                      vuln.severity === 'high' ? 'bg-orange-600 text-white' :
                                      vuln.severity === 'medium' ? 'bg-yellow-600 text-white' :
                                      'bg-blue-600 text-white'
                                    }`}>
                                      {vuln.severity.toUpperCase()}
                                    </span>
                                    <span className="font-bold text-white text-sm">{vuln.title}</span>
                                  </div>
                                  <div className="text-xs text-white/80 mb-2">{vuln.description}</div>
                                  <div className="text-xs text-white/60 mb-1"><strong>Impact:</strong> {vuln.impact}</div>
                                  <div className="text-xs text-green-600 dark:text-green-400"><strong>Fix:</strong> {vuln.remediation}</div>
                                </div>
                              ))}
                              {result.securityAssessment.vulnerabilities.details.length > 3 && (
                                <div className="text-xs text-white/60 italic text-center">
                                  + {result.securityAssessment.vulnerabilities.details.length - 3} more vulnerabilities (see PDF report for full details)
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Security Recommendations */}
                        {result.securityAssessment.securityRecommendations.length > 0 && (
                          <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-primary/30">
                            <h4 className="font-bold text-white mb-3">💡 Security Recommendations</h4>
                            <div className="space-y-2">
                              {result.securityAssessment.securityRecommendations.map((rec, idx) => (
                                <div key={idx} className="text-sm text-white/80 flex items-start gap-2">
                                  <span className="mt-0.5">•</span>
                                  <span>{rec}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Detection Methods */}
                    {result.detectionMethods && result.detectionMethods.length > 0 && (
                      <div className="bg-surface-elevated border border-primary/20 rounded-2xl p-6 sm:p-8 shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                          🛡️
                          <h3 className="text-lg font-bold text-white">Detection Methods Applied</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.detectionMethods.map((method, idx) => (
                            <span 
                              key={idx}
                              className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-primary/30"
                            >
                              {method}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Indicators */}
                    <div className="bg-surface-elevated border border-primary/20 rounded-2xl p-6 sm:p-8 shadow-lg">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div className="flex items-center gap-3">
                          🛡️
                          <h3 className="text-lg font-bold text-white">
                            Detection Indicators ({result.indicators.filter(i => i.detected).length}/{result.indicators.length})
                          </h3>
                        </div>
                        <PDFExportButton
                          scanType="honeypot"
                          scanData={result}
                        />
                      </div>

                      <div className="space-y-4">
                        {result.indicators.map((indicator, idx) => (
                          <div
                            key={idx}
                            className={`p-5 rounded-xl border-2 transition-all ${
                              indicator.detected
                                ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-500/30'
                                : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                              <div className="flex items-start gap-3 flex-1">
                                <div className={`mt-1 ${indicator.detected ? 'text-primary' : 'text-gray-400'}`}>
                                  {indicator.detected ? '⚠️' : '✓'}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-bold text-white text-lg mb-1">{indicator.type}</h4>
                                  <p className="text-sm text-white/60">{indicator.description}</p>
                                  {indicator.details && (
                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2 italic">{indicator.details}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getSeverityColor(indicator.severity)}`}>
                                  {indicator.severity}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                  Score: {indicator.score}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommendation */}
                    <div className={`p-8 rounded-2xl border-2 shadow-xl ${
                      result.isHoneypot 
                        ? 'bg-surface-elevated border-primary/30' 
                        : 'bg-surface-elevated border-primary/30'
                    }`}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl">{result.isHoneypot ? '⚠️' : '🛡️'}</span>
                        <h3 className="text-lg font-bold text-white">Security Recommendation</h3>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{result.recommendation}</p>
                    </div>
                  </>
                )}
              </div>
            </main>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
