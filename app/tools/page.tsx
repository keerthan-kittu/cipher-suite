'use client';

import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ToolCard from '../components/ToolCard';

export default function ToolsPage() {
  const [visibleSections, setVisibleSections] = useState<Set<string>>(new Set());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.getAttribute('data-section');
            if (sectionId) {
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

    const timer = setTimeout(() => {
      const sections = document.querySelectorAll('[data-section]');
      sections.forEach((section) => observer.observe(section));
    }, 100);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-black">
      <div className="flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 sm:px-4 md:px-8 lg:px-20 xl:px-40">
          <div className="flex w-full max-w-7xl flex-1 flex-col">
            <Header />

            <main className="flex-grow p-4 sm:p-6 md:p-12 lg:p-16">
              <div className="flex flex-col gap-6 mb-12">
                <div className="flex items-center gap-4 animate-fade-in stagger-1">
                  <div className="p-4 rounded-xl bg-surface-elevated border border-primary/20 text-primary shadow-lg animate-float">
                    <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tighter text-primary">
                      Security Tools
                    </h1>
                    <p className="text-base sm:text-lg font-normal leading-relaxed text-white/60 mt-2">
                      Comprehensive suite of AI-powered security scanning and analysis tools
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div
                  data-section="tool-1"
                  className={`transition-all duration-700 ${
                    visibleSections.has('tool-1') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
                  }`}
                  style={{ transitionDelay: visibleSections.has('tool-1') ? '0.1s' : '0s' }}
                >
                  <ToolCard
                    icon={
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                      </svg>
                    }
                    title="Vulnercipher"
                    description="Leverage AI to scan your entire infrastructure, automatically identifying vulnerabilities and generating comprehensive, actionable reports with 50+ vulnerability types including OWASP Top 10."
                    buttonText="Launch Scanner"
                    href="/tools/vulnercipher"
                  />
                </div>

                <div
                  data-section="tool-2"
                  className={`transition-all duration-700 ${
                    visibleSections.has('tool-2') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
                  }`}
                  style={{ transitionDelay: visibleSections.has('tool-2') ? '0.2s' : '0s' }}
                >
                  <ToolCard
                    icon={
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/>
                      </svg>
                    }
                    title="NMap"
                    description="Discover and audit your network landscape. Our tool provides detailed reports on open ports and running services to fortify your defenses with comprehensive network mapping."
                    buttonText="Run NMap Scan"
                    href="/tools/nmap"
                  />
                </div>

                <div
                  data-section="tool-3"
                  className={`transition-all duration-700 ${
                    visibleSections.has('tool-3') ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'
                  }`}
                  style={{ transitionDelay: visibleSections.has('tool-3') ? '0.3s' : '0s' }}
                >
                  <ToolCard
                    icon={
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                      </svg>
                    }
                    title="RedHawk"
                    description="Conduct in-depth web application analysis. Automate information gathering to produce detailed intelligence reports on target domains including WHOIS, DNS, technologies, and confidential data detection."
                    buttonText="Start RedHawk"
                    href="/tools/redhawk"
                  />
                </div>

                <div
                  data-section="tool-4"
                  className={`transition-all duration-700 ${
                    visibleSections.has('tool-4') ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'
                  }`}
                  style={{ transitionDelay: visibleSections.has('tool-4') ? '0.4s' : '0s' }}
                >
                  <ToolCard
                    icon={
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                      </svg>
                    }
                    title="Honeypot Detection"
                    description="Identify and evade network decoys. Generate reports on detected honeypots to ensure your operations remain secure and on target with advanced behavioral analysis and risk scoring."
                    buttonText="Initiate Detection"
                    href="/tools/honeypot"
                  />
                </div>
              </div>

              {/* Features Section */}
              <div
                data-section="features"
                className={`mt-16 p-8 rounded-2xl bg-surface-elevated border border-primary/20 shadow-glow-sm transition-all duration-700 ${
                  visibleSections.has('features') ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{ transitionDelay: visibleSections.has('features') ? '0.1s' : '0s' }}
              >
                <div className="flex items-center gap-3 mb-8">
                  <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                  </svg>
                  <h2 className="text-2xl font-bold text-white">Platform Features</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex flex-col items-start gap-3 p-4 rounded-xl bg-surface-dark border border-primary/10 hover:border-primary/30 transition-all hover-lift">
                    <div className="p-3 rounded-lg bg-primary/20 text-primary">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 9V7c0-1.1-.9-2-2-2h-3c0-1.66-1.34-3-3-3S9 3.34 9 5H6c-1.1 0-2 .9-2 2v2c-1.66 0-3 1.34-3 3s1.34 3 3 3v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c1.66 0 3-1.34 3-3s-1.34-3-3-3zM7.5 11.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5S9.83 13 9 13s-1.5-.67-1.5-1.5zM16 17H8v-2h8v2zm-1-4c-.83 0-1.5-.67-1.5-1.5S14.17 10 15 10s1.5.67 1.5 1.5S15.83 13 15 13z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-2 text-lg">AI-Powered Analysis</h3>
                      <p className="text-sm text-white/60 leading-relaxed">
                        Advanced machine learning algorithms for accurate threat detection and intelligent vulnerability assessment
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-3 p-4 rounded-xl bg-surface-dark border border-primary/10 hover:border-primary/30 transition-all hover-lift">
                    <div className="p-3 rounded-lg bg-primary/20 text-primary">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-2 text-lg">Automated Reporting</h3>
                      <p className="text-sm text-white/60 leading-relaxed">
                        Generate professional PDF reports with one click, complete with actionable remediation steps
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-start gap-3 p-4 rounded-xl bg-surface-dark border border-primary/10 hover:border-primary/30 transition-all hover-lift">
                    <div className="p-3 rounded-lg bg-primary/20 text-primary">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 2v11h3v9l7-12h-4l4-8z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-2 text-lg">Real-Time Scanning</h3>
                      <p className="text-sm text-white/60 leading-relaxed">
                        Fast, efficient scans with live progress tracking and instant vulnerability detection
                      </p>
                    </div>
                  </div>
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
