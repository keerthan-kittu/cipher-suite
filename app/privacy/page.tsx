import React from 'react';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-white dark:bg-background-dark">
      <div className="flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 sm:px-4 md:px-8 lg:px-20 xl:px-40">
          <div className="flex w-full max-w-7xl flex-1 flex-col">
            <Header />

            <main className="flex-grow p-4 sm:p-6 md:p-12 lg:p-16">
              <div className="bg-white dark:bg-surface-dark border border-gray-300 dark:border-white/10 rounded-2xl p-8 sm:p-12">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Privacy Policy</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: November 10, 2024</p>

                <div className="space-y-8 text-gray-600 dark:text-gray-400">
                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Information We Collect</h2>
                    <p className="mb-4">
                      We collect information that you provide directly to us, including when you create an account, use our services, or communicate with us. This may include:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Name and contact information</li>
                      <li>Account credentials</li>
                      <li>Scan targets and results</li>
                      <li>Usage data and analytics</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h2>
                    <p className="mb-4">
                      We use the information we collect to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Provide, maintain, and improve our services</li>
                      <li>Process and complete transactions</li>
                      <li>Send you technical notices and support messages</li>
                      <li>Respond to your comments and questions</li>
                      <li>Protect against fraudulent or illegal activity</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Data Security</h2>
                    <p>
                      We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All scan data is encrypted both in transit and at rest.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Data Retention</h2>
                    <p>
                      We retain your information for as long as necessary to provide our services and fulfill the purposes outlined in this policy. You may request deletion of your data at any time by contacting us.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Your Rights</h2>
                    <p className="mb-4">
                      You have the right to:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Access your personal information</li>
                      <li>Correct inaccurate data</li>
                      <li>Request deletion of your data</li>
                      <li>Object to processing of your data</li>
                      <li>Export your data</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Contact Us</h2>
                    <p>
                      If you have any questions about this Privacy Policy, please contact us at privacy@ciphersuite.com
                    </p>
                  </section>
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
