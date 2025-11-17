import React from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import { Shield, Security, Speed, Cloud } from '@mui/icons-material';

export default function AboutPage() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-white dark:bg-background-dark">
      <div className="flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 sm:px-4 md:px-8 lg:px-20 xl:px-40">
          <div className="flex w-full max-w-7xl flex-1 flex-col">
            <Header />

            <main className="flex-grow p-4 sm:p-6 md:p-12 lg:p-16">
              <div className="flex flex-col gap-12">
                <div className="text-center">
                  <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">About Cipher Suite</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                    Cipher Suite is a comprehensive cybersecurity platform that combines cutting-edge AI technology with proven security methodologies to deliver unparalleled threat detection and analysis capabilities.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="p-8 rounded-2xl bg-white dark:bg-surface-dark border border-gray-300 dark:border-white/10">
                    <div className="flex items-center justify-center size-16 rounded-xl bg-primary/10 text-primary border border-primary/20 mb-4">
                      <Shield className="text-3xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Enterprise Security</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Built for organizations that demand the highest level of security. Our tools are trusted by Fortune 500 companies worldwide.
                    </p>
                  </div>

                  <div className="p-8 rounded-2xl bg-white dark:bg-surface-dark border border-gray-300 dark:border-white/10">
                    <div className="flex items-center justify-center size-16 rounded-xl bg-primary/10 text-primary border border-primary/20 mb-4">
                      <Security className="text-3xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">AI-Powered Analysis</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Leverage machine learning algorithms to detect threats faster and more accurately than traditional methods.
                    </p>
                  </div>

                  <div className="p-8 rounded-2xl bg-white dark:bg-surface-dark border border-gray-300 dark:border-white/10">
                    <div className="flex items-center justify-center size-16 rounded-xl bg-primary/10 text-primary border border-primary/20 mb-4">
                      <Speed className="text-3xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Real-Time Scanning</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Get instant results with our optimized scanning engines that process thousands of data points per second.
                    </p>
                  </div>

                  <div className="p-8 rounded-2xl bg-white dark:bg-surface-dark border border-gray-300 dark:border-white/10">
                    <div className="flex items-center justify-center size-16 rounded-xl bg-primary/10 text-primary border border-primary/20 mb-4">
                      <Cloud className="text-3xl" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Cloud-Native</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Fully cloud-based infrastructure ensures scalability, reliability, and accessibility from anywhere.
                    </p>
                  </div>
                </div>

                <div className="bg-white dark:bg-surface-dark border border-gray-300 dark:border-white/10 rounded-2xl p-8 sm:p-12">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                    At Cipher Suite, we believe that cybersecurity should be accessible, intelligent, and proactive. Our mission is to empower organizations with the tools they need to stay ahead of evolving threats.
                  </p>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Founded by security experts with decades of combined experience, we've built a platform that combines the best of automated scanning, AI-driven analysis, and human expertise to deliver comprehensive security solutions.
                  </p>
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
