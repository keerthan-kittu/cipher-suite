'use client';

import React, { useState } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { PDFExportButton } from '@/app/components/PDFExportButton';
import { Hub, PlayArrow, Download } from '@mui/icons-material';

interface Port {
  port: number;
  protocol: string;
  state: string;
  service: string;
  version: string;
}

interface ScanResult {
  host: string;
  status: string;
  openPorts: Port[];
  os: string;
  latency: string;
}

export default function NMapPage() {
  const [target, setTarget] = useState('');
  const [scanType, setScanType] = useState('quick');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);

  const mockResult: ScanResult = {
    host: '192.168.1.1',
    status: 'up',
    openPorts: [
      { port: 22, protocol: 'tcp', state: 'open', service: 'ssh', version: 'OpenSSH 8.2' },
      { port: 80, protocol: 'tcp', state: 'open', service: 'http', version: 'nginx 1.18.0' },
      { port: 443, protocol: 'tcp', state: 'open', service: 'https', version: 'nginx 1.18.0' },
      { port: 3306, protocol: 'tcp', state: 'open', service: 'mysql', version: 'MySQL 8.0.23' },
      { port: 8080, protocol: 'tcp', state: 'open', service: 'http-proxy', version: 'Squid 4.10' },
    ],
    os: 'Linux 5.4.0',
    latency: '2.45ms'
  };

  const startScan = async () => {
    if (!target) return;
    
    setScanning(true);
    setProgress(0);
    setResult(null);

    // Simulate progress while waiting for API
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 12, 90));
    }, 400);

    try {
      // Call real API
      const response = await fetch('/api/scan/nmap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ target, scanType }),
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
      scanType,
      ...result
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nmap-scan-${Date.now()}.json`;
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
                    <Hub className="text-3xl" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">NMap Scanner</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Network Discovery & Port Scanning</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-surface-dark border border-gray-300 dark:border-white/10 rounded-2xl p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Scan Configuration</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Target Host or Network
                      </label>
                      <input
                        type="text"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder="192.168.1.1 or 192.168.1.0/24"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-background-dark text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={scanning}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Scan Type
                      </label>
                      <select
                        value={scanType}
                        onChange={(e) => setScanType(e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-background-dark text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={scanning}
                      >
                        <option value="quick">Quick Scan (Top 100 ports)</option>
                        <option value="full">Full Scan (All 65535 ports)</option>
                        <option value="stealth">Stealth Scan (SYN)</option>
                        <option value="aggressive">Aggressive Scan (OS + Version)</option>
                      </select>
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
                        <span>Scanning network...</span>
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
                  <div className="bg-white dark:bg-surface-dark border border-gray-300 dark:border-white/10 rounded-2xl p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Scan Results</h2>
                      <PDFExportButton
                        scanType="nmap"
                        scanData={{
                          host: result.host,
                          scanDate: new Date().toISOString(),
                          scanType,
                          status: result.status,
                          openPorts: result.openPorts,
                          os: result.os,
                          latency: result.latency
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Host Status</div>
                        <div className="text-xl font-bold text-green-500 uppercase">{result.status}</div>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Open Ports</div>
                        <div className="text-xl font-bold text-blue-500">{result.openPorts.length}</div>
                      </div>
                      <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Latency</div>
                        <div className="text-xl font-bold text-purple-500">{result.latency}</div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Host Information</h3>
                      <div className="p-4 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-white/10">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Host: </span>
                            <span className="text-gray-600 dark:text-gray-400">{result.host}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">OS: </span>
                            <span className="text-gray-600 dark:text-gray-400">{result.os}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Open Ports</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-300 dark:border-white/10">
                              <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Port</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Protocol</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">State</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Service</th>
                              <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">Version</th>
                            </tr>
                          </thead>
                          <tbody>
                            {result.openPorts.map((port, idx) => (
                              <tr key={idx} className="border-b border-gray-200 dark:border-white/5">
                                <td className="py-3 px-4 text-gray-900 dark:text-white font-mono">{port.port}</td>
                                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{port.protocol}</td>
                                <td className="py-3 px-4">
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                                    {port.state}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{port.service}</td>
                                <td className="py-3 px-4 text-gray-600 dark:text-gray-400 font-mono text-xs">{port.version}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
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
