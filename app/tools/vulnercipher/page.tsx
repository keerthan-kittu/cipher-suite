'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { PDFExportButton } from '../../components/PDFExportButton';
import SolutionButton from '../../components/SolutionButton';
import { calculateSecurityScore } from '@/lib/utils/security-score';

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
  const [showContinuePrompt, setShowContinuePrompt] = useState(false);
  const [scanStartTime, setScanStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const startScan = async (continueFromPrompt = false) => {
    if (!target && !continueFromPrompt) return;
    
    if (!continueFromPrompt) {
      setScanning(true);
      setProgress(0);
      setVulnerabilities([]);
      setScanComplete(false);
      setShowContinuePrompt(false);
      const startTime = Date.now();
      setScanStartTime(startTime);
      
      // Timer to track elapsed time
      const timerInterval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      // Show continue prompt after 30 seconds
      const promptTimeout = setTimeout(() => {
        setShowContinuePrompt(true);
        clearInterval(timerInterval);
      }, 30000);

      // Simulate progress while waiting for API
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 90));
      }, 800);

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
        clearInterval(timerInterval);
        clearTimeout(promptTimeout);
        setProgress(100);

        if (result.success && result.data) {
          // Display vulnerabilities progressively with animation
          const vulns = result.data.vulnerabilities;
          setVulnerabilities([]);
          
          // Add vulnerabilities one by one for smooth animation
          for (let i = 0; i < vulns.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            setVulnerabilities(prev => [...prev, vulns[i]]);
          }
          
          setScanComplete(true);
          setShowContinuePrompt(false);
          
          // Automatically save to reports
          try {
            await fetch('/api/reports', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                tool: 'Vulnercipher',
                target,
                findings: vulns.length,
                data: result.data,
              }),
            });
          } catch (reportError) {
            console.error('Failed to save report:', reportError);
          }
        } else {
          alert(`Scan failed: ${result.error || 'Unknown error'}`);
        }
      } catch (error: unknown) {
        clearInterval(progressInterval);
        clearInterval(timerInterval);
        clearTimeout(promptTimeout);
        alert(`Scan failed: ${error instanceof Error ? error.message : 'Network error'}`);
      } finally {
        setScanning(false);
      }
    } else {
      // User chose to continue scanning
      setShowContinuePrompt(false);
      setScanning(true);
      
      const startTime = Date.now();
      
      // Timer to track elapsed time
      const timerInterval = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 5, 100));
      }, 800);

      try {
        // Continue with deep scan
        const response = await fetch('/api/scan/vulnercipher', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ target, deepScan: true }),
        });

        const result = await response.json();

        clearInterval(progressInterval);
        clearInterval(timerInterval);
        setProgress(100);

        if (result.success && result.data) {
          // Add new vulnerabilities progressively
          const newVulns = result.data.vulnerabilities.filter(
            (v: Vulnerability) => !vulnerabilities.some(existing => existing.id === v.id)
          );
          
          for (let i = 0; i < newVulns.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 100));
            setVulnerabilities(prev => [...prev, newVulns[i]]);
          }
          
          setScanComplete(true);
        } else {
          alert(`Scan failed: ${result.error || 'Unknown error'}`);
        }
      } catch (error: unknown) {
        clearInterval(progressInterval);
        clearInterval(timerInterval);
        alert(`Scan failed: ${error instanceof Error ? error.message : 'Network error'}`);
      } finally {
        setScanning(false);
      }
    }
  };

  const stopScan = () => {
    setScanning(false);
    setShowContinuePrompt(false);
    setScanComplete(true);
    setProgress(100);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-severity-critical bg-severity-critical/10 border-severity-critical/30';
      case 'high': return 'text-severity-high bg-severity-high/10 border-severity-high/30';
      case 'medium': return 'text-severity-medium bg-severity-medium/10 border-severity-medium/30';
      case 'low': return 'text-severity-low bg-severity-low/10 border-severity-low/30';
      default: return 'text-white/50 bg-white/5 border-white/20';
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
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center size-16 rounded-xl bg-primary/10 text-primary border border-primary/20">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-primary">Vulnercipher</h1>
                    <p className="text-white/60 mt-1">AI-Powered Vulnerability Scanner</p>
                  </div>
                </div>

                <div className="bg-surface-elevated border border-primary/20 rounded-2xl p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-white mb-4">Scan Configuration</h2>
                  
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
                        className="w-full px-4 py-3 rounded-lg border border-primary/20 bg-black text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={scanning}
                      />
                    </div>

                    <div className="flex items-center gap-3 p-4 rounded-lg bg-surface-dark border border-primary/20">
                      <input
                        type="checkbox"
                        id="deepScan"
                        checked={deepScan}
                        onChange={(e) => setDeepScan(e.target.checked)}
                        disabled={scanning}
                        className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
                      />
                      <label htmlFor="deepScan" className="flex-1 cursor-pointer">
                        <div className="font-medium text-white">Deep Scan</div>
                        <div className="text-sm text-white/60">
                          Perform additional checks for information disclosure, debug info, and default pages (takes longer)
                        </div>
                      </label>
                    </div>

                    <button
                      onClick={() => void startScan(false)}
                      disabled={!target || scanning}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-bold hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ▶
                      {scanning ? 'Scanning...' : 'Start Scan'}
                    </button>
                  </div>

                  {scanning && (
                    <div className="mt-6">
                      <div className="flex justify-between text-sm text-white/60 mb-2">
                        <span>Scanning in progress... ({elapsedTime}s elapsed)</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-surface-dark rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {showContinuePrompt && (
                    <div className="mt-6 p-6 rounded-lg bg-primary/10 border-2 border-primary animate-pulse">
                      <div className="flex items-start gap-4">
                        <svg className="w-8 h-8 text-primary flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-white mb-2">Scan Taking Longer Than Expected</h3>
                          <p className="text-white/80 mb-4">
                            The scan has been running for 30 seconds. We've found <span className="font-bold text-primary">{vulnerabilities.length} vulnerabilities</span> so far.
                            Would you like to continue scanning for more issues, or stop here?
                          </p>
                          <div className="flex gap-3">
                            <button
                              onClick={() => void startScan(true)}
                              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/80 transition-all"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Continue Scanning
                            </button>
                            <button
                              onClick={() => stopScan()}
                              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-surface-dark text-white font-bold hover:bg-surface-dark/80 transition-all border border-primary/30"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Stop & View Results
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Display vulnerabilities in real-time as they're detected */}
                {vulnerabilities.length > 0 && !scanComplete && (
                  <div className="bg-surface-elevated border border-primary/20 rounded-2xl p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="animate-pulse">
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      <h2 className="text-xl font-bold text-white">
                        Vulnerabilities Detected ({vulnerabilities.length})
                      </h2>
                      <span className="text-sm text-white/60">Scanning...</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                      <div className="p-4 rounded-lg bg-severity-critical/10 border border-severity-critical/30">
                        <div className="text-2xl font-bold text-severity-critical">
                          {vulnerabilities.filter(v => v.severity === 'critical').length}
                        </div>
                        <div className="text-sm text-white/60">Critical</div>
                      </div>
                      <div className="p-4 rounded-lg bg-severity-high/10 border border-severity-high/30">
                        <div className="text-2xl font-bold text-severity-high">
                          {vulnerabilities.filter(v => v.severity === 'high').length}
                        </div>
                        <div className="text-sm text-white/60">High</div>
                      </div>
                      <div className="p-4 rounded-lg bg-severity-medium/10 border border-severity-medium/30">
                        <div className="text-2xl font-bold text-severity-medium">
                          {vulnerabilities.filter(v => v.severity === 'medium').length}
                        </div>
                        <div className="text-sm text-white/60">Medium</div>
                      </div>
                      <div className="p-4 rounded-lg bg-severity-low/10 border border-severity-low/30">
                        <div className="text-2xl font-bold text-severity-low">
                          {vulnerabilities.filter(v => v.severity === 'low').length}
                        </div>
                        <div className="text-sm text-white/60">Low</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {vulnerabilities.map((vuln, index) => (
                        <div
                          key={vuln.id}
                          className="p-4 sm:p-6 rounded-lg border border-primary/20 bg-surface-dark animate-fade-in"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                            <h3 className="text-lg font-bold text-white">{vuln.title}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getSeverityColor(vuln.severity)}`}>
                              {vuln.severity}
                            </span>
                          </div>
                          
                          <div className="space-y-3 text-sm">
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Description: </span>
                              <p className="text-white/60 mt-1">{vuln.description}</p>
                            </div>
                            
                            {vuln.cause && (
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Root Cause: </span>
                                <p className="text-white/60 mt-1">{vuln.cause}</p>
                              </div>
                            )}
                            
                            <div>
                              <span className="font-medium text-gray-700 dark:text-gray-300">Affected: </span>
                              <span className="text-white/60">{vuln.affected}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {scanComplete && (
                  <>
                    <div className="bg-surface-elevated border border-primary/20 rounded-2xl p-6 sm:p-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h2 className="text-xl font-bold text-white">Scan Results</h2>
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

                      {/* Security Score */}
                      {(() => {
                        const summary = {
                          total: vulnerabilities.length,
                          critical: vulnerabilities.filter(v => v.severity === 'critical').length,
                          high: vulnerabilities.filter(v => v.severity === 'high').length,
                          medium: vulnerabilities.filter(v => v.severity === 'medium').length,
                          low: vulnerabilities.filter(v => v.severity === 'low').length,
                        };
                        const securityScore = calculateSecurityScore(summary);
                        
                        return (
                          <div className="mb-6 p-6 rounded-xl bg-gradient-to-br from-surface-dark to-surface-elevated border-2 border-primary/30">
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                              <div className="flex-1 text-center sm:text-left">
                                <h3 className="text-lg font-semibold text-white/80 mb-2">Security Score</h3>
                                <div className="flex items-baseline gap-3 justify-center sm:justify-start">
                                  <span className="text-6xl font-bold" style={{ color: securityScore.color }}>
                                    {securityScore.score}
                                  </span>
                                  <span className="text-3xl font-bold text-white/60">/100</span>
                                </div>
                                <div className="mt-2 flex items-center gap-3 justify-center sm:justify-start">
                                  <span 
                                    className="px-4 py-1 rounded-full text-lg font-bold"
                                    style={{ 
                                      backgroundColor: `${securityScore.color}20`,
                                      color: securityScore.color,
                                      border: `2px solid ${securityScore.color}40`
                                    }}
                                  >
                                    Grade {securityScore.grade}
                                  </span>
                                  <span className="text-lg font-semibold text-white/80">
                                    {securityScore.rating}
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1">
                                <div className="relative w-32 h-32 mx-auto">
                                  <svg className="transform -rotate-90 w-32 h-32">
                                    <circle
                                      cx="64"
                                      cy="64"
                                      r="56"
                                      stroke="rgba(255,255,255,0.1)"
                                      strokeWidth="12"
                                      fill="none"
                                    />
                                    <circle
                                      cx="64"
                                      cy="64"
                                      r="56"
                                      stroke={securityScore.color}
                                      strokeWidth="12"
                                      fill="none"
                                      strokeDasharray={`${(securityScore.score / 100) * 351.86} 351.86`}
                                      strokeLinecap="round"
                                      className="transition-all duration-1000"
                                    />
                                  </svg>
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-2xl font-bold text-white">{securityScore.score}%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                        <div className="p-4 rounded-lg bg-severity-critical/10 border border-severity-critical/30">
                          <div className="text-2xl font-bold text-severity-critical">
                            {vulnerabilities.filter(v => v.severity === 'critical').length}
                          </div>
                          <div className="text-sm text-white/60">Critical</div>
                        </div>
                        <div className="p-4 rounded-lg bg-severity-high/10 border border-severity-high/30">
                          <div className="text-2xl font-bold text-severity-high">
                            {vulnerabilities.filter(v => v.severity === 'high').length}
                          </div>
                          <div className="text-sm text-white/60">High</div>
                        </div>
                        <div className="p-4 rounded-lg bg-severity-medium/10 border border-severity-medium/30">
                          <div className="text-2xl font-bold text-severity-medium">
                            {vulnerabilities.filter(v => v.severity === 'medium').length}
                          </div>
                          <div className="text-sm text-white/60">Medium</div>
                        </div>
                        <div className="p-4 rounded-lg bg-severity-low/10 border border-severity-low/30">
                          <div className="text-2xl font-bold text-severity-low">
                            {vulnerabilities.filter(v => v.severity === 'low').length}
                          </div>
                          <div className="text-sm text-white/60">Low</div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {vulnerabilities.map((vuln) => (
                          <div
                            key={vuln.id}
                            className="p-4 sm:p-6 rounded-lg border border-primary/20 bg-surface-dark"
                          >
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                              <h3 className="text-lg font-bold text-white">{vuln.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getSeverityColor(vuln.severity)}`}>
                                {vuln.severity}
                              </span>
                            </div>
                            
                            <div className="space-y-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Description: </span>
                                <p className="text-white/60 mt-1">{vuln.description}</p>
                              </div>
                              
                              {vuln.cause && (
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">Root Cause: </span>
                                  <p className="text-white/60 mt-1">{vuln.cause}</p>
                                </div>
                              )}
                              
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Affected: </span>
                                <span className="text-white/60">{vuln.affected}</span>
                              </div>
                              
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Recommendation: </span>
                                <p className="text-white/60 mt-1">{vuln.recommendation}</p>
                              </div>
                              
                              {vuln.hasSolution && (
                                <SolutionButton 
                                  vulnerabilityId={vuln.id}
                                  vulnerabilityName={vuln.title}
                                  description={vuln.description}
                                  severity={vuln.severity}
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
