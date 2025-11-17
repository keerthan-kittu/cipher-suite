'use client';

import React, { useState } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { PDFExportButton } from '@/app/components/PDFExportButton';
import { BugReport, PlayArrow, Download, Warning, CheckCircle } from '@mui/icons-material';

interface HoneypotIndicator {
  type: string;
  severity: 'high' | 'medium' | 'low';
  description: string;
  detected: boolean;
}

interface DetectionResult {
  target: string;
  isHoneypot: boolean;
  confidence: number;
  indicators: HoneypotIndicator[];
  recommendation: string;
}

export default function HoneypotPage() {
  const [target, setTarget] = useState('');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<DetectionResult | null>(null);

  const mockResult: DetectionResult = {
    target: '192.168.1.100',
    isHoneypot: true,
    confidence: 87,
    indicators: [
      {
        type: 'Unusual Port Behavior',
        severity: 'high',
        description: 'All ports appear open with identical responses',
        detected: true
      },
      {
        type: 'Service Fingerprint Mismatch',
        severity: 'high',
        description: 'Service banners do not match expected signatures',
        detected: true
      },
      {
        type: 'Response Time Anomaly',
        severity: 'medium',
        description: 'Consistent response times across all services (artificial)',
        detected: true
      },
      {
        type: 'Fake Service Versions',
        severity: 'medium',
        description: 'Outdated or non-existent service versions advertised',
        detected: true
      },
      {
        type: 'Network Topology',
        severity: 'low',
        description: 'Isolated network segment with no legitimate traffic',
        detected: false
      }
    ],
    recommendation: 'HIGH RISK: This target exhibits multiple honeypot characteristics. Avoid interaction to prevent detection and logging of your activities.'
  };

  const startScan = async () => {
    if (!target) return;
    
    setScanning(true);
    setProgress(0);
    setResult(null);

    // Simulate progress while waiting for API
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 13, 90));
    }, 350);

    try {
      // Call real API
      const response = await fetch('/api/scan/honeypot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target }),
      });

      const result = await response.json();

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success && result.data) {
        setResult(result.data);
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

  const exportReport = () => {
    if (!result) return;

    const report = {
      scanDate: new Date().toISOString(),
      ...result
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `honeypot-detection-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url); // Fix memory leak
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'low': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
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
                    <BugReport className="text-3xl" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Honeypot Detection</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Identify Network Decoys & Traps</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-surface-dark border border-gray-300 dark:border-white/10 rounded-2xl p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Detection Configuration</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Target IP Address
                      </label>
                      <input
                        type="text"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder="192.168.1.100"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-background-dark text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={scanning}
                      />
                    </div>

                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="flex items-start gap-3">
                        <Warning className="text-yellow-500 mt-0.5" />
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          <strong>Warning:</strong> This tool performs active reconnaissance. Use only on authorized targets. Unauthorized scanning may be illegal.
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={startScan}
                      disabled={!target || scanning}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PlayArrow />
                      {scanning ? 'Analyzing...' : 'Start Detection'}
                    </button>
                  </div>

                  {scanning && (
                    <div className="mt-6">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Analyzing target characteristics...</span>
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

                {result && (
                  <>
                    <div className="bg-white dark:bg-surface-dark border border-gray-300 dark:border-white/10 rounded-2xl p-6 sm:p-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Detection Results</h2>
                        <PDFExportButton
                          scanType="honeypot"
                          scanData={{
                            target: result.target,
                            scanDate: new Date().toISOString(),
                            isHoneypot: result.isHoneypot,
                            confidence: result.confidence,
                            indicators: result.indicators,
                            recommendation: result.recommendation
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className={`p-6 rounded-lg border ${result.isHoneypot ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
                          <div className="flex items-center gap-3 mb-2">
                            {result.isHoneypot ? (
                              <Warning className="text-red-500 text-3xl" />
                            ) : (
                              <CheckCircle className="text-green-500 text-3xl" />
                            )}
                            <div>
                              <div className="text-sm text-gray-600 dark:text-gray-400">Status</div>
                              <div className={`text-2xl font-bold ${result.isHoneypot ? 'text-red-500' : 'text-green-500'}`}>
                                {result.isHoneypot ? 'HONEYPOT DETECTED' : 'LEGITIMATE TARGET'}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-6 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Confidence Level</div>
                          <div className="flex items-end gap-2">
                            <div className="text-4xl font-bold text-blue-500">{result.confidence}%</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">certainty</div>
                          </div>
                          <div className="mt-3 w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 transition-all duration-300"
                              style={{ width: `${result.confidence}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Detection Indicators</h3>
                        <div className="space-y-3">
                          {result.indicators.map((indicator, idx) => (
                            <div
                              key={idx}
                              className="p-4 rounded-lg border border-gray-300 dark:border-white/10 bg-gray-50 dark:bg-background-dark"
                            >
                              <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-2">
                                <div className="flex items-center gap-3">
                                  {indicator.detected ? (
                                    <CheckCircle className="text-red-500" />
                                  ) : (
                                    <CheckCircle className="text-gray-400" />
                                  )}
                                  <h4 className="font-bold text-gray-900 dark:text-white">{indicator.type}</h4>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getSeverityColor(indicator.severity)}`}>
                                  {indicator.severity}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 ml-9">{indicator.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={`p-6 rounded-lg border ${result.isHoneypot ? 'bg-red-500/10 border-red-500/20' : 'bg-green-500/10 border-green-500/20'}`}>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Recommendation</h3>
                        <p className="text-gray-700 dark:text-gray-300">{result.recommendation}</p>
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
