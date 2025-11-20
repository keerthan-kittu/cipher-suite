import Header from '../components/Header';
import Footer from '../components/Footer';

export default function TermsPage() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-black">
      <div className="flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 sm:px-4 md:px-8 lg:px-20 xl:px-40">
          <div className="flex w-full max-w-7xl flex-1 flex-col">
            <Header />

            <main className="flex-grow p-4 sm:p-6 md:p-12 lg:p-16">
              <div className="bg-surface-elevated border border-primary/20 rounded-2xl p-8 sm:p-12">
                <h1 className="text-4xl font-bold text-white mb-6">Terms of Service</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">Last updated: November 10, 2024</p>

                <div className="space-y-8 text-white/60">
                  <section>
                    <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                    <p>
                      By accessing and using Cipher Suite, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
                    <p className="mb-4">
                      Permission is granted to temporarily use Cipher Suite for personal or commercial security testing purposes. This license shall automatically terminate if you violate any of these restrictions:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>You must have authorization to scan target systems</li>
                      <li>You may not use the service for illegal activities</li>
                      <li>You may not attempt to bypass security measures</li>
                      <li>You may not resell or redistribute our services</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-white mb-4">3. Authorized Use Only</h2>
                    <p>
                      You agree to use Cipher Suite only on systems and networks for which you have explicit authorization. Unauthorized scanning or testing may be illegal in your jurisdiction. You are solely responsible for ensuring compliance with all applicable laws.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-white mb-4">4. Service Availability</h2>
                    <p>
                      We strive to maintain high availability but do not guarantee uninterrupted access to our services. We reserve the right to modify, suspend, or discontinue any aspect of the service at any time.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-white mb-4">5. Limitation of Liability</h2>
                    <p>
                      Cipher Suite and its suppliers shall not be liable for any damages arising from the use or inability to use our services. This includes but is not limited to direct, indirect, incidental, punitive, and consequential damages.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-white mb-4">6. Account Termination</h2>
                    <p>
                      We reserve the right to terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-white mb-4">7. Changes to Terms</h2>
                    <p>
                      We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the service. Continued use of the service after changes constitutes acceptance of the new terms.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold text-white mb-4">8. Contact Information</h2>
                    <p>
                      Questions about the Terms of Service should be sent to legal@ciphersuite.com
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
