'use client';

import React, { useState } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { PDFExportButton } from '@/app/components/PDFExportButton';
import SolutionButton from '@/app/components/SolutionButton';
import { Scanner, PlayArrow, Download, Warning, CheckCircle, Error } from '@mui/icons-material';

interface Vulnerability {
  id: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  cause?: string;
  affected: string;
  recommendation: string;
  hasSolution?: boolean;
}

export default function VulnercipherPage() {
  const [target, setTarget] = useState('');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [scanComplete, setScanComplete] = useState(false);
  const [deepScan, setDeepScan] = useState(false);

  const mockVulnerabilities: Vulnerability[] = [
    {
      id: '1',
      severity: 'critical',
      title: 'SQL Injection Vulnerability',
      description: 'Unvalidated user input in login form allows SQL injection attacks',
      affected: '/api/auth/login',
      recommendation: 'Use parameterized queries and input validation'
    },
    {
      id: '2',
      severity: 'high',
      title: 'Cross-Site Scripting (XSS)',
      description: 'User input not properly sanitized in comment section',
      affected: '/comments',
      recommendation: 'Implement proper output encoding and CSP headers'
    },
    {
      id: '3',
      severity: 'medium',
      title: 'Outdated Dependencies',
      description: 'Multiple npm packages with known vulnerabilities detected',
      affected: 'package.json',
      recommendation: 'Update dependencies to latest secure versions'
    },
    {
      id: '4',
      severity: 'low',
      title: 'Missing Security Headers',
      description: 'X-Frame-Options and X-Content-Type-Options headers not set',
      affected: 'Server configuration',
      recommendation: 'Configure security headers in web server'
    }
  ];

  const startScan = async () => {
    if (!target) return;
    
    setScanning(true);
    setProgress(0);
    setVulnerabilities([]);
    setScanComplete(false);

    // Simulate progress while waiting for API
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 15, 90));
    }, 300);

    try {
      // Call real API with deep scan option
      const response = await fetch('/api/scan/vulnercipher', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target, deepScan }),
      });

      const result = await response.json();

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success && result.data) {
        setVulnerabilities(result.data.vulnerabilities);
        setScanComplete(true);
      } else {
        alert(`Scan failed: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      clearInterval(progressInterval);
      alert(`Scan failed: ${error instanceof Error ? error.message : 'Network error'}`);
    } finally {
      setScanning(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const exportReport = () => {
    const report = {
      target,
      scanDate: new Date().toISOString(),
      vulnerabilities,
      summary: {
        total: vulnerabilities.length,
        critical: vulnerabilities.filter(v => v.severity === 'critical').length,
        high: vulnerabilities.filter(v => v.severity === 'high').length,
        medium: vulnerabilities.filter(v => v.severity === 'medium').length,
        low: vulnerabilities.filter(v => v.severity === 'low').length,
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vulnercipher-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url); // Fix memory leak
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-white dark:bg-background-dark">
      <div className="flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 sm:px-4 md:px-8 lg:px-20 xl:px-40">
          <div className="flex w-full max-w-7xl flex-1 flex-col">
            <Header />

            <main className="flex-grow p-4 sm:p-6 md:p-12 lg:p-16">
              <div className="flex flex-col gap-8">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center size-16 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <Scanner className="text-3xl" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Vulnercipher</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">AI-Powered Vulnerability Scanner</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-surface-dark border border-gray-300 dark:border-white/10 rounded-2xl p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Scan Configuration</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Target URL or IP Address
                      </label>
                      <input
                        type="text"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder="https://example.com or 192.168.1.1"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-background-dark text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={scanning}
                      />
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-white/10">
                      <input
                        type="checkbox"
                        id="deepScan"
                        checked={deepScan}
                        onChange={(e) => setDeepScan(e.target.checked)}
                        disabled={scanning}
                        className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <label htmlFor="deepScan" className="flex-1 cursor-pointer">
                        <div className="font-medium text-gray-900 dark:text-white">Deep Scan</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Perform additional checks for information disclosure, debug info, and default pages (takes longer)
                        </div>
                      </label>
                    </div>

                    <button
                      onClick={startScan}
                      disabled={!target || scanning}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PlayArrow />
                      {scanning ? 'Scanning...' : 'Start Scan'}
                    </button>
                  </div>

                  {scanning && (
                    <div className="mt-6">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Scanning in progress...</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {scanComplete && (
                  <>
                    <div className="bg-white dark:bg-surface-dark border border-gray-300 dark:border-white/10 rounded-2xl p-6 sm:p-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Scan Results</h2>
                        <PDFExportButton
                          scanType="vulnercipher"
                          scanData={{
                            target,
                            scanDate: new Date().toISOString(),
                            vulnerabilities,
                            summary: {
                              total: vulnerabilities.length,
                              critical: vulnerabilities.filter(v => v.severity === 'critical').length,
                              high: vulnerabilities.filter(v => v.severity === 'high').length,
                              medium: vulnerabilities.filter(v => v.severity === 'medium').length,
                              low: vulnerabilities.filter(v => v.severity === 'low').length,
                            }
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                          <div className="text-2xl font-bold text-red-500">
                            {vulnerabilities.filter(v => v.severity === 'critical').length}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Critical</div>
                        </div>
                        <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                          <div className="text-2xl font-bold text-orange-500">
                            {vulnerabilities.filter(v => v.severity === 'high').length}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">High</div>
                        </div>
                        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                          <div className="text-2xl font-bold text-yellow-500">
                            {vulnerabilities.filter(v => v.severity === 'medium').length}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Medium</div>
                        </div>
                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <div className="text-2xl font-bold text-blue-500">
                            {vulnerabilities.filter(v => v.severity === 'low').length}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Low</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {vulnerabilities.map((vuln) => (
                          <div
                            key={vuln.id}
                            className="p-4 sm:p-6 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-background-dark"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{vuln.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getSeverityColor(vuln.severity)}`}>
                                {vuln.severity}
                              </span>
                            </div>
                            
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Description: </span>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">{vuln.description}</p>
                              </div>
                              
                              {vuln.cause && (
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">Root Cause: </span>
                                  <p className="text-gray-600 dark:text-gray-400 mt-1">{vuln.cause}</p>
                                </div>
                              )}
                              
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Affected: </span>
                                <span className="text-gray-600 dark:text-gray-400">{vuln.affected}</span>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Recommendation: </span>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">{vuln.recommendation}</p>
                              </div>
                              
                              {vuln.hasSolution && (
                                <SolutionButton 
                                  vulnerabilityId={vuln.id}
                                  vulnerabilityName={vuln.title}
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
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
