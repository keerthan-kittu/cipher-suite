import React from 'react';
import { Scanner, Hub, Search, BugReport } from '@mui/icons-material';
import Header from './components/Header';
import Footer from './components/Footer';
import ToolCard from './components/ToolCard';

export default function Home() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-white dark:bg-background-dark">
      <div className="flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 sm:px-4 md:px-8 lg:px-20 xl:px-40">
          <div className="flex w-full max-w-7xl flex-1 flex-col">
            <Header />

            <main className="flex-grow p-4 sm:p-6 md:p-12 lg:p-16">
              <div className="flex flex-col items-center text-center gap-6 mb-16">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                  Cipher Suite Overview
                </h1>
                <p className="text-base sm:text-lg font-normal leading-relaxed text-gray-600 dark:text-gray-400 max-w-2xl">
                  An integrated platform of AI-powered security tools designed to provide comprehensive threat analysis and automated reporting.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <ToolCard
                  icon={<Scanner className="text-2xl" />}
                  title="Vulnercipher"
                  description="Leverage AI to scan your entire infrastructure, automatically identifying vulnerabilities and generating comprehensive, actionable reports."
                  buttonText="Launch Scanner"
                  href="/tools/vulnercipher"
                />

                <ToolCard
                  icon={<Hub className="text-2xl" />}
                  title="NMap"
                  description="Discover and audit your network landscape. Our tool provides detailed reports on open ports and running services to fortify your defenses."
                  buttonText="Run NMap Scan"
                  href="/tools/nmap"
                />

                <ToolCard
                  icon={<Search className="text-2xl" />}
                  title="RedHawk"
                  description="Conduct in-depth web application analysis. Automate information gathering to produce detailed intelligence reports on target domains."
                  buttonText="Start RedHawk"
                  href="/tools/redhawk"
                />

                <ToolCard
                  icon={<BugReport className="text-2xl" />}
                  title="Honeypot Detection"
                  description="Identify and evade network decoys. Generate reports on detected honeypots to ensure your operations remain secure and on target."
                  buttonText="Initiate Detection"
                  href="/tools/honeypot"
                />
              </div>
            </main>

            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
}
