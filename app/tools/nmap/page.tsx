'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { PDFExportButton } from '../../components/PDFExportButton';

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
        
        // Automatically save to reports
        try {
          await fetch('/api/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tool: 'NMap',
              target,
              findings: result.data.openPorts?.length || 0,
              data: result.data,
            }),
          });
        } catch (reportError) {
          console.error('Failed to save report:', reportError);
        }
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
                      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-primary">NMap Scanner</h1>
                    <p className="text-white/60 mt-1">Network Discovery & Port Scanning</p>
                  </div>
                </div>

                <div className="bg-surface-elevated border border-primary/20 rounded-2xl p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-white mb-4">Scan Configuration</h2>
                  
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
                        className="w-full px-4 py-3 rounded-lg border border-primary/20 bg-black text-white focus:outline-none focus:ring-2 focus:ring-primary"
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
                        className="w-full px-4 py-3 rounded-lg border border-primary/20 bg-black text-white focus:outline-none focus:ring-2 focus:ring-primary"
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
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-bold hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ▶
                      {scanning ? 'Scanning...' : 'Start Scan'}
                    </button>
                  </div>

                  {scanning && (
                    <div className="mt-6">
                      <div className="flex justify-between text-sm text-white/60 mb-2">
                        <span>Scanning network...</span>
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
                </div>

                {result && (
                  <div className="bg-surface-elevated border border-primary/20 rounded-2xl p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <h2 className="text-xl font-bold text-white">Scan Results</h2>
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
                      <div className="p-4 rounded-lg bg-primary/10 border border-green-500/20">
                        <div className="text-sm text-white/60 mb-1">Host Status</div>
                        <div className="text-xl font-bold text-primary uppercase">{result.status}</div>
                      </div>
                      <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                        <div className="text-sm text-white/60 mb-1">Open Ports</div>
                        <div className="text-xl font-bold text-primary">{result.openPorts.length}</div>
                      </div>
                      <div className="p-4 rounded-lg bg-primary/10 border border-purple-500/20">
                        <div className="text-sm text-white/60 mb-1">Latency</div>
                        <div className="text-xl font-bold text-purple-500">{result.latency}</div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-lg font-bold text-white mb-2">Host Information</h3>
                      <div className="p-4 rounded-lg bg-surface-dark border border-primary/20">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">Host: </span>
                            <span className="text-white/60">{result.host}</span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700 dark:text-gray-300">OS: </span>
                            <span className="text-white/60">{result.os}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white mb-4">Open Ports</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-primary/20">
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
                                <td className="py-3 px-4 text-white font-mono">{port.port}</td>
                                <td className="py-3 px-4 text-white/60">{port.protocol}</td>
                                <td className="py-3 px-4">
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-green-500/20">
                                    {port.state}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-white/60">{port.service}</td>
                                <td className="py-3 px-4 text-white/60 font-mono text-xs">{port.version}</td>
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
