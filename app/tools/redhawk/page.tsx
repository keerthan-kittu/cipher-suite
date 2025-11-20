'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { PDFExportButton } from '../../components/PDFExportButton';

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
  apiKeys?: any[];
  securityIssues?: any[];
  metadata?: any;
  jsLibraries?: string[];
  analytics?: any[];
  cdn?: any;
  robots?: any;
  sitemap?: any;
  confidentialData?: any[];
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
        
        // Automatically save to reports
        try {
          await fetch('/api/reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tool: 'RedHawk',
              target,
              findings: 0, // RedHawk is intelligence gathering, not vulnerability scanning
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
                    <h1 className="text-3xl sm:text-4xl font-bold text-primary">RedHawk</h1>
                    <p className="text-white/60 mt-1">Web Application Intelligence Gathering</p>
                  </div>
                </div>

                <div className="bg-surface-elevated border border-primary/20 rounded-2xl p-6 sm:p-8">
                  <h2 className="text-xl font-bold text-white mb-4">Target Configuration</h2>
                  
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
                        className="w-full px-4 py-3 rounded-lg border border-primary/20 bg-black text-white focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={scanning}
                      />
                    </div>

                    <button
                      onClick={startScan}
                      disabled={!target || scanning}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-bold hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ▶
                      {scanning ? 'Gathering Intelligence...' : 'Start Analysis'}
                    </button>
                  </div>

                  {scanning && (
                    <div className="mt-6">
                      <div className="flex justify-between text-sm text-white/60 mb-2">
                        <span>Analyzing target...</span>
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
                  <>
                    <div className="bg-surface-elevated border border-primary/20 rounded-2xl p-6 sm:p-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h2 className="text-xl font-bold text-white">Intelligence Report</h2>
                        <PDFExportButton
                          scanType="redhawk"
                          scanData={{
                            ...result,
                            scanDate: new Date().toISOString(),
                          }}
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                          <div className="text-sm text-white/60 mb-1">Domain</div>
                          <div className="text-lg font-bold text-primary">{result.domain}</div>
                        </div>
                        <div className="p-4 rounded-lg bg-primary/10 border border-green-500/20">
                          <div className="text-sm text-white/60 mb-1">IP Address</div>
                          <div className="text-lg font-bold text-primary font-mono">{result.ip}</div>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* WHOIS Information */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            🔎
                            <h3 className="text-lg font-bold text-white">WHOIS Information</h3>
                          </div>
                          <div className="p-4 rounded-lg bg-surface-dark border border-primary/20">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Registrar: </span>
                                <span className="text-white/60">{result.whois.registrar}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Created: </span>
                                <span className="text-white/60">{result.whois.createdDate}</span>
                              </div>
                              <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Expires: </span>
                                <span className="text-white/60">{result.whois.expiryDate}</span>
                              </div>
                              <div className="col-span-2">
                                <span className="font-medium text-gray-700 dark:text-gray-300">Name Servers: </span>
                                <span className="text-white/60 break-all">{result.whois.nameServers.join(', ')}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* DNS Records */}
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            🔎
                            <h3 className="text-lg font-bold text-white">DNS Records</h3>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Object.entries(result.dns).map(([type, records]) => {
                              // Handle both array and single value records
                              const recordArray = Array.isArray(records) ? records : [records];
                              
                              return (
                                <div key={type} className="p-4 rounded-lg bg-surface-dark border border-primary/20">
                                  <div className="font-medium text-gray-700 dark:text-gray-300 mb-2">{type} Records</div>
                                  <div className="space-y-1">
                                    {recordArray.map((record, idx) => (
                                      <div key={idx} className="text-sm text-white/60 font-mono break-all overflow-hidden">
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
                            🔎
                            <h3 className="text-lg font-bold text-white">Detected Technologies</h3>
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
                            🔎
                            <h3 className="text-lg font-bold text-white">HTTP Headers</h3>
                          </div>
                          <div className="p-4 rounded-lg bg-surface-dark border border-primary/20">
                            <div className="space-y-2 text-sm font-mono">
                              {Object.entries(result.headers).map(([key, value]) => (
                                <div key={key}>
                                  <span className="text-gray-700 dark:text-gray-300">{key}: </span>
                                  <span className="text-white/60">{value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Geolocation */}
                        {result.geolocation && Object.keys(result.geolocation).filter(k => result.geolocation?.[k as keyof typeof result.geolocation]).length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-white mb-3">Geolocation</h3>
                            <div className="p-4 rounded-lg bg-surface-dark border border-primary/20">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                {result.geolocation?.country && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Country: </span>
                                    <span className="text-white/60">{result.geolocation.country}</span>
                                  </div>
                                )}
                                {result.geolocation?.city && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">City: </span>
                                    <span className="text-white/60">{result.geolocation.city}</span>
                                  </div>
                                )}
                                {result.geolocation?.isp && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">ISP: </span>
                                    <span className="text-white/60">{result.geolocation.isp}</span>
                                  </div>
                                )}
                                {result.geolocation?.timezone && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Timezone: </span>
                                    <span className="text-white/60">{result.geolocation.timezone}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Server Information */}
                        {result.serverInfo && Object.keys(result.serverInfo).length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-white mb-3">Server Information</h3>
                            <div className="p-4 rounded-lg bg-surface-dark border border-primary/20">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                {result.serverInfo.server && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Server: </span>
                                    <span className="text-white/60">{result.serverInfo.server}</span>
                                  </div>
                                )}
                                {result.serverInfo?.os && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">OS: </span>
                                    <span className="text-white/60">{result.serverInfo.os}</span>
                                  </div>
                                )}
                                {result.serverInfo?.framework && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Framework: </span>
                                    <span className="text-white/60">{result.serverInfo.framework}</span>
                                  </div>
                                )}
                                {result.serverInfo?.language && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Language: </span>
                                    <span className="text-white/60">{result.serverInfo.language}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* CMS Detection */}
                        {result.cms && result.cms.name && (
                          <div>
                            <h3 className="text-lg font-bold text-white mb-3">CMS Detection</h3>
                            <div className="p-4 rounded-lg bg-surface-dark border border-primary/20">
                              <div className="space-y-3 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">CMS: </span>
                                  <span className="text-white/60">{result.cms.name}</span>
                                  {result.cms.version && <span className="text-white/60"> v{result.cms.version}</span>}
                                </div>
                                {result.cms.plugins && result.cms.plugins.length > 0 && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Plugins: </span>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {result.cms.plugins.map((plugin, idx) => (
                                        <span key={idx} className="px-2 py-1 rounded bg-primary/10 text-primary text-xs">
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
                            <h3 className="text-lg font-bold text-white mb-3">Email Addresses Found</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {result.emailAddresses?.map((email, idx) => (
                                <div key={idx} className="p-3 rounded-lg bg-surface-dark border border-primary/20 text-sm font-mono text-white/60 break-all">
                                  {email}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Social Media */}
                        {result.socialMedia && Object.keys(result.socialMedia).length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-white mb-3">Social Media Profiles</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {Object.entries(result.socialMedia).map(([platform, url]) => (
                                <a
                                  key={platform}
                                  href={url as string}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-3 rounded-lg bg-surface-dark border border-primary/20 hover:border-primary transition-colors"
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
                            <h3 className="text-lg font-bold text-white mb-3">Performance Metrics</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="p-4 rounded-lg bg-surface-dark border border-primary/20">
                                <div className="text-sm text-white/60 mb-1">Response Time</div>
                                <div className="text-2xl font-bold text-primary">{result.performance?.responseTime || 0}ms</div>
                              </div>
                              <div className="p-4 rounded-lg bg-surface-dark border border-primary/20">
                                <div className="text-sm text-white/60 mb-1">Page Size</div>
                                <div className="text-2xl font-bold text-primary">{((result.performance?.pageSize || 0) / 1024).toFixed(2)}KB</div>
                              </div>
                              <div className="p-4 rounded-lg bg-surface-dark border border-primary/20">
                                <div className="text-sm text-white/60 mb-1">Load Time</div>
                                <div className="text-2xl font-bold text-primary">{result.performance?.loadTime || 0}ms</div>
                              </div>
                            </div>
                          </div>

                        {/* API Keys */}
                        {result.apiKeys && result.apiKeys.length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-white mb-3">API Keys & Secrets ({result.apiKeys.length})</h3>
                            <div className="space-y-3">
                              {result.apiKeys.map((apiKey, idx) => (
                                <div key={idx} className={`p-4 rounded-lg border ${apiKey.status === 'exposed' ? 'bg-severity-critical/10 border-severity-critical' : 'bg-severity-medium/10 border-severity-medium'}`}>
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium text-white">{apiKey.type}</span>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${apiKey.status === 'exposed' ? 'bg-primary text-white' : 'bg-primary text-white'}`}>
                                      {apiKey.status.toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="text-sm font-mono text-white/60 break-all mb-2">{apiKey.key}</div>
                                  <div className="text-xs text-white/50">Location: {apiKey.location}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Security Issues */}
                        {result.securityIssues && result.securityIssues.length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-white mb-3">Security Issues ({result.securityIssues.length})</h3>
                            <div className="space-y-3">
                              {result.securityIssues.map((issue, idx) => (
                                <div key={idx} className="p-4 rounded-lg bg-surface-dark border border-primary/20">
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="font-medium text-white">{issue.type}</span>
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                      issue.severity === 'critical' ? 'bg-primary text-white' :
                                      issue.severity === 'high' ? 'bg-primary text-white' :
                                      issue.severity === 'medium' ? 'bg-primary text-white' :
                                      'bg-primary text-white'
                                    }`}>
                                      {issue.severity.toUpperCase()}
                                    </span>
                                  </div>
                                  <p className="text-sm text-white/60 mb-2">{issue.description}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">Recommendation: {issue.recommendation}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Metadata */}
                        {result.metadata && Object.keys(result.metadata).length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-white mb-3">Page Metadata</h3>
                            <div className="p-4 rounded-lg bg-surface-dark border border-primary/20">
                              <div className="space-y-3 text-sm">
                                {result.metadata.title && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Title: </span>
                                    <span className="text-white/60 break-words">{result.metadata.title}</span>
                                  </div>
                                )}
                                {result.metadata.description && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Description: </span>
                                    <span className="text-white/60 break-words">{result.metadata.description}</span>
                                  </div>
                                )}
                                {result.metadata.keywords && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Keywords: </span>
                                    <span className="text-white/60 break-words">{result.metadata.keywords}</span>
                                  </div>
                                )}
                                {result.metadata.author && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Author: </span>
                                    <span className="text-white/60">{result.metadata.author}</span>
                                  </div>
                                )}
                                {result.metadata.generator && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Generator: </span>
                                    <span className="text-white/60">{result.metadata.generator}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* JavaScript Libraries */}
                        {result.jsLibraries && result.jsLibraries.length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-white mb-3">JavaScript Libraries ({result.jsLibraries.length})</h3>
                            <div className="flex flex-wrap gap-2">
                              {result.jsLibraries.map((lib, idx) => (
                                <span key={idx} className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20">
                                  {lib}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Analytics */}
                        {result.analytics && result.analytics.length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-white mb-3">Analytics & Tracking ({result.analytics.length})</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {result.analytics.map((analytic, idx) => (
                                <div key={idx} className="p-3 rounded-lg bg-surface-dark border border-primary/20">
                                  <div className="font-medium text-gray-700 dark:text-gray-300">{analytic.type}</div>
                                  <div className="text-sm font-mono text-white/60 break-all">{analytic.id}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* CDN */}
                        {result.cdn?.detected && (
                          <div>
                            <h3 className="text-lg font-bold text-white mb-3">CDN Detection</h3>
                            <div className="p-4 rounded-lg bg-surface-dark border border-primary/20">
                              <div className="space-y-2 text-sm">
                                {result.cdn.provider && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Primary CDN: </span>
                                    <span className="text-white/60">{result.cdn.provider}</span>
                                  </div>
                                )}
                                {result.cdn.resources.length > 0 && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">CDN Resources: </span>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      {result.cdn.resources.map((resource: string, idx: number) => (
                                        <span key={idx} className="px-2 py-1 rounded bg-primary/10 text-primary text-xs">
                                          {resource}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Robots.txt */}
                        {result.robots?.exists && (
                          <div>
                            <h3 className="text-lg font-bold text-white mb-3">Robots.txt</h3>
                            <div className="p-4 rounded-lg bg-surface-dark border border-primary/20">
                              <div className="space-y-3 text-sm">
                                {result.robots.disallowedPaths.length > 0 && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Disallowed Paths ({result.robots.disallowedPaths.length}): </span>
                                    <div className="mt-2 space-y-1">
                                      {result.robots.disallowedPaths.slice(0, 10).map((path: string, idx: number) => (
                                        <div key={idx} className="font-mono text-xs text-white/60 break-all">{path}</div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {result.robots.sitemaps.length > 0 && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Sitemaps: </span>
                                    <div className="mt-2 space-y-1">
                                      {result.robots.sitemaps.map((sitemap: string, idx: number) => (
                                        <div key={idx} className="font-mono text-xs text-white/60 break-all">{sitemap}</div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Sitemap */}
                        {result.sitemap?.exists && (
                          <div>
                            <h3 className="text-lg font-bold text-white mb-3">Sitemap.xml</h3>
                            <div className="p-4 rounded-lg bg-surface-dark border border-primary/20">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="font-medium text-gray-700 dark:text-gray-300">URLs Found: </span>
                                  <span className="text-white/60">{result.sitemap.urls}</span>
                                </div>
                                {result.sitemap.lastModified && (
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Last Modified: </span>
                                    <span className="text-white/60">{result.sitemap.lastModified}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Confidential Data Detection */}
                        {result.confidentialData && result.confidentialData.length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-white mb-3">
                              🔐 Confidential Information Detection ({result.confidentialData.length})
                            </h3>
                            <div className="space-y-3">
                              {result.confidentialData.map((data: any, idx: number) => (
                                <div 
                                  key={idx} 
                                  className={`p-4 rounded-lg border ${
                                    data.severity === 'critical' 
                                      ? 'bg-severity-critical/10 border-severity-critical/30' 
                                      : data.severity === 'high'
                                      ? 'bg-severity-high/10 border-severity-high/30'
                                      : data.severity === 'medium'
                                      ? 'bg-severity-medium/10 border-severity-medium/30'
                                      : 'bg-severity-low/10 border-severity-low/30'
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                                        data.severity === 'critical' 
                                          ? 'bg-red-600 text-white' 
                                          : data.severity === 'high'
                                          ? 'bg-orange-600 text-white'
                                          : data.severity === 'medium'
                                          ? 'bg-yellow-600 text-white'
                                          : 'bg-blue-600 text-white'
                                      }`}>
                                        {data.severity.toUpperCase()}
                                      </span>
                                      <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-700 text-white">
                                        {data.category}
                                      </span>
                                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                        data.status === 'exposed' 
                                          ? 'bg-red-600 text-white' 
                                          : data.status === 'protected'
                                          ? 'bg-green-600 text-white'
                                          : data.status === 'encrypted'
                                          ? 'bg-blue-600 text-white'
                                          : 'bg-gray-600 text-white'
                                      }`}>
                                        {data.status.toUpperCase()}
                                      </span>
                                    </div>
                                    <span className="text-xs font-mono text-white/60">
                                      {data.count} found
                                    </span>
                                  </div>
                                  
                                  <h4 className="font-bold text-white mb-2">{data.type}</h4>
                                  
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <span className="font-medium text-gray-700 dark:text-gray-300">Location: </span>
                                      <span className="text-white/60">{data.location}</span>
                                    </div>
                                    
                                    {data.samples && data.samples.length > 0 && (
                                      <div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Samples (Masked): </span>
                                        <div className="mt-1 space-y-1">
                                          {data.samples.map((sample: string, sIdx: number) => (
                                            <div key={sIdx} className="font-mono text-xs bg-surface-elevated p-2 rounded">
                                              {sample}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    
                                    <div className="pt-2 border-t border-gray-300 dark:border-gray-600">
                                      <span className="font-medium text-gray-700 dark:text-gray-300">Recommendation: </span>
                                      <p className="text-white/60 mt-1">{data.recommendation}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Subdomains */}
                        {result.subdomains?.length > 0 && (
                          <div>
                            <h3 className="text-lg font-bold text-white mb-3">Discovered Subdomains ({result.subdomains.length})</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {result.subdomains.map((subdomain, idx) => (
                                <div key={idx} className="p-3 rounded-lg bg-surface-dark border border-primary/20 text-sm font-mono text-white/60 break-all">
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
