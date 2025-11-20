'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-black">
      <div className="flex h-full grow flex-col">
        <div className="flex flex-1 justify-center py-5 sm:px-4 md:px-8 lg:px-20 xl:px-40">
          <div className="flex w-full max-w-7xl flex-1 flex-col">
            <Header />

            <main className="flex-grow p-4 sm:p-6 md:p-12 lg:p-16">
              <div className="flex flex-col gap-8">
                <div className="text-center">
                  <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">Contact Us</h1>
                  <p className="text-lg text-white/60 max-w-2xl mx-auto">
                    Have questions about Cipher Suite? We're here to help. Reach out to our team.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl bg-surface-elevated border border-primary/20 text-center">
                    <div className="flex items-center justify-center size-16 rounded-xl bg-primary/10 text-primary border border-primary/20 mx-auto mb-4">
                      📧
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Email</h3>
                    <p className="text-white/60">support@ciphersuite.com</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-surface-elevated border border-primary/20 text-center">
                    <div className="flex items-center justify-center size-16 rounded-xl bg-primary/10 text-primary border border-primary/20 mx-auto mb-4">
                      📧
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Phone</h3>
                    <p className="text-white/60">+1 (555) 123-4567</p>
                  </div>

                  <div className="p-6 rounded-2xl bg-surface-elevated border border-primary/20 text-center">
                    <div className="flex items-center justify-center size-16 rounded-xl bg-primary/10 text-primary border border-primary/20 mx-auto mb-4">
                      📧
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Office</h3>
                    <p className="text-white/60">San Francisco, CA</p>
                  </div>
                </div>

                <div className="bg-surface-elevated border border-primary/20 rounded-2xl p-8 sm:p-12">
                  <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>
                  
                  {submitted ? (
                    <div className="p-6 rounded-lg bg-primary/10 border border-green-500/20 text-center">
                      <p className="text-lg font-medium text-primary">Thank you! Your message has been sent successfully.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Name
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-primary/20 bg-black text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="John Doe"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="w-full px-4 py-3 rounded-lg border border-primary/20 bg-black text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          value={formData.subject}
                          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                          required
                          className="w-full px-4 py-3 rounded-lg border border-primary/20 bg-black text-white focus:outline-none focus:ring-2 focus:ring-primary"
                          placeholder="How can we help?"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Message
                        </label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          required
                          rows={6}
                          className="w-full px-4 py-3 rounded-lg border border-primary/20 bg-black text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                          placeholder="Tell us more about your inquiry..."
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-lg bg-primary text-white font-bold hover:bg-gold-light transition-colors"
                      >
                        📤
                        Send Message
                      </button>
                    </form>
                  )}
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
