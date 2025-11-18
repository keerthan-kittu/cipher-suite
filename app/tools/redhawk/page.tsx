'use client';

import React, { useState } from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { PDFExportButton } from '@/app/components/PDFExportButton';
import { Search, PlayArrow, Download, Language, Dns, Security, Code } from '@mui/icons-material';

interface RedhawkResult {
  domain: string;
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
  ports?: any[];
  ssl?: any;
  geolocation?: {
    country?: string;
    region?: string;
    city?: string;
    isp?: string;
    asn?: string;
    timezone?: string;
  };
  emailAddresses?: string[];
  socialMedia?: { [key: string]: string };
  cms?: {
    name?: string;
    version?: string;
    plugins?: string[];
    themes?: string[];
  };
  serverInfo?: {
    server?: string;
    poweredBy?: string;
    framework?: string;
    language?: string;
    os?: string;
  };
  performance?: {
    responseTime: number;
    pageSize: number;
    loadTime: number;
  };
}

export default function RedhawkPage() {
  const [target, setTarget] = useState('');
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<RedhawkResult | null>(null);

  const mockResult: RedhawkResult = {
    domain: 'example.com',
    ip: '93.184.216.34',
    whois: {
      registrar: 'IANA',
      createdDate: '1995-08-14',
      expiryDate: '2025-08-13',
      nameServers: ['a.iana-servers.net', 'b.iana-servers.net']
    },
    dns: {
      A: ['93.184.216.34'],
      MX: ['mail.example.com'],
      NS: ['a.iana-servers.net', 'b.iana-servers.net'],
      TXT: ['v=spf1 -all']
    },
    technologies: ['Nginx', 'PHP 8.1', 'MySQL', 'WordPress 6.4', 'Cloudflare'],
    headers: {
      'Server': 'nginx/1.18.0',
      'X-Powered-By': 'PHP/8.1.0',
      'Content-Type': 'text/html; charset=UTF-8',
      'X-Frame-Options': 'SAMEORIGIN',
      'Strict-Transport-Security': 'max-age=31536000'
    },
    subdomains: ['www.example.com', 'mail.example.com', 'ftp.example.com', 'api.example.com', 'cdn.example.com']
  };

  const startScan = async () => {
    if (!target) return;
    
    setScanning(true);
    setProgress(0);
    setResult(null);

    // Simulate progress while waiting for API
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 450);

    try {
      // Call real API
      const response = await fetch('/api/scan/redhawk', {
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
        console.log('RedHawk scan result:', result.data);
        console.log('Geolocation:', result.data.geolocation);
        console.log('Server Info:', result.data.serverInfo);
        console.log('CMS:', result.data.cms);
        console.log('Email Addresses:', result.data.emailAddresses);
        console.log('Social Media:', result.data.socialMedia);
        console.log('Performance:', result.data.performance);
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
    a.download = `redhawk-report-${Date.now()}.json`;
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
                    <Search className="text-3xl" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">RedHawk</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Web Application Intelligence Gathering</p>
                  </div>
                </div>

                <div className="bg-white dark:bg-surface-dark border border-gray-300 dark:border-white/10 rounded-2xl p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Target Configuration</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Target Domain
                      </label>
                      <input
                        type="text"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder="example.com"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-background-dark text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={scanning}
                      />
                    </div>

                    <button
                      onClick={startScan}
                      disabled={!target || scanning}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <PlayArrow />
                      {scanning ? 'Gathering Intelligence...' : 'Start Analysis'}
                    </button>
                  </div>

                  {scanning && (
                    <div className="mt-6">
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Analyzing target...</span>
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
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Intelligence Report</h2>
                        <PDFExportButton
                          scanType="redhawk"
                          scanData={{
                            domain: result.domain,
                            scanDate: new Date().toISOString(),
                            ip: result.ip,
                            whois: result.whois,
                            dns: result.dns,
                            technologies: result.technologies,
                            headers: result.headers,
                            subdomains: result.subdomains
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Domain</div>
                          <div className="text-lg font-bold text-blue-500">{result.domain}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">IP Address</div>
                          <div className="text-lg font-bold text-green-500 font-mono">{result.ip}</div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* WHOIS Information */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Language className="text-primary" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">WHOIS Information</h3>
                          </div>
                          <div className="p-4 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-white/10">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Registrar: </span>
                                <span className="text-gray-600 dark:text-gray-400">{result.whois.registrar}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Created: </span>
                                <span className="text-gray-600 dark:text-gray-400">{result.whois.createdDate}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Expires: </span>
                                <span className="text-gray-600 dark:text-gray-400">{result.whois.expiryDate}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Name Servers: </span>
                                <span className="text-gray-600 dark:text-gray-400 break-all">{result.whois.nameServers.join(', ')}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* DNS Records */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Dns className="text-primary" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">DNS Records</h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(result.dns).map(([type, records]) => {
                              // Handle both array and single value records
                              const recordArray = Array.isArray(records) ? records : [records];
                              
                              return (
                                <div key={type} className="p-4 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-white/10">
                                  <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">{type} Records</div>
                                  <div className="space-y-1">
                                    {recordArray.map((record, idx) => (
                                      <div key={idx} className="text-sm text-gray-600 dark:text-gray-400 font-mono break-all overflow-hidden">
                                        {typeof record === 'object' ? JSON.stringify(record) : String(record)}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Technologies */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Code className="text-primary" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Detected Technologies</h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {result.technologies.map((tech, idx) => (
                              <span key={idx} className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                                {tech}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* HTTP Headers */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <Security className="text-primary" />
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">HTTP Headers</h3>
                          </div>
                          <div className="p-4 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-white/10">
                            <div className="space-y-2 text-sm font-mono">
                              {Object.entries(result.headers).map(([key, value]) => (
                                <div key={key}>
                                  <span className="text-gray-700 dark:text-gray-300">{key}: </span>
                                  <span className="text-gray-600 dark:text-gray-400">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Geolocation */}
                        {result.geolocation && Object.keys(result.geolocation).filter(k => result.geolocation?.[k as keyof typeof result.geolocation]).length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Geolocation</h3>
                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-white/10">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                {result.geolocation?.country && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Country: </span>
                                    <span className="text-gray-600 dark:text-gray-400">{result.geolocation.country}</span>
                                  </div>
                                )}
                                {result.geolocation?.city && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">City: </span>
                                    <span className="text-gray-600 dark:text-gray-400">{result.geolocation.city}</span>
                                  </div>
                                )}
                                {result.geolocation?.isp && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">ISP: </span>
                                    <span className="text-gray-600 dark:text-gray-400">{result.geolocation.isp}</span>
                                  </div>
                                )}
                                {result.geolocation?.timezone && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Timezone: </span>
                                    <span className="text-gray-600 dark:text-gray-400">{result.geolocation.timezone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Server Information */}
                        {result.serverInfo && Object.keys(result.serverInfo).length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Server Information</h3>
                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-white/10">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                {result.serverInfo.server && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Server: </span>
                                    <span className="text-gray-600 dark:text-gray-400">{result.serverInfo.server}</span>
                                  </div>
                                )}
                                {result.serverInfo?.os && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">OS: </span>
                                    <span className="text-gray-600 dark:text-gray-400">{result.serverInfo.os}</span>
                                  </div>
                                )}
                                {result.serverInfo?.framework && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Framework: </span>
                                    <span className="text-gray-600 dark:text-gray-400">{result.serverInfo.framework}</span>
                                  </div>
                                )}
                                {result.serverInfo?.language && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Language: </span>
                                    <span className="text-gray-600 dark:text-gray-400">{result.serverInfo.language}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* CMS Detection */}
                        {result.cms && result.cms.name && (
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">CMS Detection</h3>
                            <div className="p-4 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-white/10">
                              <div className="space-y-3 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">CMS: </span>
                                  <span className="text-gray-600 dark:text-gray-400">{result.cms.name}</span>
                                  {result.cms.version && <span className="text-gray-600 dark:text-gray-400"> v{result.cms.version}</span>}
                                </div>
                                {result.cms.plugins && result.cms.plugins.length > 0 && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Plugins: </span>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {result.cms.plugins.map((plugin, idx) => (
                                        <span key={idx} className="px-2 py-1 rounded bg-blue-500/10 text-blue-500 text-xs">
                                          {plugin}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Email Addresses */}
                        {result.emailAddresses && result.emailAddresses.length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Email Addresses Found</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {result.emailAddresses?.map((email, idx) => (
                                <div key={idx} className="p-3 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-white/10 text-sm font-mono text-gray-600 dark:text-gray-400 break-all">
                                  {email}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Social Media */}
                        {result.socialMedia && Object.keys(result.socialMedia).length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Social Media Profiles</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {Object.entries(result.socialMedia).map(([platform, url]) => (
                                <a
                                  key={platform}
                                  href={url as string}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-3 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-white/10 hover:border-primary transition-colors"
                                >
                                  <div className="font-medium text-gray-700 dark:text-gray-300 capitalize">{platform}</div>
                                  <div className="text-sm text-primary truncate">{url as string}</div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Performance Metrics */}
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Performance Metrics</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="p-4 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-white/10">
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Response Time</div>
                                <div className="text-2xl font-bold text-primary">{result.performance?.responseTime || 0}ms</div>
                              </div>
                              <div className="p-4 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-white/10">
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Page Size</div>
                                <div className="text-2xl font-bold text-primary">{((result.performance?.pageSize || 0) / 1024).toFixed(2)}KB</div>
                              </div>
                              <div className="p-4 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-white/10">
                                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Load Time</div>
                                <div className="text-2xl font-bold text-primary">{result.performance?.loadTime || 0}ms</div>
                              </div>
                            </div>
                          </div>

                        {/* Subdomains */}
                        {result.subdomains?.length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Discovered Subdomains ({result.subdomains.length})</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {result.subdomains.map((subdomain, idx) => (
                                <div key={idx} className="p-3 rounded-lg bg-gray-50 dark:bg-background-dark border border-gray-300 dark:border-white/10 text-sm font-mono text-gray-600 dark:text-gray-400 break-all">
                                  {subdomain}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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
