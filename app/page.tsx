'use client';

import { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import SegmentedCircle from './components/SegmentedCircle';
import Link from 'next/link';

interface AnalyticsData {
  totalScans: number;
  vulnerabilitiesDetected: number;
  successRate: number;
  avgScanTime: number;
  toolUsage: {
    vulnercipher: number;
    nmap: number;
    redhawk: number;
    honeypot: number;
  };
  recentActivity: Array<{
    tool: string;
    timestamp: string;
    status: 'success' | 'warning' | 'error';
    findings: number;
  }>;
  severityBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  weeklyScans: Array<{ day: string; scans: number }>;
  topVulnerabilities: Array<{ name: string; count: number; severity: string }>;
  scansByType: Array<{ type: string; count: number; percentage: number }>;
}

export default function Home() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());
  const [analytics] = useState<AnalyticsData>({
    totalScans: 1247,
    vulnerabilitiesDetected: 3891,
    successRate: 94.7,
    avgScanTime: 24.3,
    toolUsage: {
      vulnercipher: 456,
      nmap: 312,
      redhawk: 289,
      honeypot: 190,
    },
    recentActivity: [
      { tool: 'Vulnercipher', timestamp: '2 minutes ago', status: 'success', findings: 12 },
      { tool: 'RedHawk', timestamp: '15 minutes ago', status: 'success', findings: 8 },
      { tool: 'NMap', timestamp: '1 hour ago', status: 'warning', findings: 5 },
      { tool: 'Honeypot', timestamp: '2 hours ago', status: 'success', findings: 3 },
    ],
    severityBreakdown: {
      critical: 234,
      high: 567,
      medium: 1890,
      low: 1200,
    },
    weeklyScans: [
      { day: 'Mon', scans: 145 },
      { day: 'Tue', scans: 189 },
      { day: 'Wed', scans: 167 },
      { day: 'Thu', scans: 223 },
      { day: 'Fri', scans: 198 },
      { day: 'Sat', scans: 156 },
      { day: 'Sun', scans: 169 },
    ],
    topVulnerabilities: [
      { name: 'SQL Injection', count: 89, severity: 'critical' },
      { name: 'XSS', count: 67, severity: 'high' },
      { name: 'CSRF', count: 54, severity: 'high' },
      { name: 'Weak Encryption', count: 43, severity: 'medium' },
      { name: 'Missing Headers', count: 38, severity: 'low' },
    ],
    scansByType: [
      { type: 'Automated', count: 892, percentage: 71.5 },
      { type: 'Manual', count: 234, percentage: 18.8 },
      { type: 'Scheduled', count: 121, percentage: 9.7 },
    ],
  });

  const lineRef = useRef<SVGPolylineElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const totalToolUsage = Object.values(analytics.toolUsage).reduce((a, b) => a + b, 0);
  const maxWeeklyScans = Math.max(...analytics.weeklyScans.map((d) => d.scans));

  useEffect(() => {
    // Small delay to ensure SVG is fully rendered
    const timer = setTimeout(() => {
      if (lineRef.current) {
        const length = lineRef.current.getTotalLength();
        console.log('Path length:', length);
        // Set the stroke dash properties
        lineRef.current.style.strokeDasharray = `${length}`;
        lineRef.current.style.strokeDashoffset = `${length}`;
        // Trigger animation
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section');
            if (sectionId) {
              console.log('Section entering view:', sectionId);
              setVisibleSections((prev) => new Set(prev).add(sectionId));
            }
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    // Wait for DOM to be ready
    const timer = setTimeout(() => {
      const sections = document.querySelectorAll('[data-section]');
      console.log('Observing sections:', sections.length);
      sections.forEach((section) => observer.observe(section));
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getToolIcon = (tool: string) => {
    switch (tool.toLowerCase()) {
      case 'vulnercipher':
        return (
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        );
      case 'redhawk':
        return (
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        );
      case 'nmap':
        return (
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'honeypot':
        return (
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        );
      default:
        return (
          <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-surface-elevated border-primary/30';
      case 'warning': return 'bg-surface-elevated border-primary/20';
      case 'error': return 'bg-surface-dark border-white/10';
      default: return 'bg-surface-elevated border-primary/30';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-blue-500 bg-blue-500/10';
      default: return 'text-gray-500 bg-gray-500/10';
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-black">
      <div className="flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 sm:px-4 md:px-8 lg:px-20 xl:px-40">
          <div className="flex w-full max-w-7xl flex-1 flex-col">
            <Header />

            <main className="flex-grow p-4 sm:p-6 md:p-12 lg:p-16">
              {/* Header Section */}
              <div className="flex flex-col gap-6 mb-12">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tighter text-primary animate-fade-in">
                      Security Analytics Dashboard
                    </h1>
                    <p className="text-base sm:text-lg font-normal leading-relaxed text-white/60 mt-2 animate-fade-in stagger-1">
                      Real-time insights into your security scanning operations
                    </p>
                  </div>
                  <Link 
                    href="/tools/vulnercipher"
                    className="hidden md:flex items-center gap-2 px-6 py-3 rounded-lg border border-primary/30 text-white font-bold hover:bg-primary/10 hover:border-primary transition-all shadow-glow-sm animate-fade-in stagger-2"
                  >
                    🔒 Start New Scan
                  </Link>
                </div>
              </div>

              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {/* Total Scans */}
                <div className="p-6 rounded-2xl bg-surface-elevated border border-primary/30 shadow-glow-sm hover-lift animate-fade-in stagger-1">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary/20 animate-float">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {analytics.totalScans.toLocaleString()}
                  </div>
                  <div className="text-sm text-white/60">Total Scans</div>
                  <div className="mt-3 text-xs text-primary font-medium">
                    +12.5% from last month
                  </div>
                </div>

                {/* Vulnerabilities Detected */}
                <div className="p-6 rounded-2xl bg-surface-elevated border border-primary/30 shadow-glow-sm hover-lift animate-fade-in stagger-2">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary/20 animate-float">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {analytics.vulnerabilitiesDetected.toLocaleString()}
                  </div>
                  <div className="text-sm text-white/60">Vulnerabilities Found</div>
                  <div className="mt-3 text-xs text-primary font-medium">
                    {analytics.severityBreakdown.critical} Critical
                  </div>
                </div>

                {/* Success Rate */}
                <div className="p-6 rounded-2xl bg-surface-elevated border border-primary/30 shadow-glow-sm hover-lift animate-fade-in stagger-3">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary/20 animate-float">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {analytics.successRate}%
                  </div>
                  <div className="text-sm text-white/60">Success Rate</div>
                  <div className="mt-3 text-xs text-primary font-medium">
                    +2.3% improvement
                  </div>
                </div>

                {/* Average Scan Time */}
                <div className="p-6 rounded-2xl bg-surface-elevated border border-primary/30 shadow-glow-sm hover-lift animate-fade-in stagger-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-xl bg-primary/20 animate-float">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">
                    {analytics.avgScanTime}s
                  </div>
                  <div className="text-sm text-white/60">Avg Scan Time</div>
                  <div className="mt-3 text-xs text-primary font-medium">
                    -15% faster
                  </div>
                </div>
              </div>

              {/* Weekly Scans Chart - Line Graph */}
              <div className="bg-surface-elevated border border-primary/20 rounded-2xl p-6 sm:p-8 mb-12 shadow-glow-sm hover-glow animate-scale-in">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Weekly Scan Activity</h2>
                    <p className="text-sm text-white/60 mt-1">Scans performed over the last 7 days</p>
                  </div>
                </div>
                
                {/* Line Graph */}
                <div className="relative h-64 mb-4">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-white/60">
                    <span>{maxWeeklyScans}</span>
                    <span>{Math.round(maxWeeklyScans * 0.75)}</span>
                    <span>{Math.round(maxWeeklyScans * 0.5)}</span>
                    <span>{Math.round(maxWeeklyScans * 0.25)}</span>
                    <span>0</span>
                  </div>
                  
                  {/* Graph area */}
                  <div className="absolute left-14 right-0 top-0 bottom-8">
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between">
                      {[0, 1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-full border-t border-white/5" />
                      ))}
                    </div>
                    
                    {/* Line graph */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 700 100" preserveAspectRatio="none">
                      {/* Gradient fill under line */}
                      <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#00B2A9" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#00B2A9" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      
                      {/* Area under line */}
                      <path
                        d={`M 0,${100 - (analytics.weeklyScans[0].scans / maxWeeklyScans) * 100} ${analytics.weeklyScans
                          .map((day, idx) => {
                            const x = (idx / (analytics.weeklyScans.length - 1)) * 700;
                            const y = 100 - (day.scans / maxWeeklyScans) * 100;
                            return `L ${x},${y}`;
                          })
                          .join(' ')} L 700,100 L 0,100 Z`}
                        fill="url(#lineGradient)"
                      />
                      
                      {/* Line */}
                      <polyline
                        ref={lineRef}
                        points={analytics.weeklyScans
                          .map((day, idx) => {
                            const x = (idx / (analytics.weeklyScans.length - 1)) * 700;
                            const y = 100 - (day.scans / maxWeeklyScans) * 100;
                            return `${x},${y}`;
                          })
                          .join(' ')}
                        fill="none"
                        stroke="#00B2A9"
                        strokeWidth="1.5"
                        style={{
                          transition: isAnimating ? 'stroke-dashoffset 2s ease-out' : 'none',
                          strokeDashoffset: isAnimating ? 0 : undefined,
                        }}
                      />
                    </svg>
                    
                    {/* Data points - separate layer to keep circles round */}
                    <div className="absolute inset-0">
                      {analytics.weeklyScans.map((day, idx) => {
                        const x = (idx / (analytics.weeklyScans.length - 1)) * 100;
                        const y = 100 - (day.scans / maxWeeklyScans) * 100;
                        // Calculate delay based on line animation (2s total / 7 points)
                        const delay = 0.1 + (idx / (analytics.weeklyScans.length - 1)) * 2;
                        return (
                          <div
                            key={idx}
                            className="absolute w-3 h-3 -ml-1.5 -mt-1.5 rounded-full bg-primary border-2 border-black cursor-pointer hover:scale-125 transition-all"
                            style={{
                              left: `${x}%`,
                              top: `${y}%`,
                              animation: `fadeInScale 0.4s ease-out ${delay}s forwards`,
                              opacity: 0,
                            }}
                            title={`${day.day}: ${day.scans} scans`}
                          />
                        );
                      })}
                    </div>
                    
                    {/* Data point labels */}
                    <div className="absolute inset-0 pointer-events-none overflow-visible">
                      {analytics.weeklyScans.map((day, idx) => {
                        const x = (idx / (analytics.weeklyScans.length - 1)) * 100;
                        const y = 100 - (day.scans / maxWeeklyScans) * 100;
                        // Calculate delay based on line animation (2s total / 7 points)
                        const delay = 0.1 + (idx / (analytics.weeklyScans.length - 1)) * 2;
                        return (
                          <div
                            key={idx}
                            className="absolute text-sm font-bold text-primary -translate-x-1/2"
                            style={{
                              left: `${x}%`,
                              top: `calc(${y}% + 16px)`,
                              animation: `fadeInScale 0.4s ease-out ${delay}s forwards`,
                              opacity: 0,
                              zIndex: 10,
                            }}
                          >
                            {day.scans}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* X-axis labels */}
                  <div className="absolute left-14 right-0 bottom-0 flex justify-between text-sm text-white/60 font-medium">
                    {analytics.weeklyScans.map((day, idx) => (
                      <span key={idx}>{day.day}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tool Usage & Severity Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                {/* Tool Usage Statistics */}
                <div
                  data-section="tool-usage"
                  className={`p-6 rounded-2xl bg-surface-elevated border border-primary/20 shadow-glow-sm hover-lift transition-all duration-700 ${
                    visibleSections.has('tool-usage') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
                  }`}
                  style={{ transitionDelay: visibleSections.has('tool-usage') ? '0.1s' : '0s' }}
                >
                  <div className="mb-6">
                    <h2 className="text-xl font-bold text-white">Tool Usage Statistics</h2>
                    <p className="text-sm text-white/60">Distribution of scans by tool</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    {Object.entries(analytics.toolUsage).map(([tool, count]) => {
                      const percentage = Math.round((count / totalToolUsage) * 100);
                      
                      return (
                        <div key={tool} className="flex flex-col items-center p-4 rounded-xl bg-surface-dark hover:bg-surface-dark/80 transition-all">
                          <div className="mb-3">
                            <SegmentedCircle percentage={percentage} size={128} strokeWidth={8} />
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-bold text-white capitalize mb-1">{tool}</div>
                            <div className="text-xs text-white/60">{count} scans</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10 text-center">
                    <div className="text-sm text-white/60">
                      Total executions: <span className="font-bold text-white">{totalToolUsage}</span>
                    </div>
                  </div>
                </div>

                {/* Vulnerability Severity */}
                <div
                  data-section="vulnerability-severity"
                  className={`p-6 rounded-2xl bg-surface-elevated border border-primary/20 shadow-glow-sm hover-lift transition-all duration-700 ${
                    visibleSections.has('vulnerability-severity') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
                  }`}
                  style={{ transitionDelay: visibleSections.has('vulnerability-severity') ? '0.2s' : '0s' }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <div>
                      <h2 className="text-xl font-bold text-white">Vulnerability Severity</h2>
                      <p className="text-sm text-white/60">Breakdown by risk level</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-surface-dark border-2 border-red-500/40">
                      <div className="text-3xl font-bold text-red-500 mb-1">
                        {analytics.severityBreakdown.critical}
                      </div>
                      <div className="text-sm font-medium text-white/80">Critical</div>
                      <div className="text-xs text-white/50 mt-1">
                        {((analytics.severityBreakdown.critical / analytics.vulnerabilitiesDetected) * 100).toFixed(1)}%
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-dark border-2 border-orange-500/30">
                      <div className="text-3xl font-bold text-orange-500 mb-1">
                        {analytics.severityBreakdown.high}
                      </div>
                      <div className="text-sm font-medium text-white/80">High</div>
                      <div className="text-xs text-white/50 mt-1">
                        {((analytics.severityBreakdown.high / analytics.vulnerabilitiesDetected) * 100).toFixed(1)}%
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-dark border-2 border-yellow-500/20">
                      <div className="text-3xl font-bold text-yellow-500 mb-1">
                        {analytics.severityBreakdown.medium}
                      </div>
                      <div className="text-sm font-medium text-white/80">Medium</div>
                      <div className="text-xs text-white/50 mt-1">
                        {((analytics.severityBreakdown.medium / analytics.vulnerabilitiesDetected) * 100).toFixed(1)}%
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-surface-dark border-2 border-blue-500/20">
                      <div className="text-3xl font-bold text-blue-500 mb-1">
                        {analytics.severityBreakdown.low}
                      </div>
                      <div className="text-sm font-medium text-white/80">Low</div>
                      <div className="text-xs text-white/50 mt-1">
                        {((analytics.severityBreakdown.low / analytics.vulnerabilitiesDetected) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="text-center mb-4">
                      <div className="text-sm text-white/60">
                        Total vulnerabilities: <span className="font-bold text-white">{analytics.vulnerabilitiesDetected.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center mb-4">
                      <div>
                        <div className="text-lg font-bold text-red-500">
                          {analytics.severityBreakdown.critical + analytics.severityBreakdown.high}
                        </div>
                        <div className="text-xs text-white/60">High Risk</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-yellow-500">
                          {analytics.severityBreakdown.medium}
                        </div>
                        <div className="text-xs text-white/60">Medium Risk</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-blue-500">
                          {analytics.severityBreakdown.low}
                        </div>
                        <div className="text-xs text-white/60">Low Risk</div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/5 space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex justify-between items-center p-2 rounded bg-surface-dark">
                          <span className="text-white/60">Avg per scan:</span>
                          <span className="font-bold text-white">{Math.round(analytics.vulnerabilitiesDetected / analytics.totalScans)}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-surface-dark">
                          <span className="text-white/60">Remediation rate:</span>
                          <span className="font-bold text-primary">87%</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex justify-between items-center p-2 rounded bg-surface-dark">
                          <span className="text-white/60">Patched:</span>
                          <span className="font-bold text-green-500">{Math.round(analytics.vulnerabilitiesDetected * 0.87)}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-surface-dark">
                          <span className="text-white/60">Pending:</span>
                          <span className="font-bold text-yellow-500">{Math.round(analytics.vulnerabilitiesDetected * 0.13)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Vulnerabilities & Scan Types */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
                {/* Top Vulnerabilities */}
                <div
                  data-section="top-vulnerabilities"
                  className={`p-6 rounded-2xl bg-surface-elevated border border-primary/20 shadow-glow-sm hover-lift transition-all duration-700 ${
                    visibleSections.has('top-vulnerabilities') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
                  }`}
                  style={{ transitionDelay: visibleSections.has('top-vulnerabilities') ? '0.1s' : '0s' }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <h2 className="text-xl font-bold text-white">Top Vulnerabilities</h2>
                      <p className="text-sm text-white/60">Most frequently detected issues</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {analytics.topVulnerabilities.map((vuln, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-surface-dark border border-white/5 hover:border-primary/30 transition-colors">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="text-lg font-bold text-white/40">#{idx + 1}</div>
                          <div className="flex-1">
                            <div className="font-medium text-white">{vuln.name}</div>
                            <div className="text-xs text-white/60">{vuln.count} occurrences</div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getSeverityColor(vuln.severity)}`}>
                          {vuln.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Scan Types Distribution */}
                <div
                  data-section="scan-types"
                  className={`p-6 rounded-2xl bg-surface-elevated border border-primary/20 shadow-glow-sm hover-lift transition-all duration-700 ${
                    visibleSections.has('scan-types') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
                  }`}
                  style={{ transitionDelay: visibleSections.has('scan-types') ? '0.2s' : '0s' }}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <h2 className="text-xl font-bold text-white">Scan Types</h2>
                      <p className="text-sm text-white/60">Distribution by execution method</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {analytics.scansByType.map((scan, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-white/80">{scan.type}</span>
                          <span className="text-sm font-bold text-white">
                            {scan.count} ({scan.percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-3 bg-surface-dark rounded-full overflow-hidden border border-primary">
                          <div
                            className="h-full transition-all duration-500 relative"
                            style={{ 
                              width: `${scan.percentage}%`,
                              background: 'repeating-linear-gradient(90deg, #00B2A9 0px, #00B2A9 8px, transparent 8px, transparent 12px)'
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="grid grid-cols-3 gap-4 text-center mb-4">
                      <div>
                        <div className="text-2xl font-bold text-primary">{analytics.totalScans}</div>
                        <div className="text-xs text-white/60">Total</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">{Math.round(analytics.totalScans / 30)}</div>
                        <div className="text-xs text-white/60">Per Day</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-primary">{Math.round(analytics.totalScans / 7)}</div>
                        <div className="text-xs text-white/60">Per Week</div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-white/5 space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex justify-between items-center p-2 rounded bg-surface-dark">
                          <span className="text-white/60">Peak hour:</span>
                          <span className="font-bold text-white">2-3 PM</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-surface-dark">
                          <span className="text-white/60">Success rate:</span>
                          <span className="font-bold text-primary">{analytics.successRate}%</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div className="flex justify-between items-center p-2 rounded bg-surface-dark">
                          <span className="text-white/60">Avg duration:</span>
                          <span className="font-bold text-white">{analytics.avgScanTime}s</span>
                        </div>
                        <div className="flex justify-between items-center p-2 rounded bg-surface-dark">
                          <span className="text-white/60">This month:</span>
                          <span className="font-bold text-primary">+{Math.round(analytics.totalScans * 0.125)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div
                data-section="recent-activity"
                className={`p-6 rounded-2xl bg-surface-elevated border border-primary/20 shadow-glow-sm mb-12 hover-lift transition-all duration-700 ${
                  visibleSections.has('recent-activity') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: visibleSections.has('recent-activity') ? '0.1s' : '0s' }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h2 className="text-xl font-bold text-white">Recent Scan Activity</h2>
                    <p className="text-sm text-white/60">Latest security scans and their results</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analytics.recentActivity.map((activity, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border ${getStatusColor(activity.status)} transition-all hover:border-primary/50 hover:scale-105`}
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getToolIcon(activity.tool)}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">{activity.findings}</div>
                            <div className="text-xs text-white/60">findings</div>
                          </div>
                        </div>
                        <div>
                          <div className="font-bold text-white text-lg">{activity.tool}</div>
                          <div className="text-sm text-white/60 mt-1">{activity.timestamp}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div
                data-section="quick-actions"
                className={`p-6 rounded-2xl bg-surface-elevated border border-primary/30 shadow-glow-md hover-lift transition-all duration-700 ${
                  visibleSections.has('quick-actions') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: visibleSections.has('quick-actions') ? '0.1s' : '0s' }}
              >
                <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Link
                    href="/tools/vulnercipher"
                    className="p-4 rounded-xl bg-surface-dark border border-primary/30 hover:border-primary hover:shadow-glow-sm transition-all text-center group"
                  >
                    <div className="flex justify-center mb-3">
                      <svg className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <div className="font-bold text-white group-hover:text-primary transition-colors text-sm">Vulnercipher</div>
                  </Link>
                  <Link
                    href="/tools/nmap"
                    className="p-4 rounded-xl bg-surface-dark border border-primary/30 hover:border-primary hover:shadow-glow-sm transition-all text-center group"
                  >
                    <div className="flex justify-center mb-3">
                      <svg className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="font-bold text-white group-hover:text-primary transition-colors text-sm">NMap</div>
                  </Link>
                  <Link
                    href="/tools/redhawk"
                    className="p-4 rounded-xl bg-surface-dark border border-primary/30 hover:border-primary hover:shadow-glow-sm transition-all text-center group"
                  >
                    <div className="flex justify-center mb-3">
                      <svg className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <div className="font-bold text-white group-hover:text-primary transition-colors text-sm">RedHawk</div>
                  </Link>
                  <Link
                    href="/tools/honeypot"
                    className="p-4 rounded-xl bg-surface-dark border border-primary/30 hover:border-primary hover:shadow-glow-sm transition-all text-center group"
                  >
                    <div className="flex justify-center mb-3">
                      <svg className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="font-bold text-white group-hover:text-primary transition-colors text-sm">Honeypot</div>
                  </Link>
                </div>
              </div>
            </main>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
